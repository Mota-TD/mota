package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.entity.ProgressReport;
import com.mota.project.service.ProgressReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 进度汇报控制器
 */
@RestController
@RequestMapping("/api/v1/progress-reports")
@RequiredArgsConstructor
public class ProgressReportController {

    private final ProgressReportService progressReportService;

    /**
     * 获取进度汇报列表（分页）
     */
    @GetMapping
    public Result<IPage<ProgressReport>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long departmentTaskId,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false) String status) {
        Page<ProgressReport> pageParam = new Page<>(page, pageSize);
        IPage<ProgressReport> result = progressReportService.pageReports(
                pageParam, projectId, departmentTaskId, reportType, reporterId, status);
        return Result.success(result);
    }

    /**
     * 根据项目ID获取汇报列表
     */
    @GetMapping("/project/{projectId}")
    public Result<List<ProgressReport>> getByProjectId(@PathVariable Long projectId) {
        List<ProgressReport> reports = progressReportService.getByProjectId(projectId);
        return Result.success(reports);
    }

    /**
     * 根据部门任务ID获取汇报列表
     */
    @GetMapping("/department-task/{departmentTaskId}")
    public Result<List<ProgressReport>> getByDepartmentTaskId(@PathVariable Long departmentTaskId) {
        List<ProgressReport> reports = progressReportService.getByDepartmentTaskId(departmentTaskId);
        return Result.success(reports);
    }

    /**
     * 根据汇报人ID获取汇报列表
     */
    @GetMapping("/reporter/{reporterId}")
    public Result<List<ProgressReport>> getByReporterId(@PathVariable Long reporterId) {
        List<ProgressReport> reports = progressReportService.getByReporterId(reporterId);
        return Result.success(reports);
    }

    /**
     * 获取用户收到的汇报列表
     */
    @GetMapping("/received/{userId}")
    public Result<List<ProgressReport>> getReceivedReports(@PathVariable Long userId) {
        List<ProgressReport> reports = progressReportService.getReceivedReports(userId);
        return Result.success(reports);
    }

    /**
     * 获取进度汇报详情
     */
    @GetMapping("/{id}")
    public Result<ProgressReport> getById(@PathVariable Long id) {
        ProgressReport report = progressReportService.getDetailById(id);
        return Result.success(report);
    }

    /**
     * 创建进度汇报（草稿）
     */
    @PostMapping
    public Result<ProgressReport> create(@RequestBody ProgressReport report) {
        ProgressReport created = progressReportService.createReport(report);
        return Result.success(created);
    }

    /**
     * 更新进度汇报
     */
    @PutMapping("/{id}")
    public Result<ProgressReport> update(@PathVariable Long id, @RequestBody ProgressReport report) {
        report.setId(id);
        ProgressReport updated = progressReportService.updateReport(report);
        return Result.success(updated);
    }

    /**
     * 删除进度汇报
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = progressReportService.deleteReport(id);
        return Result.success(result);
    }

    /**
     * 提交进度汇报
     */
    @PostMapping("/{id}/submit")
    public Result<ProgressReport> submit(@PathVariable Long id) {
        ProgressReport report = progressReportService.submitReport(id);
        return Result.success(report);
    }

    /**
     * 标记汇报为已读
     */
    @PutMapping("/{id}/read")
    public Result<Boolean> markAsRead(@PathVariable Long id) {
        boolean result = progressReportService.markAsRead(id);
        return Result.success(result);
    }

    /**
     * 获取本周周报
     */
    @GetMapping("/project/{projectId}/weekly/current")
    public Result<ProgressReport> getCurrentWeekReport(
            @PathVariable Long projectId,
            @RequestParam Long reporterId) {
        ProgressReport report = progressReportService.getCurrentWeekReport(projectId, reporterId);
        return Result.success(report);
    }

    /**
     * 获取今日日报
     */
    @GetMapping("/project/{projectId}/daily/today")
    public Result<ProgressReport> getTodayReport(
            @PathVariable Long projectId,
            @RequestParam Long reporterId) {
        ProgressReport report = progressReportService.getTodayReport(projectId, reporterId);
        return Result.success(report);
    }
}