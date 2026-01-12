package com.mota.task.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresLogin;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.task.entity.WorkflowStatus;
import com.mota.task.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工作流控制器
 */
@Tag(name = "工作流管理", description = "工作流状态的CRUD接口")
@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
@RequiresLogin
public class WorkflowController {

    private final WorkflowService workflowService;

    @Operation(summary = "创建工作流状态")
    @PostMapping("/status")
    @RequiresPermission("workflow:manage")
    public Result<WorkflowStatus> createStatus(
            @Parameter(description = "项目ID") @RequestParam Long projectId,
            @Parameter(description = "状态名称") @RequestParam String name,
            @Parameter(description = "状态颜色") @RequestParam(required = false) String color,
            @Parameter(description = "状态分类：todo/in_progress/done") @RequestParam(required = false) String category) {
        WorkflowStatus status = workflowService.createStatus(projectId, name, color, category);
        return Result.success(status);
    }

    @Operation(summary = "更新工作流状态")
    @PutMapping("/status/{statusId}")
    @RequiresPermission("workflow:manage")
    public Result<WorkflowStatus> updateStatus(
            @PathVariable Long statusId,
            @Parameter(description = "状态名称") @RequestParam(required = false) String name,
            @Parameter(description = "状态颜色") @RequestParam(required = false) String color,
            @Parameter(description = "状态分类") @RequestParam(required = false) String category) {
        WorkflowStatus status = workflowService.updateStatus(statusId, name, color, category);
        return Result.success(status);
    }

    @Operation(summary = "删除工作流状态")
    @DeleteMapping("/status/{statusId}")
    @RequiresPermission("workflow:manage")
    public Result<Void> deleteStatus(@PathVariable Long statusId) {
        workflowService.deleteStatus(statusId);
        return Result.success();
    }

    @Operation(summary = "获取项目的工作流状态列表")
    @GetMapping("/project/{projectId}/statuses")
    public Result<List<WorkflowStatus>> getStatusesByProject(@PathVariable Long projectId) {
        List<WorkflowStatus> statuses = workflowService.getStatusesByProject(projectId);
        return Result.success(statuses);
    }

    @Operation(summary = "获取租户的默认工作流状态")
    @GetMapping("/tenant/{tenantId}/default-statuses")
    public Result<List<WorkflowStatus>> getDefaultStatuses(@PathVariable Long tenantId) {
        List<WorkflowStatus> statuses = workflowService.getDefaultStatuses(tenantId);
        return Result.success(statuses);
    }

    @Operation(summary = "初始化项目工作流")
    @PostMapping("/project/{projectId}/init")
    @RequiresPermission("workflow:manage")
    public Result<Void> initProjectWorkflow(@PathVariable Long projectId) {
        workflowService.initProjectWorkflow(projectId);
        return Result.success();
    }

    @Operation(summary = "设置初始状态")
    @PutMapping("/project/{projectId}/initial-status")
    @RequiresPermission("workflow:manage")
    public Result<Void> setInitialStatus(
            @PathVariable Long projectId,
            @Parameter(description = "状态ID") @RequestParam Long statusId) {
        workflowService.setInitialStatus(projectId, statusId);
        return Result.success();
    }

    @Operation(summary = "设置完成状态")
    @PutMapping("/status/{statusId}/final")
    @RequiresPermission("workflow:manage")
    public Result<Void> setFinalStatus(
            @PathVariable Long statusId,
            @Parameter(description = "是否为完成状态") @RequestParam boolean isFinal) {
        workflowService.setFinalStatus(statusId, isFinal);
        return Result.success();
    }

    @Operation(summary = "获取初始状态")
    @GetMapping("/project/{projectId}/initial-status")
    public Result<WorkflowStatus> getInitialStatus(@PathVariable Long projectId) {
        WorkflowStatus status = workflowService.getInitialStatus(projectId);
        return Result.success(status);
    }

    @Operation(summary = "获取完成状态列表")
    @GetMapping("/project/{projectId}/final-statuses")
    public Result<List<WorkflowStatus>> getFinalStatuses(@PathVariable Long projectId) {
        List<WorkflowStatus> statuses = workflowService.getFinalStatuses(projectId);
        return Result.success(statuses);
    }

    @Operation(summary = "调整状态顺序")
    @PutMapping("/project/{projectId}/statuses/reorder")
    @RequiresPermission("workflow:manage")
    public Result<Void> reorderStatuses(
            @PathVariable Long projectId,
            @Parameter(description = "状态ID列表（按新顺序）") @RequestParam List<Long> statusIds) {
        workflowService.reorderStatuses(projectId, statusIds);
        return Result.success();
    }

    @Operation(summary = "检查状态是否可以删除")
    @GetMapping("/status/{statusId}/can-delete")
    public Result<Boolean> canDeleteStatus(@PathVariable Long statusId) {
        boolean canDelete = workflowService.canDeleteStatus(statusId);
        return Result.success(canDelete);
    }

    @Operation(summary = "迁移任务状态")
    @PostMapping("/status/migrate")
    @RequiresPermission("workflow:manage")
    public Result<Void> migrateTaskStatus(
            @Parameter(description = "源状态ID") @RequestParam Long fromStatusId,
            @Parameter(description = "目标状态ID") @RequestParam Long toStatusId) {
        workflowService.migrateTaskStatus(fromStatusId, toStatusId);
        return Result.success();
    }

    @Operation(summary = "复制工作流到另一个项目")
    @PostMapping("/project/{sourceProjectId}/copy")
    @RequiresPermission("workflow:manage")
    public Result<Void> copyWorkflow(
            @PathVariable Long sourceProjectId,
            @Parameter(description = "目标项目ID") @RequestParam Long targetProjectId) {
        workflowService.copyWorkflow(sourceProjectId, targetProjectId);
        return Result.success();
    }

    @Operation(summary = "创建默认工作流模板")
    @PostMapping("/tenant/{tenantId}/default-template")
    @RequiresPermission("workflow:manage")
    public Result<Void> createDefaultTemplate(@PathVariable Long tenantId) {
        workflowService.createDefaultTemplate(tenantId);
        return Result.success();
    }
}