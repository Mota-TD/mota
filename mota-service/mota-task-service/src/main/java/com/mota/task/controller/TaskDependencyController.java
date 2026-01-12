package com.mota.task.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresLogin;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.task.entity.TaskDependency;
import com.mota.task.service.TaskDependencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 任务依赖控制器
 */
@Tag(name = "任务依赖管理", description = "任务依赖关系的CRUD接口")
@RestController
@RequestMapping("/api/v1/task-dependencies")
@RequiredArgsConstructor
@RequiresLogin
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;

    @Operation(summary = "添加任务依赖")
    @PostMapping
    @RequiresPermission("task:update")
    public Result<TaskDependency> addDependency(
            @Parameter(description = "任务ID") @RequestParam Long taskId,
            @Parameter(description = "前置任务ID") @RequestParam Long predecessorId,
            @Parameter(description = "依赖类型：FS/SS/FF/SF") @RequestParam(defaultValue = "FS") String dependencyType,
            @Parameter(description = "延迟天数") @RequestParam(defaultValue = "0") Integer lagDays) {
        TaskDependency dependency = taskDependencyService.addDependency(taskId, predecessorId, dependencyType, lagDays);
        return Result.success(dependency);
    }

    @Operation(summary = "删除任务依赖")
    @DeleteMapping("/{dependencyId}")
    @RequiresPermission("task:update")
    public Result<Void> removeDependency(@PathVariable Long dependencyId) {
        taskDependencyService.removeDependency(dependencyId);
        return Result.success();
    }

    @Operation(summary = "删除任务的所有依赖")
    @DeleteMapping("/task/{taskId}/all")
    @RequiresPermission("task:update")
    public Result<Void> removeAllDependencies(@PathVariable Long taskId) {
        taskDependencyService.removeAllDependencies(taskId);
        return Result.success();
    }

    @Operation(summary = "获取任务的前置依赖")
    @GetMapping("/task/{taskId}/predecessors")
    public Result<List<TaskDependency>> getPredecessors(@PathVariable Long taskId) {
        List<TaskDependency> dependencies = taskDependencyService.getPredecessors(taskId);
        return Result.success(dependencies);
    }

    @Operation(summary = "获取任务的后置依赖")
    @GetMapping("/task/{taskId}/successors")
    public Result<List<TaskDependency>> getSuccessors(@PathVariable Long taskId) {
        List<TaskDependency> dependencies = taskDependencyService.getSuccessors(taskId);
        return Result.success(dependencies);
    }

    @Operation(summary = "检查是否存在循环依赖")
    @GetMapping("/check-circular")
    public Result<Boolean> checkCircularDependency(
            @Parameter(description = "任务ID") @RequestParam Long taskId,
            @Parameter(description = "前置任务ID") @RequestParam Long predecessorId) {
        boolean hasCircular = taskDependencyService.hasCircularDependency(taskId, predecessorId);
        return Result.success(hasCircular);
    }

    @Operation(summary = "获取项目的所有依赖关系")
    @GetMapping("/project/{projectId}")
    public Result<List<TaskDependency>> getProjectDependencies(@PathVariable Long projectId) {
        List<TaskDependency> dependencies = taskDependencyService.getProjectDependencies(projectId);
        return Result.success(dependencies);
    }

    @Operation(summary = "更新依赖类型")
    @PutMapping("/{dependencyId}/type")
    @RequiresPermission("task:update")
    public Result<Void> updateDependencyType(
            @PathVariable Long dependencyId,
            @Parameter(description = "依赖类型：FS/SS/FF/SF") @RequestParam String dependencyType) {
        taskDependencyService.updateDependencyType(dependencyId, dependencyType);
        return Result.success();
    }

    @Operation(summary = "更新延迟天数")
    @PutMapping("/{dependencyId}/lag")
    @RequiresPermission("task:update")
    public Result<Void> updateLagDays(
            @PathVariable Long dependencyId,
            @Parameter(description = "延迟天数") @RequestParam Integer lagDays) {
        taskDependencyService.updateLagDays(dependencyId, lagDays);
        return Result.success();
    }

    @Operation(summary = "批量添加依赖")
    @PostMapping("/batch")
    @RequiresPermission("task:update")
    public Result<Void> batchAddDependencies(
            @Parameter(description = "任务ID") @RequestParam Long taskId,
            @Parameter(description = "前置任务ID列表") @RequestParam List<Long> predecessorIds,
            @Parameter(description = "依赖类型") @RequestParam(defaultValue = "FS") String dependencyType) {
        taskDependencyService.batchAddDependencies(taskId, predecessorIds, dependencyType);
        return Result.success();
    }

    @Operation(summary = "获取关键路径")
    @GetMapping("/project/{projectId}/critical-path")
    public Result<List<Long>> getCriticalPath(@PathVariable Long projectId) {
        List<Long> criticalPath = taskDependencyService.getCriticalPath(projectId);
        return Result.success(criticalPath);
    }
}