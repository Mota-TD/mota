package com.mota.task.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.task.dto.request.MilestoneTaskProgressUpdateRequest;
import com.mota.task.entity.MilestoneTask;
import com.mota.task.entity.MilestoneTaskAttachment;
import com.mota.task.entity.MilestoneTaskProgressRecord;
import com.mota.task.service.MilestoneTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 里程碑任务控制器
 */
@Slf4j
@Tag(name = "里程碑任务管理", description = "里程碑任务的增删改查和状态管理")
@RestController
@RequestMapping("/api/v1/milestone-tasks")
@RequiredArgsConstructor
public class MilestoneTaskController {

    private final MilestoneTaskService milestoneTaskService;

    // ==================== 任务查询 ====================

    /**
     * 获取里程碑任务列表
     */
    @Operation(summary = "获取里程碑任务列表", description = "获取指定里程碑的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/milestone/{milestoneId}")
    public Result<List<MilestoneTask>> getByMilestoneId(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long milestoneId) {
        List<MilestoneTask> tasks = milestoneTaskService.getByMilestoneId(milestoneId);
        return Result.success(tasks);
    }

    /**
     * 获取项目任务列表
     */
    @Operation(summary = "获取项目任务列表", description = "获取指定项目的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<MilestoneTask>> getByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<MilestoneTask> tasks = milestoneTaskService.getByProjectId(projectId);
        return Result.success(tasks);
    }

