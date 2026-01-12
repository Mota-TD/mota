package com.mota.report.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.report.entity.Report;
import com.mota.report.entity.ReportTemplate;
import com.mota.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 报表控制器
 *
 * @author mota
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // ==================== 报表模板 ====================

    /**
     * 创建报表模板
     */
    @PostMapping("/templates")
    public Result<ReportTemplate> createTemplate(@RequestBody ReportTemplate template) {
        template.setTenantId(SecurityUtils.getTenantId());
        template.setCreatedBy(SecurityUtils.getUserId());
        return Result.success(reportService.createTemplate(template));
    }

    /**
     * 更新报表模板
     */
    @PutMapping("/templates/{id}")
    public Result<ReportTemplate> updateTemplate(@PathVariable Long id, @RequestBody ReportTemplate template) {
        template.setId(id);
        template.setUpdatedBy(SecurityUtils.getUserId());
        return Result.success(reportService.updateTemplate(template));
    }

    /**
     * 删除报表模板
     */
    @DeleteMapping("/templates/{id}")
    public Result<Void> deleteTemplate(@PathVariable Long id) {
        reportService.deleteTemplate(id);
        return Result.success();
    }

    /**
     * 获取报表模板
     */
    @GetMapping("/templates/{id}")
    public Result<ReportTemplate> getTemplate(@PathVariable Long id) {
        return Result.success(reportService.getTemplate(id));
    }

    /**
     * 分页查询报表模板
     */
    @GetMapping("/templates")
    public Result<IPage<ReportTemplate>> queryTemplates(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type) {
        Page<ReportTemplate> pageParam = new Page<>(page, size);
        return Result.success(reportService.queryTemplates(pageParam, SecurityUtils.getTenantId(), 
            keyword, category, type));
    }

    // ==================== 报表实例 ====================

    /**
     * 生成报表
     */
    @PostMapping("/generate")
    public Result<Report> generateReport(@RequestBody Map<String, Object> request) {
        Long templateId = Long.valueOf(request.get("templateId").toString());
        String name = (String) request.get("name");
        @SuppressWarnings("unchecked")
        Map<String, Object> params = (Map<String, Object>) request.get("params");
        
        Report report = reportService.generateReport(templateId, name, params, 
            SecurityUtils.getUserId(), SecurityUtils.getTenantId());
        return Result.success(report);
    }

    /**
     * 获取报表
     */
    @GetMapping("/{id}")
    public Result<Report> getReport(@PathVariable Long id) {
        return Result.success(reportService.getReport(id));
    }

    /**
     * 分页查询报表
     */
    @GetMapping
    public Result<IPage<Report>> queryReports(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean onlyMine) {
        Page<Report> pageParam = new Page<>(page, size);
        Long userId = Boolean.TRUE.equals(onlyMine) ? SecurityUtils.getUserId() : null;
        return Result.success(reportService.queryReports(pageParam, SecurityUtils.getTenantId(), 
            userId, templateId, status, keyword));
    }

    /**
     * 删除报表
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return Result.success();
    }

    /**
     * 下载报表
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) {
        Report report = reportService.getReport(id);
        byte[] data = reportService.downloadReport(id);
        
        String filename = report.getName() + "." + report.getFileFormat();
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(getMediaType(report.getFileFormat()))
            .body(data);
    }

    /**
     * 预览报表数据
     */
    @PostMapping("/preview")
    public Result<Map<String, Object>> previewReport(@RequestBody Map<String, Object> request) {
        Long templateId = Long.valueOf(request.get("templateId").toString());
        @SuppressWarnings("unchecked")
        Map<String, Object> params = (Map<String, Object>) request.get("params");
        
        return Result.success(reportService.previewReport(templateId, params, SecurityUtils.getTenantId()));
    }

    private MediaType getMediaType(String format) {
        if (format == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        switch (format.toLowerCase()) {
            case "xlsx":
            case "excel":
                return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case "pdf":
                return MediaType.APPLICATION_PDF;
            case "docx":
            case "word":
                return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            case "html":
                return MediaType.TEXT_HTML;
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}