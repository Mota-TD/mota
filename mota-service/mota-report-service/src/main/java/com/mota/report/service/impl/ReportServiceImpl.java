package com.mota.report.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.common.core.exception.BusinessException;
import com.mota.report.entity.Report;
import com.mota.report.entity.ReportTemplate;
import com.mota.report.mapper.ReportMapper;
import com.mota.report.mapper.ReportTemplateMapper;
import com.mota.report.service.ReportGenerateService;
import com.mota.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 报表服务实现
 *
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportTemplateMapper templateMapper;
    private final ReportMapper reportMapper;
    private final ReportGenerateService generateService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ReportTemplate createTemplate(ReportTemplate template) {
        // 检查编码是否重复
        if (template.getCode() != null) {
            ReportTemplate existing = templateMapper.findByCode(template.getCode(), template.getTenantId());
            if (existing != null) {
                throw new BusinessException("模板编码已存在: " + template.getCode());
            }
        }
        
        template.setUsageCount(0);
        template.setStatus(1);
        template.setDeleted(false);
        templateMapper.insert(template);
        
        log.info("创建报表模板: id={}, name={}", template.getId(), template.getName());
        return template;
    }

    @Override
    @Transactional
    public ReportTemplate updateTemplate(ReportTemplate template) {
        ReportTemplate existing = templateMapper.selectById(template.getId());
        if (existing == null) {
            throw new BusinessException("模板不存在: " + template.getId());
        }
        
        // 检查编码是否重复
        if (template.getCode() != null && !template.getCode().equals(existing.getCode())) {
            ReportTemplate byCode = templateMapper.findByCode(template.getCode(), template.getTenantId());
            if (byCode != null) {
                throw new BusinessException("模板编码已存在: " + template.getCode());
            }
        }
        
        templateMapper.updateById(template);
        log.info("更新报表模板: id={}", template.getId());
        return template;
    }

    @Override
    @Transactional
    public void deleteTemplate(Long templateId) {
        ReportTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException("模板不存在: " + templateId);
        }
        
        if (template.getIsSystem()) {
            throw new BusinessException("系统模板不能删除");
        }
        
        templateMapper.deleteById(templateId);
        log.info("删除报表模板: id={}", templateId);
    }

    @Override
    public ReportTemplate getTemplate(Long templateId) {
        return templateMapper.selectById(templateId);
    }

    @Override
    public IPage<ReportTemplate> queryTemplates(Page<ReportTemplate> page, Long tenantId,
                                                 String keyword, String category, String type) {
        return templateMapper.findByCondition(page, tenantId, keyword, category, type);
    }

    @Override
    @Transactional
    public Report generateReport(Long templateId, String name, Map<String, Object> params, 
                                 Long userId, Long tenantId) {
        // 获取模板
        ReportTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException("模板不存在: " + templateId);
        }
        
        // 增加模板使用次数
        templateMapper.incrementUsageCount(templateId);
        
        // 创建报表实例
        Report report = new Report();
        report.setTenantId(tenantId);
        report.setTemplateId(templateId);
        report.setName(name != null ? name : template.getName() + "_" + System.currentTimeMillis());
        report.setGenerateType("manual");
        report.setStatus("pending");
        report.setViewCount(0);
        report.setDownloadCount(0);
        report.setCreatedBy(userId);
        report.setDeleted(false);
        
        // 设置过期时间（默认7天）
        report.setExpireAt(LocalDateTime.now().plusDays(7));
        
        try {
            if (params != null) {
                report.setQueryParams(objectMapper.writeValueAsString(params));
            }
        } catch (Exception e) {
            log.error("序列化查询参数失败", e);
        }
        
        reportMapper.insert(report);
        log.info("创建报表实例: id={}, templateId={}", report.getId(), templateId);
        
        // 同步生成报表
        generateService.generate(report, template);
        
        return report;
    }

    @Override
    @Async
    public void generateReportAsync(Long reportId) {
        Report report = reportMapper.selectById(reportId);
        if (report == null) {
            log.error("报表不存在: {}", reportId);
            return;
        }
        
        ReportTemplate template = templateMapper.selectById(report.getTemplateId());
        if (template == null) {
            log.error("模板不存在: {}", report.getTemplateId());
            report.setStatus("failed");
            report.setErrorMessage("模板不存在");
            reportMapper.updateById(report);
            return;
        }
        
        generateService.generate(report, template);
    }

    @Override
    public Report getReport(Long reportId) {
        Report report = reportMapper.selectById(reportId);
        if (report != null) {
            reportMapper.incrementViewCount(reportId);
        }
        return report;
    }

    @Override
    public IPage<Report> queryReports(Page<Report> page, Long tenantId, Long userId,
                                      Long templateId, String status, String keyword) {
        return reportMapper.findByCondition(page, tenantId, userId, templateId, status, keyword);
    }

    @Override
    @Transactional
    public void deleteReport(Long reportId) {
        Report report = reportMapper.selectById(reportId);
        if (report == null) {
            throw new BusinessException("报表不存在: " + reportId);
        }
        
        // 删除文件
        if (report.getFilePath() != null) {
            try {
                Files.deleteIfExists(new File(report.getFilePath()).toPath());
            } catch (IOException e) {
                log.warn("删除报表文件失败: {}", report.getFilePath(), e);
            }
        }
        
        reportMapper.deleteById(reportId);
        log.info("删除报表: id={}", reportId);
    }

    @Override
    public byte[] downloadReport(Long reportId) {
        Report report = reportMapper.selectById(reportId);
        if (report == null) {
            throw new BusinessException("报表不存在: " + reportId);
        }
        
        if (!"completed".equals(report.getStatus())) {
            throw new BusinessException("报表尚未生成完成");
        }
        
        if (report.getFilePath() == null) {
            throw new BusinessException("报表文件不存在");
        }
        
        try {
            File file = new File(report.getFilePath());
            if (!file.exists()) {
                throw new BusinessException("报表文件不存在");
            }
            
            reportMapper.incrementDownloadCount(reportId);
            return Files.readAllBytes(file.toPath());
            
        } catch (IOException e) {
            log.error("读取报表文件失败: {}", report.getFilePath(), e);
            throw new BusinessException("读取报表文件失败");
        }
    }

    @Override
    public Map<String, Object> previewReport(Long templateId, Map<String, Object> params, Long tenantId) {
        ReportTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException("模板不存在: " + templateId);
        }
        
        return generateService.fetchData(template, params);
    }
}