    /**
     * 获取当前用户负责的里程碑任务
     */
    @Operation(summary = "获取我的里程碑任务", description = "获取当前登录用户负责的里程碑任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/my")
    public Result<List<MilestoneTask>> getMyTasks(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        log.info("getMyTasks called, X-User-Id header: {}", headerUserId);
        Long currentUserId = headerUserId;
        if (currentUserId == null) {
            try {
                currentUserId = SecurityUtils.getUserId();
                log.info("Got userId from SecurityUtils: {}", currentUserId);
            } catch (Exception e) {
                log.warn("Failed to get userId from SecurityUtils, using default 1L: {}", e.getMessage());
                currentUserId = 1L;
            }
        }
        try {
            log.info("Querying milestone tasks for userId: {}", currentUserId);
            List<MilestoneTask> tasks = milestoneTaskService.getByAssigneeId(currentUserId);
            log.info("Found {} milestone tasks for userId: {}", tasks.size(), currentUserId);
            return Result.success(tasks);
        } catch (Exception e) {
            log.error("Failed to query milestone tasks for userId: {}, error: {}", currentUserId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 获取用户的任务列表
     */
    @Operation(summary = "获取用户任务列表", description = "获取指定用户负责的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/assignee/{userId}")
    public Result<List<MilestoneTask>> getByAssigneeId(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {
        List<MilestoneTask> tasks = milestoneTaskService.getByAssigneeId(userId);
        return Result.success(tasks);
    }

    /**
     * 获取任务详情
     */
    @Operation(summary = "获取任务详情", description = "获取任务详细信息，包含子任务和附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{taskId}")
    public Result<MilestoneTask> getDetail(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        MilestoneTask task = milestoneTaskService.getDetailById(taskId);
        return Result.success(task);
    }

    /**
     * 获取子任务列表
     */
    @Operation(summary = "获取子任务列表", description = "获取指定任务的所有子任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{taskId}/subtasks")
    public Result<List<MilestoneTask>> getSubTasks(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneTask> subTasks = milestoneTaskService.getSubTasks(taskId);
        return Result.success(subTasks);
    }

    // ==================== 任务创建和更新 ====================

    /**
     * 创建里程碑任务
     */
    @Operation(summary = "创建里程碑任务", description = "为里程碑创建一个新任务")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping("/milestone/{milestoneId}")
    public Result<MilestoneTask> create(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long milestoneId,
            @RequestBody MilestoneTask task,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        task.setMilestoneId(milestoneId);
        
        // 如果没有指定负责人，自动分配给当前用户
        if (task.getAssigneeId() == null) {
            Long currentUserId = headerUserId;
            if (currentUserId == null) {
                try {
                    currentUserId = SecurityUtils.getUserId();
                } catch (Exception e) {
                    log.warn("Failed to get userId for auto-assign, task will have no assignee", e);
                }
            }
            if (currentUserId != null) {
                task.setAssigneeId(currentUserId);
                log.info("Auto-assigned task to userId: {}", currentUserId);
            }
        }
        
        MilestoneTask created = milestoneTaskService.createTask(task);
        return Result.success(created);
    }

    /**
     * 创建子任务
     */
    @Operation(summary = "创建子任务", description = "为任务创建一个子任务")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping("/{taskId}/subtasks")
    public Result<MilestoneTask> createSubTask(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long taskId,
            @RequestBody MilestoneTask task,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        // 如果没有指定负责人，自动分配给当前用户
        if (task.getAssigneeId() == null) {
            Long currentUserId = headerUserId;
            if (currentUserId == null) {
                try {
                    currentUserId = SecurityUtils.getUserId();
                } catch (Exception e) {
                    log.warn("Failed to get userId for auto-assign, subtask will have no assignee", e);
                }
            }
            if (currentUserId != null) {
                task.setAssigneeId(currentUserId);
                log.info("Auto-assigned subtask to userId: {}", currentUserId);
            }
        }
        
        MilestoneTask created = milestoneTaskService.createSubTask(taskId, task);
        return Result.success(created);
    }

    /**
     * 更新任务
     */
    @Operation(summary = "更新任务", description = "更新任务信息")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{taskId}")
    public Result<MilestoneTask> update(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody MilestoneTask task) {
        task.setId(taskId);
        MilestoneTask updated = milestoneTaskService.updateTask(task);
        return Result.success(updated);
    }

    /**
     * 删除任务
     */
    @Operation(summary = "删除任务", description = "删除指定任务")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/{taskId}")
    public Result<Boolean> delete(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        boolean result = milestoneTaskService.deleteTask(taskId);
        return Result.success(result);
    }

    // ==================== 任务状态管理 ====================

    /**
     * 更新任务进度（简单版本）
     */
    @Operation(summary = "更新任务进度", description = "更新任务的完成进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{taskId}/progress")
    public Result<Boolean> updateProgress(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody Map<String, Integer> body) {
        Integer progress = body.get("progress");
        boolean result = milestoneTaskService.updateTaskProgress(taskId, progress);
        return Result.success(result);
    }

    /**
     * 更新任务进度（增强版本，支持描述和附件）
     */
    @Operation(summary = "更新任务进度（增强版）", description = "更新任务进度，支持富文本描述和附件上传")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PostMapping("/{taskId}/progress-update")
    public Result<MilestoneTaskProgressRecord> updateProgressEnhanced(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody MilestoneTaskProgressUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        Long currentUserId = headerUserId;
        if (currentUserId == null) {
            try {
                currentUserId = SecurityUtils.getUserId();
            } catch (Exception e) {
                log.warn("Failed to get userId for progress update", e);
            }
        }
        
        MilestoneTaskProgressRecord record = milestoneTaskService.updateTaskProgressEnhanced(
                taskId, request, currentUserId);
        return Result.success(record);
    }

    /**
     * 获取任务进度更新历史
     */
    @Operation(summary = "获取进度更新历史", description = "获取任务的进度更新历史记录")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{taskId}/progress-history")
    public Result<List<MilestoneTaskProgressRecord>> getProgressHistory(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneTaskProgressRecord> records = milestoneTaskService.getProgressHistory(taskId);
        return Result.success(records);
    }

    /**
     * 更新任务状态
     */
    @Operation(summary = "更新任务状态", description = "更新任务的状态")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{taskId}/status")
    public Result<Boolean> updateStatus(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        boolean result = milestoneTaskService.updateTaskStatus(taskId, status);
        return Result.success(result);
    }

    /**
     * 完成任务
     */
    @Operation(summary = "完成任务", description = "将任务标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/{taskId}/complete")
    public Result<MilestoneTask> complete(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        MilestoneTask task = milestoneTaskService.completeTask(taskId);
        return Result.success(task);
    }

    /**
     * 分配任务
     */
    @Operation(summary = "分配任务", description = "将任务分配给指定用户")
    @ApiResponse(responseCode = "200", description = "分配成功")
    @PutMapping("/{taskId}/assign")
    public Result<Boolean> assign(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        boolean result = milestoneTaskService.assignTask(taskId, userId);
        return Result.success(result);
    }

    // ==================== 附件管理 ====================

    /**
     * 获取任务附件列表
     */
    @Operation(summary = "获取任务附件", description = "获取任务的所有附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{taskId}/attachments")
    public Result<List<MilestoneTaskAttachment>> getAttachments(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneTaskAttachment> attachments = milestoneTaskService.getAttachments(taskId);
        return Result.success(attachments);
    }

    /**
     * 获取任务执行方案
     */
    @Operation(summary = "获取执行方案", description = "获取任务的执行方案附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{taskId}/execution-plans")
    public Result<List<MilestoneTaskAttachment>> getExecutionPlans(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneTaskAttachment> plans = milestoneTaskService.getExecutionPlans(taskId);
        return Result.success(plans);
    }

    /**
     * 添加任务附件
     */
    @Operation(summary = "添加任务附件", description = "为任务添加附件")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{taskId}/attachments")
    public Result<MilestoneTaskAttachment> addAttachment(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody MilestoneTaskAttachment attachment) {
        MilestoneTaskAttachment created = milestoneTaskService.addAttachment(taskId, attachment);
        return Result.success(created);
    }

    /**
     * 删除任务附件
     */
    @Operation(summary = "删除任务附件", description = "删除指定附件")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/attachments/{attachmentId}")
    public Result<Boolean> deleteAttachment(
            @Parameter(description = "附件ID", required = true) @PathVariable Long attachmentId) {
        boolean result = milestoneTaskService.deleteAttachment(attachmentId);
        return Result.success(result);
    }

    // ==================== 统计接口（供项目服务调用） ====================

    /**
     * 统计里程碑的任务数量
     */
    @Operation(summary = "统计里程碑任务数量", description = "获取里程碑的任务总数")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/milestone/{milestoneId}/count")
    public Result<Integer> countByMilestoneId(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long milestoneId) {
        int count = milestoneTaskService.countByMilestoneId(milestoneId);
        return Result.success(count);
    }

    /**
     * 统计里程碑已完成的任务数量
     */
    @Operation(summary = "统计已完成任务数量", description = "获取里程碑已完成的任务数量")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/milestone/{milestoneId}/completed-count")
    public Result<Integer> countCompletedByMilestoneId(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long milestoneId) {
        int count = milestoneTaskService.countCompletedByMilestoneId(milestoneId);
        return Result.success(count);
    }

    /**
     * 计算里程碑的进度
     */
    @Operation(summary = "计算里程碑进度", description = "根据任务完成情况计算里程碑进度")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/milestone/{milestoneId}/progress")
    public Result<Integer> calculateMilestoneProgress(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long milestoneId) {
        int progress = milestoneTaskService.calculateMilestoneProgress(milestoneId);
        return Result.success(progress);
    }
}