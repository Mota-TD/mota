package com.mota.report.task;

import com.mota.report.entity.Report;
import com.mota.report.entity.ReportSchedule;
import com.mota.report.entity.ReportTemplate;
import com.mota.report.mapper.ReportMapper;
import com.mota.report.mapper.ReportScheduleMapper;
import com.mota.report.mapper.ReportTemplateMapper;
import com.mota.report.service.ReportGenerateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

/**
 * 定时报表调度任务
 *
 * @author mota
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReportScheduleTask {

    private final ReportScheduleMapper scheduleMapper;
    private final ReportTemplateMapper templateMapper;
    private final ReportMapper reportMapper;
    private final ReportGenerateService generateService;

    /**
     * 每分钟检查需要执行的定时报表任务
     */
    @Scheduled(cron = "0 * * * * ?")
    public void executeScheduledReports() {
        log.debug("开始检查定时报表任务...");
        
        LocalDateTime now = LocalDateTime.now();
        List<ReportSchedule> dueSchedules = scheduleMapper.findDueSchedules(now);
        
        if (dueSchedules.isEmpty()) {
            return;
        }
        
        log.info("发现 {} 个待执行的定时报表任务", dueSchedules.size());
        
        for (ReportSchedule schedule : dueSchedules) {
            try {
                executeSchedule(schedule);
            } catch (Exception e) {
                log.error("执行定时报表任务失败: scheduleId={}", schedule.getId(), e);
                updateScheduleStatus(schedule, "failed");
            }
        }
    }

    /**
     * 执行单个定时任务
     */
    private void executeSchedule(ReportSchedule schedule) {
        log.info("开始执行定时报表任务: scheduleId={}, name={}", schedule.getId(), schedule.getName());
        
        // 获取模板
        ReportTemplate template = templateMapper.selectById(schedule.getTemplateId());
        if (template == null) {
            log.error("模板不存在: templateId={}", schedule.getTemplateId());
            updateScheduleStatus(schedule, "failed");
            return;
        }
        
        // 创建报表实例
        Report report = new Report();
        report.setTenantId(schedule.getTenantId());
        report.setTemplateId(schedule.getTemplateId());
        report.setName(schedule.getName() + "_" + LocalDateTime.now().toString().replace(":", "-"));
        report.setGenerateType("scheduled");
        report.setQueryParams(schedule.getQueryParams());
        report.setStatus("pending");
        report.setViewCount(0);
        report.setDownloadCount(0);
        report.setCreatedBy(schedule.getCreatedBy());
        report.setDeleted(false);
        
        // 设置过期时间
        if (schedule.getRetentionDays() != null && schedule.getRetentionDays() > 0) {
            report.setExpireAt(LocalDateTime.now().plusDays(schedule.getRetentionDays()));
        } else {
            report.setExpireAt(LocalDateTime.now().plusDays(30)); // 默认30天
        }
        
        reportMapper.insert(report);
        
        try {
            // 生成报表
            generateService.generate(report, template);
            
            // 发送通知
            sendNotification(schedule, report);
            
            // 更新任务状态
            updateScheduleStatus(schedule, "success");
            
            log.info("定时报表任务执行成功: scheduleId={}, reportId={}", schedule.getId(), report.getId());
            
        } catch (Exception e) {
            log.error("定时报表生成失败: scheduleId={}", schedule.getId(), e);
            updateScheduleStatus(schedule, "failed");
        }
        
        // 清理过期报表
        cleanupOldReports(schedule);
    }

    /**
     * 更新任务执行状态
     */
    private void updateScheduleStatus(ReportSchedule schedule, String status) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextTime = calculateNextExecuteTime(schedule);
        
        int successIncr = "success".equals(status) ? 1 : 0;
        int failIncr = "failed".equals(status) ? 1 : 0;
        
        scheduleMapper.updateExecuteStatus(
            schedule.getId(),
            now,
            status,
            nextTime,
            successIncr,
            failIncr
        );
    }

    /**
     * 计算下次执行时间
     */
    private LocalDateTime calculateNextExecuteTime(ReportSchedule schedule) {
        try {
            CronExpression cron = CronExpression.parse(schedule.getCronExpression());
            ZoneId zoneId = schedule.getTimezone() != null ? 
                ZoneId.of(schedule.getTimezone()) : ZoneId.systemDefault();
            
            return cron.next(LocalDateTime.now().atZone(zoneId).toLocalDateTime());
        } catch (Exception e) {
            log.error("解析Cron表达式失败: {}", schedule.getCronExpression(), e);
            // 默认1小时后重试
            return LocalDateTime.now().plusHours(1);
        }
    }

    /**
     * 发送通知
     */
    private void sendNotification(ReportSchedule schedule, Report report) {
        if (schedule.getNotifyType() == null) {
            return;
        }
        
        // TODO: 调用通知服务发送通知
        log.info("发送报表通知: scheduleId={}, notifyType={}", schedule.getId(), schedule.getNotifyType());
    }

    /**
     * 清理过期报表
     */
    private void cleanupOldReports(ReportSchedule schedule) {
        if (schedule.getMaxRetentionCount() == null || schedule.getMaxRetentionCount() <= 0) {
            return;
        }
        
        // TODO: 删除超过保留份数的旧报表
        log.debug("清理过期报表: scheduleId={}, maxCount={}", schedule.getId(), schedule.getMaxRetentionCount());
    }

    /**
     * 每天凌晨清理过期报表
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredReports() {
        log.info("开始清理过期报表...");
        
        LocalDateTime now = LocalDateTime.now();
        List<Report> expiredReports = reportMapper.findExpiredReports(now);
        
        int count = 0;
        for (Report report : expiredReports) {
            try {
                // 删除文件
                if (report.getFilePath() != null) {
                    java.io.File file = new java.io.File(report.getFilePath());
                    if (file.exists()) {
                        file.delete();
                    }
                }
                
                // 删除记录
                reportMapper.deleteById(report.getId());
                count++;
                
            } catch (Exception e) {
                log.error("删除过期报表失败: reportId={}", report.getId(), e);
            }
        }
        
        log.info("清理过期报表完成: 共删除 {} 个报表", count);
    }
}