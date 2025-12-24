package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.ProgressReport;
import com.mota.project.mapper.ProgressReportMapper;
import com.mota.project.service.ProgressReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

/**
 * 进度汇报服务实现
 */
@Service
@RequiredArgsConstructor
public class ProgressReportServiceImpl extends ServiceImpl<ProgressReportMapper, ProgressReport> implements ProgressReportService {

    @Override
    public IPage<ProgressReport> pageReports(Page<ProgressReport> page, Long projectId, Long departmentTaskId,
                                              String reportType, Long reporterId, String status) {
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(ProgressReport::getProjectId, projectId);
        }
        if (departmentTaskId != null) {
            wrapper.eq(ProgressReport::getDepartmentTaskId, departmentTaskId);
        }
        if (StringUtils.hasText(reportType)) {
            wrapper.eq(ProgressReport::getReportType, reportType);
        }
        if (reporterId != null) {
            wrapper.eq(ProgressReport::getReporterId, reporterId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(ProgressReport::getStatus, status);
        }
        
        wrapper.orderByDesc(ProgressReport::getCreatedAt);
        
        return page(page, wrapper);
    }

    @Override
    public List<ProgressReport> getByProjectId(Long projectId) {
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgressReport::getProjectId, projectId);
        wrapper.orderByDesc(ProgressReport::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<ProgressReport> getByDepartmentTaskId(Long departmentTaskId) {
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgressReport::getDepartmentTaskId, departmentTaskId);
        wrapper.orderByDesc(ProgressReport::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<ProgressReport> getByReporterId(Long reporterId) {
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgressReport::getReporterId, reporterId);
        wrapper.orderByDesc(ProgressReport::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<ProgressReport> getReceivedReports(Long userId) {
        // 查询接收人列表中包含该用户的汇报
        // 由于recipients是JSON数组，这里使用简单的LIKE查询
        // 实际生产环境可能需要更复杂的查询方式
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgressReport::getStatus, ProgressReport.Status.SUBMITTED)
               .or()
               .eq(ProgressReport::getStatus, ProgressReport.Status.READ);
        wrapper.orderByDesc(ProgressReport::getSubmittedAt);
        
        // TODO: 实现更精确的接收人过滤
        return list(wrapper);
    }

    @Override
    public ProgressReport getDetailById(Long id) {
        ProgressReport report = getById(id);
        if (report == null) {
            throw new BusinessException("进度汇报不存在");
        }
        return report;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProgressReport createReport(ProgressReport report) {
        // 设置默认值
        if (!StringUtils.hasText(report.getStatus())) {
            report.setStatus(ProgressReport.Status.DRAFT);
        }
        // TODO: 从当前登录用户获取
        if (report.getReporterId() == null) {
            report.setReporterId(1L);
        }
        
        save(report);
        return report;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProgressReport updateReport(ProgressReport report) {
        ProgressReport existing = getById(report.getId());
        if (existing == null) {
            throw new BusinessException("进度汇报不存在");
        }
        
        // 只有草稿状态可以修改
        if (!ProgressReport.Status.DRAFT.equals(existing.getStatus())) {
            throw new BusinessException("只有草稿状态的汇报可以修改");
        }
        
        if (report.getCompletedWork() != null) {
            existing.setCompletedWork(report.getCompletedWork());
        }
        if (report.getPlannedWork() != null) {
            existing.setPlannedWork(report.getPlannedWork());
        }
        if (report.getIssuesRisks() != null) {
            existing.setIssuesRisks(report.getIssuesRisks());
        }
        if (report.getSupportNeeded() != null) {
            existing.setSupportNeeded(report.getSupportNeeded());
        }
        if (report.getTaskProgress() != null) {
            existing.setTaskProgress(report.getTaskProgress());
        }
        if (report.getRecipients() != null) {
            existing.setRecipients(report.getRecipients());
        }
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteReport(Long id) {
        ProgressReport existing = getById(id);
        if (existing == null) {
            throw new BusinessException("进度汇报不存在");
        }
        
        // 只有草稿状态可以删除
        if (!ProgressReport.Status.DRAFT.equals(existing.getStatus())) {
            throw new BusinessException("只有草稿状态的汇报可以删除");
        }
        
        return removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProgressReport submitReport(Long id) {
        ProgressReport existing = getById(id);
        if (existing == null) {
            throw new BusinessException("进度汇报不存在");
        }
        
        // 只有草稿状态可以提交
        if (!ProgressReport.Status.DRAFT.equals(existing.getStatus())) {
            throw new BusinessException("只有草稿状态的汇报可以提交");
        }
        
        existing.setStatus(ProgressReport.Status.SUBMITTED);
        existing.setSubmittedAt(LocalDateTime.now());
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean markAsRead(Long id) {
        ProgressReport existing = getById(id);
        if (existing == null) {
            throw new BusinessException("进度汇报不存在");
        }
        
        if (ProgressReport.Status.SUBMITTED.equals(existing.getStatus())) {
            existing.setStatus(ProgressReport.Status.READ);
            return updateById(existing);
        }
        return true;
    }

    @Override
    public ProgressReport getCurrentWeekReport(Long projectId, Long reporterId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgressReport::getProjectId, projectId);
        wrapper.eq(ProgressReport::getReporterId, reporterId);
        wrapper.eq(ProgressReport::getReportType, ProgressReport.ReportType.WEEKLY);
        wrapper.ge(ProgressReport::getReportPeriodStart, weekStart);
        wrapper.le(ProgressReport::getReportPeriodEnd, weekEnd);
        wrapper.orderByDesc(ProgressReport::getCreatedAt);
        wrapper.last("LIMIT 1");
        
        return getOne(wrapper);
    }

    @Override
    public ProgressReport getTodayReport(Long projectId, Long reporterId) {
        LocalDate today = LocalDate.now();
        
        LambdaQueryWrapper<ProgressReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProgressReport::getProjectId, projectId);
        wrapper.eq(ProgressReport::getReporterId, reporterId);
        wrapper.eq(ProgressReport::getReportType, ProgressReport.ReportType.DAILY);
        wrapper.eq(ProgressReport::getReportPeriodStart, today);
        wrapper.orderByDesc(ProgressReport::getCreatedAt);
        wrapper.last("LIMIT 1");
        
        return getOne(wrapper);
    }
}