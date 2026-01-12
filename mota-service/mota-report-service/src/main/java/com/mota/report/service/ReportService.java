package com.mota.report.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.report.entity.Report;
import com.mota.report.entity.ReportTemplate;

import java.util.Map;

/**
 * 报表服务接口
 *
 * @author mota
 */
public interface ReportService {

    /**
     * 创建报表模板
     */
    ReportTemplate createTemplate(ReportTemplate template);

    /**
     * 更新报表模板
     */
    ReportTemplate updateTemplate(ReportTemplate template);

    /**
     * 删除报表模板
     */
    void deleteTemplate(Long templateId);

    /**
     * 获取报表模板
     */
    ReportTemplate getTemplate(Long templateId);

    /**
     * 分页查询模板
     */
    IPage<ReportTemplate> queryTemplates(Page<ReportTemplate> page, Long tenantId, 
                                         String keyword, String category, String type);

    /**
     * 生成报表
     */
    Report generateReport(Long templateId, String name, Map<String, Object> params, Long userId, Long tenantId);

    /**
     * 异步生成报表
     */
    void generateReportAsync(Long reportId);

    /**
     * 获取报表
     */
    Report getReport(Long reportId);

    /**
     * 分页查询报表
     */
    IPage<Report> queryReports(Page<Report> page, Long tenantId, Long userId, 
                               Long templateId, String status, String keyword);

    /**
     * 删除报表
     */
    void deleteReport(Long reportId);

    /**
     * 下载报表
     */
    byte[] downloadReport(Long reportId);

    /**
     * 预览报表数据
     */
    Map<String, Object> previewReport(Long templateId, Map<String, Object> params, Long tenantId);
}