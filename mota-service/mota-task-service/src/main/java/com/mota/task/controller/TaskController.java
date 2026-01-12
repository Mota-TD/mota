package com.mota.task.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresLogin;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.task.dto.TaskCreateRequest;
import com.mota.task.dto.TaskQueryRequest;
import com.mota.task.dto.TaskUpdateRequest;
import com.mota.task.dto.TaskVO;
import com.mota.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 任务控制器
 */
@Tag(name = "任务管理", description = "任务CRUD、状态管理、分配等接口")
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@RequiresLogin
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "创建任务")
    @PostMapping
    @RequiresPermission("task:create")
    public Result<TaskVO> createTask(@Validated @RequestBody TaskCreateRequest request) {
        TaskVO task = taskService.createTask(request);
        return Result.success(task);
    }

    @Operation(summary = "更新任务")
    @PutMapping
    @RequiresPermission("task:update")
    public Result<TaskVO> updateTask(@Validated @RequestBody TaskUpdateRequest request) {
        TaskVO task = taskService.updateTask(request);
        return Result.success(task);
    }

    @Operation(summary = "删除任务")
    @DeleteMapping("/{taskId}")
    @RequiresPermission("task:delete")
    public Result<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return Result.success();
    }

    @Operation(summary = "获取任务详情")
    @GetMapping("/{taskId}")
    public Result<TaskVO> getTaskDetail(@PathVariable Long taskId) {
        TaskVO task = taskService.getTaskDetail(taskId);
        return Result.success(task);
    }

    @Operation(summary = "分页查询任务")
    @PostMapping("/query")
    public Result<Page<TaskVO>> queryTasks(@RequestBody TaskQueryRequest request) {
        Page<TaskVO> page = taskService.queryTasks(request);
        return Result.success(page);
    }

    @Operation(summary = "获取项目的任务列表")
    @GetMapping("/project/{projectId}")
    public Result<List<TaskVO>> getTasksByProject(@PathVariable Long projectId) {
        List<TaskVO> tasks = taskService.getTasksByProject(projectId);
        return Result.success(tasks);
    }

    @Operation(summary = "获取里程碑的任务列表")
    @GetMapping("/milestone/{milestoneId}")
    public Result<List<TaskVO>> getTasksByMilestone(@PathVariable Long milestoneId) {
        List<TaskVO> tasks = taskService.getTasksByMilestone(milestoneId);
        return Result.success(tasks);
    }

    @Operation(summary = "获取用户负责的任务")
    @GetMapping("/assignee/{assigneeId}")
    public Result<List<TaskVO>> getTasksByAssignee(@PathVariable Long assigneeId) {
        List<TaskVO> tasks = taskService.getTasksByAssignee(assigneeId);
        return Result.success(tasks);
    }

    @Operation(summary = "获取Sprint的任务列表")
    @GetMapping("/sprint/{sprintId}")
    public Result<List<TaskVO>> getTasksBySprint(@PathVariable Long sprintId) {
        List<TaskVO> tasks = taskService.getTasksBySprint(sprintId);
        return Result.success(tasks);
    }

    @Operation(summary = "获取子任务列表")
    @GetMapping("/{taskId}/subtasks")
    public Result<List<TaskVO>> getSubtasks(@PathVariable Long taskId) {
        List<TaskVO> tasks = taskService.getSubtasks(taskId);
        return Result.success(tasks);
    }

    @Operation(summary = "更新任务状态")
    @PutMapping("/{taskId}/status")
    @RequiresPermission("task:update")
    public Result<Void> updateTaskStatus(
            @PathVariable Long taskId,
            @Parameter(description = "新状态") @RequestParam String status) {
        taskService.updateTaskStatus(taskId, status);
        return Result.success();
    }

    @Operation(summary = "更新任务进度")
    @PutMapping("/{taskId}/progress")
    @RequiresPermission("task:update")
    public Result<Void> updateTaskProgress(
            @PathVariable Long taskId,
            @Parameter(description = "进度百分比") @RequestParam Integer progress) {
        taskService.updateTaskProgress(taskId, progress);
        return Result.success();
    }

    @Operation(summary = "分配任务")
    @PutMapping("/{taskId}/assign")
    @RequiresPermission("task:assign")
    public Result<Void> assignTask(
            @PathVariable Long taskId,
            @Parameter(description = "负责人ID") @RequestParam Long assigneeId) {
        taskService.assignTask(taskId, assigneeId);
        return Result.success();
    }

    @Operation(summary = "批量分配任务")
    @PutMapping("/batch/assign")
    @RequiresPermission("task:assign")
    public Result<Void> batchAssignTasks(
            @Parameter(description = "任务ID列表") @RequestParam List<Long> taskIds,
            @Parameter(description = "负责人ID") @RequestParam Long assigneeId) {
        taskService.batchAssignTasks(taskIds, assigneeId);
        return Result.success();
    }

    @Operation(summary = "批量更新状态")
    @PutMapping("/batch/status")
    @RequiresPermission("task:update")
    public Result<Void> batchUpdateStatus(
            @Parameter(description = "任务ID列表") @RequestParam List<Long> taskIds,
            @Parameter(description = "新状态") @RequestParam String status) {
        taskService.batchUpdateStatus(taskIds, status);
        return Result.success();
    }

    @Operation(summary = "移动任务到Sprint")
    @PutMapping("/{taskId}/sprint")
    @RequiresPermission("task:update")
    public Result<Void> moveToSprint(
            @PathVariable Long taskId,
            @Parameter(description = "Sprint ID") @RequestParam Long sprintId) {
        taskService.moveToSprint(taskId, sprintId);
        return Result.success();
    }

    @Operation(summary = "批量移动任务到Sprint")
    @PutMapping("/batch/sprint")
    @RequiresPermission("task:update")
    public Result<Void> batchMoveToSprint(
            @Parameter(description = "任务ID列表") @RequestParam List<Long> taskIds,
            @Parameter(description = "Sprint ID") @RequestParam Long sprintId) {
        taskService.batchMoveToSprint(taskIds, sprintId);
        return Result.success();
    }

    @Operation(summary = "获取任务统计")
    @GetMapping("/statistics/{projectId}")
    public Result<Map<String, Object>> getTaskStatistics(@PathVariable Long projectId) {
        Map<String, Object> stats = taskService.getTaskStatistics(projectId);
        return Result.success(stats);
    }

    @Operation(summary = "获取逾期任务")
    @GetMapping("/overdue/{projectId}")
    public Result<List<TaskVO>> getOverdueTasks(@PathVariable Long projectId) {
        List<TaskVO> tasks = taskService.getOverdueTasks(projectId);
        return Result.success(tasks);
    }

    @Operation(summary = "获取即将到期的任务")
    @GetMapping("/upcoming/{projectId}")
    public Result<List<TaskVO>> getUpcomingTasks(
            @PathVariable Long projectId,
            @Parameter(description = "天数") @RequestParam(defaultValue = "7") Integer days) {
        List<TaskVO> tasks = taskService.getUpcomingTasks(projectId, days);
        return Result.success(tasks);
    }

    @Operation(summary = "复制任务")
    @PostMapping("/{taskId}/copy")
    @RequiresPermission("task:create")
    public Result<TaskVO> copyTask(
            @PathVariable Long taskId,
            @Parameter(description = "目标项目ID") @RequestParam Long targetProjectId) {
        TaskVO task = taskService.copyTask(taskId, targetProjectId);
        return Result.success(task);
    }

    @Operation(summary = "转换任务类型")
    @PutMapping("/{taskId}/type")
    @RequiresPermission("task:update")
    public Result<Void> convertTaskType(
            @PathVariable Long taskId,
            @Parameter(description = "新类型") @RequestParam String newType) {
        taskService.convertTaskType(taskId, newType);
        return Result.success();
    }
}