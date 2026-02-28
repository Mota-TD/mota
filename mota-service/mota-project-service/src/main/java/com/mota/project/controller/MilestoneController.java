package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.project.dto.ai.ProgressDescriptionRequest;
import com.mota.project.dto.ai.ProgressDescriptionResponse;
import com.mota.project.dto.request.MilestoneTaskProgressUpdateRequest;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.MilestoneAssignee;
import com.mota.project.entity.MilestoneComment;
import com.mota.project.entity.MilestoneTask;
import com.mota.project.entity.MilestoneTaskAttachment;
import com.mota.project.entity.MilestoneTaskProgressRecord;
import com.mota.project.service.MilestoneCommentService;
import com.mota.project.service.MilestoneService;
import com.mota.project.service.MilestoneTaskService;
import com.mota.project.service.ai.ClaudeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 里程碑控制器
 */
@Slf4j
@Tag(name = "里程碑管理", description = "项目里程碑的增删改查和状态管理")
@RestController
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;
    private final MilestoneTaskService milestoneTaskService;
    private final MilestoneCommentService milestoneCommentService;
    private final ClaudeService claudeService;

    /**
     * 获取里程碑列表（分页）
     */
    @Operation(summary = "获取里程碑列表", description = "分页获取里程碑列表，支持按项目和状态筛选")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "401", description = "未授权")
    })
    @GetMapping
    public Result<IPage<Milestone>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "里程碑状态") @RequestParam(required = false) String status) {
        Page<Milestone> pageParam = new Page<>(page, pageSize);
        IPage<Milestone> result = milestoneService.pageMilestones(pageParam, projectId, status);
        return Result.success(result);
    }

    /**
     * 获取当前用户负责的里程碑
     */
    @Operation(summary = "获取我的里程碑", description = "获取当前登录用户负责的里程碑列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/my")
    public Result<List<Milestone>> getMyMilestones(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        log.info("getMyMilestones called, X-User-Id header: {}", headerUserId);
        Long currentUserId = headerUserId;
        if (currentUserId == null) {
            try {
                currentUserId = SecurityUtils.getUserId();
                log.info("Got userId from SecurityUtils: {}", currentUserId);
            } catch (Exception e) {
                // 如果未登录，默认使用用户ID 1（开发环境）
                log.warn("Failed to get userId from SecurityUtils, using default 1L", e);
                currentUserId = 1L;
            }
        }
        log.info("Querying milestones for userId: {}", currentUserId);
        List<Milestone> milestones = milestoneService.getMilestonesByAssignee(currentUserId);
        log.info("Found {} milestones for userId: {}", milestones.size(), currentUserId);
        return Result.success(milestones);
    }

    /**
     * 获取当前用户负责的里程碑任务
     */
    @Operation(summary = "获取我的里程碑任务", description = "获取当前登录用户负责的里程碑任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/my-tasks")
    public Result<List<MilestoneTask>> getMyMilestoneTasks(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        log.info("getMyMilestoneTasks called, X-User-Id header: {}", headerUserId);
        Long currentUserId = headerUserId;
        if (currentUserId == null) {
            try {
                currentUserId = SecurityUtils.getUserId();
                log.info("Got userId from SecurityUtils: {}", currentUserId);
            } catch (Exception e) {
                // 如果未登录，默认使用用户ID 1（开发环境）
                log.warn("Failed to get userId from SecurityUtils, using default 1L: {}", e.getMessage(), e);
                currentUserId = 1L;
            }
        }
        try {
            log.info("Querying milestone tasks for userId: {}", currentUserId);
            
            // 1. 获取用户负责的里程碑任务
            List<MilestoneTask> tasks = new java.util.ArrayList<>(milestoneTaskService.getByAssigneeId(currentUserId));
            log.info("Found {} milestone tasks for userId: {}", tasks.size(), currentUserId);
            
            // 2. 获取用户作为里程碑负责人的里程碑，转换为虚拟任务
            List<Milestone> myMilestones = milestoneService.getMilestonesByAssignee(currentUserId);
            log.info("Found {} milestones where user {} is assignee", myMilestones.size(), currentUserId);
            
            for (Milestone milestone : myMilestones) {
                MilestoneTask virtualTask = new MilestoneTask();
                virtualTask.setId(milestone.getId());
                virtualTask.setMilestoneId(milestone.getId());
                virtualTask.setProjectId(milestone.getProjectId());
                virtualTask.setName("[里程碑] " + milestone.getName());
                virtualTask.setDescription(milestone.getDescription());
                virtualTask.setAssigneeId(currentUserId);
                virtualTask.setStatus(milestone.getStatus());
                virtualTask.setPriority("high"); // 里程碑默认高优先级
                virtualTask.setProgress(milestone.getProgress() != null ? milestone.getProgress() : 0);
                virtualTask.setDueDate(milestone.getTargetDate());
                virtualTask.setMilestoneName(milestone.getName());
                tasks.add(virtualTask);
            }
            
            log.info("Total tasks (including milestone virtual tasks) for userId: {}: {}", currentUserId, tasks.size());
            return Result.success(tasks);
        } catch (Exception e) {
            log.error("Failed to query milestone tasks for userId: {}, error: {}", currentUserId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 根据项目ID获取里程碑列表
     */
    @Operation(summary = "根据项目获取里程碑列表", description = "获取指定项目的所有里程碑")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<Milestone>> getByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @Parameter(description = "是否包含负责人信息") @RequestParam(defaultValue = "false") Boolean withAssignees) {
        List<Milestone> milestones;
        if (withAssignees) {
            milestones = milestoneService.getByProjectIdWithAssignees(projectId);
        } else {
            milestones = milestoneService.getByProjectId(projectId);
        }
        return Result.success(milestones);
    }

    /**
     * 获取里程碑详情
     */
    @Operation(summary = "获取里程碑详情", description = "根据ID获取里程碑详细信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "里程碑不存在")
    })
    @GetMapping("/{id}")
    public Result<Milestone> getById(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @Parameter(description = "是否包含负责人和任务信息") @RequestParam(defaultValue = "false") Boolean withDetails) {
        Milestone milestone;
        if (withDetails) {
            milestone = milestoneService.getDetailByIdWithAssignees(id);
        } else {
            milestone = milestoneService.getDetailById(id);
        }
        return Result.success(milestone);
    }

    /**
     * 创建里程碑
     * 自动将当前用户添加为主负责人
     */
    @Operation(summary = "创建里程碑", description = "创建一个新的里程碑，自动将当前用户添加为主负责人")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<Milestone> create(
            @RequestBody Milestone milestone,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        // 获取当前用户ID
        Long currentUserId = headerUserId;
        if (currentUserId == null) {
            try {
                currentUserId = SecurityUtils.getUserId();
            } catch (Exception e) {
                log.warn("Failed to get userId for auto-assign milestone, milestone will have no assignee", e);
            }
        }
        
        // 创建里程碑并自动添加当前用户为主负责人
        Milestone created;
        if (currentUserId != null) {
            log.info("Auto-assigning milestone to userId: {}", currentUserId);
            created = milestoneService.createMilestoneWithAssignees(milestone, List.of(currentUserId));
        } else {
            created = milestoneService.createMilestone(milestone);
        }
        return Result.success(created);
    }

    /**
     * 创建里程碑（包含负责人）
     */
    @Operation(summary = "创建里程碑（包含负责人）", description = "创建一个新的里程碑并指定负责人")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping("/with-assignees")
    public Result<Milestone> createWithAssignees(@RequestBody Map<String, Object> body) {
        Milestone milestone = new Milestone();
        milestone.setProjectId(Long.valueOf(body.get("projectId").toString()));
        milestone.setName((String) body.get("name"));
        milestone.setDescription((String) body.get("description"));
        if (body.get("targetDate") != null) {
            milestone.setTargetDate(java.time.LocalDate.parse(body.get("targetDate").toString()));
        }
        
        @SuppressWarnings("unchecked")
        List<Number> assigneeIds = (List<Number>) body.get("assigneeIds");
        List<Long> assigneeIdList = assigneeIds != null ?
            assigneeIds.stream().map(Number::longValue).toList() : null;
        
        Milestone created = milestoneService.createMilestoneWithAssignees(milestone, assigneeIdList);
        return Result.success(created);
    }

    /**
     * 更新里程碑
     */
    @Operation(summary = "更新里程碑", description = "更新里程碑信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "里程碑不存在")
    })
    @PutMapping("/{id}")
    public Result<Milestone> update(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @RequestBody Milestone milestone) {
        milestone.setId(id);
        Milestone updated = milestoneService.updateMilestone(milestone);
        return Result.success(updated);
    }

    /**
     * 删除里程碑
     */
    @Operation(summary = "删除里程碑", description = "根据ID删除里程碑")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "里程碑不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        boolean result = milestoneService.deleteMilestone(id);
        return Result.success(result);
    }

    /**
     * 完成里程碑
     */
    @Operation(summary = "完成里程碑", description = "将里程碑标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/{id}/complete")
    public Result<Milestone> complete(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        Milestone milestone = milestoneService.completeMilestone(id);
        return Result.success(milestone);
    }

    /**
     * 标记里程碑为延期
     */
    @Operation(summary = "标记里程碑延期", description = "将里程碑标记为延期状态")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/{id}/delay")
    public Result<Milestone> delay(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        Milestone milestone = milestoneService.delayMilestone(id);
        return Result.success(milestone);
    }

    /**
     * 更新里程碑进度（供任务服务调用）
     */
    @Operation(summary = "更新里程碑进度", description = "根据任务完成情况更新里程碑进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/progress")
    public Result<Void> updateMilestoneProgress(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @Parameter(description = "进度值") @RequestParam(required = false) Integer progress) {
        if (progress != null) {
            // 直接设置进度值
            Milestone milestone = milestoneService.getById(id);
            if (milestone != null) {
                milestone.setProgress(progress);
                milestoneService.updateById(milestone);
            }
        } else {
            // 根据任务自动计算进度
            milestoneService.updateMilestoneProgress(id);
        }
        return Result.success();
    }

    /**
     * 重新排序里程碑
     */
    @Operation(summary = "重新排序里程碑", description = "调整项目里程碑的顺序")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "排序成功"),
        @ApiResponse(responseCode = "400", description = "里程碑ID列表不能为空")
    })
    @PutMapping("/project/{projectId}/reorder")
    public Result<Boolean> reorder(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @RequestBody Map<String, List<Long>> body) {
        List<Long> milestoneIds = body.get("milestoneIds");
        if (milestoneIds == null || milestoneIds.isEmpty()) {
            return Result.fail("里程碑ID列表不能为空");
        }
        boolean result = milestoneService.reorderMilestones(projectId, milestoneIds);
        return Result.success(result);
    }

    /**
     * 获取即将到期的里程碑
     */
    @Operation(summary = "获取即将到期里程碑", description = "获取指定天数内即将到期的里程碑")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}/upcoming")
    public Result<List<Milestone>> getUpcoming(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @Parameter(description = "天数范围") @RequestParam(defaultValue = "7") Integer days) {
        List<Milestone> milestones = milestoneService.getUpcomingMilestones(projectId, days);
        return Result.success(milestones);
    }

    /**
     * 获取已延期的里程碑
     */
    @Operation(summary = "获取延期里程碑", description = "获取指定项目所有已延期的里程碑")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}/delayed")
    public Result<List<Milestone>> getDelayed(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<Milestone> milestones = milestoneService.getDelayedMilestones(projectId);
        return Result.success(milestones);
    }

    // ==================== 负责人管理 ====================

    /**
     * 获取里程碑负责人列表
     */
    @Operation(summary = "获取里程碑负责人", description = "获取指定里程碑的所有负责人")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}/assignees")
    public Result<List<MilestoneAssignee>> getAssignees(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        List<MilestoneAssignee> assignees = milestoneService.getMilestoneAssignees(id);
        return Result.success(assignees);
    }

    /**
     * 更新里程碑负责人
     */
    @Operation(summary = "更新里程碑负责人", description = "更新里程碑的负责人列表")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/assignees")
    public Result<Boolean> updateAssignees(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, List<Long>> body) {
        List<Long> assigneeIds = body.get("assigneeIds");
        boolean result = milestoneService.updateMilestoneAssignees(id, assigneeIds);
        return Result.success(result);
    }

    /**
     * 添加里程碑负责人
     */
    @Operation(summary = "添加里程碑负责人", description = "为里程碑添加一个负责人")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{id}/assignees")
    public Result<Boolean> addAssignee(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Boolean isPrimary = body.get("isPrimary") != null ? (Boolean) body.get("isPrimary") : false;
        boolean result = milestoneService.addMilestoneAssignee(id, userId, isPrimary);
        return Result.success(result);
    }

    /**
     * 移除里程碑负责人
     */
    @Operation(summary = "移除里程碑负责人", description = "从里程碑移除一个负责人")
    @ApiResponse(responseCode = "200", description = "移除成功")
    @DeleteMapping("/{id}/assignees/{userId}")
    public Result<Boolean> removeAssignee(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {
        boolean result = milestoneService.removeMilestoneAssignee(id, userId);
        return Result.success(result);
    }

    /**
     * 根据用户获取负责的里程碑
     */
    @Operation(summary = "获取用户负责的里程碑", description = "获取指定用户负责的所有里程碑")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/assignee/{userId}")
    public Result<List<Milestone>> getByAssignee(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {
        List<Milestone> milestones = milestoneService.getMilestonesByAssignee(userId);
        return Result.success(milestones);
    }

    // ==================== 任务管理 ====================

    /**
     * 获取里程碑任务列表
     */
    @Operation(summary = "获取里程碑任务列表", description = "获取指定里程碑的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}/tasks")
    public Result<List<MilestoneTask>> getTasks(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        List<MilestoneTask> tasks = milestoneTaskService.getByMilestoneId(id);
        return Result.success(tasks);
    }

    /**
     * 获取任务详情
     */
    @Operation(summary = "获取任务详情", description = "获取任务详细信息，包含子任务和附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/tasks/{taskId}")
    public Result<MilestoneTask> getTaskDetail(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        MilestoneTask task = milestoneTaskService.getDetailById(taskId);
        return Result.success(task);
    }

    /**
     * 创建里程碑任务
     */
    @Operation(summary = "创建里程碑任务", description = "为里程碑创建一个新任务")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping("/{id}/tasks")
    public Result<MilestoneTask> createTask(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @RequestBody MilestoneTask task,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        task.setMilestoneId(id);
        
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
    @PostMapping("/tasks/{taskId}/subtasks")
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
    @PutMapping("/tasks/{taskId}")
    public Result<MilestoneTask> updateTask(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody MilestoneTask task) {
        task.setId(taskId);
        MilestoneTask updated = milestoneTaskService.updateTask(task);
        return Result.success(updated);
    }

    /**
     * 更新任务进度（简单版本）
     */
    @Operation(summary = "更新任务进度", description = "更新任务的完成进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/tasks/{taskId}/progress")
    public Result<Boolean> updateTaskProgress(
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
    @PostMapping("/tasks/{taskId}/progress-update")
    public Result<MilestoneTaskProgressRecord> updateTaskProgressEnhanced(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody MilestoneTaskProgressUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        // 获取当前用户ID
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
    @GetMapping("/tasks/{taskId}/progress-history")
    public Result<List<MilestoneTaskProgressRecord>> getProgressHistory(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneTaskProgressRecord> records = milestoneTaskService.getProgressHistory(taskId);
        return Result.success(records);
    }

    /**
     * AI 生成/润色进度描述
     */
    @Operation(summary = "AI进度描述", description = "使用AI生成或润色进度更新描述")
    @ApiResponse(responseCode = "200", description = "生成成功")
    @PostMapping("/tasks/{taskId}/ai-progress-description")
    public Result<ProgressDescriptionResponse> generateProgressDescription(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody ProgressDescriptionRequest request) {
        // 获取任务信息
        MilestoneTask task = milestoneTaskService.getDetailById(taskId);
        request.setTaskId(taskId);
        request.setTaskName(task.getName());
        request.setTaskDescription(task.getDescription());
        request.setCurrentProgress(task.getProgress());
        
        ProgressDescriptionResponse response = claudeService.generateProgressDescription(request);
        return Result.success(response);
    }

    /**
     * 完成任务
     */
    @Operation(summary = "完成任务", description = "将任务标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/tasks/{taskId}/complete")
    public Result<MilestoneTask> completeTask(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        MilestoneTask task = milestoneTaskService.completeTask(taskId);
        return Result.success(task);
    }

    /**
     * 分配任务
     */
    @Operation(summary = "分配任务", description = "将任务分配给指定用户")
    @ApiResponse(responseCode = "200", description = "分配成功")
    @PutMapping("/tasks/{taskId}/assign")
    public Result<Boolean> assignTask(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        boolean result = milestoneTaskService.assignTask(taskId, userId);
        return Result.success(result);
    }

    /**
     * 删除任务
     */
    @Operation(summary = "删除任务", description = "删除指定任务")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/tasks/{taskId}")
    public Result<Boolean> deleteTask(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        boolean result = milestoneTaskService.deleteTask(taskId);
        return Result.success(result);
    }

    /**
     * 获取用户的任务列表
     */
    @Operation(summary = "获取用户任务列表", description = "获取指定用户负责的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/tasks/assignee/{userId}")
    public Result<List<MilestoneTask>> getTasksByAssignee(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {
        List<MilestoneTask> tasks = milestoneTaskService.getByAssigneeId(userId);
        return Result.success(tasks);
    }

    // ==================== 附件管理 ====================

    /**
     * 获取任务附件列表
     */
    @Operation(summary = "获取任务附件", description = "获取任务的所有附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/tasks/{taskId}/attachments")
    public Result<List<MilestoneTaskAttachment>> getTaskAttachments(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneTaskAttachment> attachments = milestoneTaskService.getAttachments(taskId);
        return Result.success(attachments);
    }

    /**
     * 获取任务执行方案
     */
    @Operation(summary = "获取执行方案", description = "获取任务的执行方案附件")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/tasks/{taskId}/execution-plans")
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
    @PostMapping("/tasks/{taskId}/attachments")
    public Result<MilestoneTaskAttachment> addTaskAttachment(
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
    @DeleteMapping("/tasks/attachments/{attachmentId}")
    public Result<Boolean> deleteTaskAttachment(
            @Parameter(description = "附件ID", required = true) @PathVariable Long attachmentId) {
        boolean result = milestoneTaskService.deleteAttachment(attachmentId);
        return Result.success(result);
    }

    // ==================== 评论和催办 ====================

    /**
     * 获取里程碑评论列表
     */
    @Operation(summary = "获取里程碑评论", description = "获取里程碑的所有评论和催办记录")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}/comments")
    public Result<List<MilestoneComment>> getMilestoneComments(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        List<MilestoneComment> comments = milestoneCommentService.getByMilestoneId(id);
        return Result.success(comments);
    }

    /**
     * 获取任务评论列表
     */
    @Operation(summary = "获取任务评论", description = "获取任务的所有评论和催办记录")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/tasks/{taskId}/comments")
    public Result<List<MilestoneComment>> getTaskComments(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<MilestoneComment> comments = milestoneCommentService.getByTaskId(taskId);
        return Result.success(comments);
    }

    /**
     * 添加里程碑评论
     */
    @Operation(summary = "添加里程碑评论", description = "为里程碑添加评论")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{id}/comments")
    public Result<MilestoneComment> addMilestoneComment(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String content = (String) body.get("content");
        MilestoneComment comment = milestoneCommentService.addMilestoneComment(id, userId, content);
        return Result.success(comment);
    }

    /**
     * 添加任务评论
     */
    @Operation(summary = "添加任务评论", description = "为任务添加评论")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/tasks/{taskId}/comments")
    public Result<MilestoneComment> addTaskComment(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String content = (String) body.get("content");
        MilestoneComment comment = milestoneCommentService.addTaskComment(taskId, userId, content);
        return Result.success(comment);
    }

    /**
     * 催办里程碑
     */
    @Operation(summary = "催办里程碑", description = "对里程碑进行催办")
    @ApiResponse(responseCode = "200", description = "催办成功")
    @PostMapping("/{id}/urge")
    public Result<MilestoneComment> urgeMilestone(
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String content = body.get("content") != null ? (String) body.get("content") : null;
        MilestoneComment comment = milestoneCommentService.urgeMilestone(id, userId, content);
        return Result.success(comment);
    }

    /**
     * 催办任务
     */
    @Operation(summary = "催办任务", description = "对任务进行催办")
    @ApiResponse(responseCode = "200", description = "催办成功")
    @PostMapping("/tasks/{taskId}/urge")
    public Result<MilestoneComment> urgeTask(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String content = body.get("content") != null ? (String) body.get("content") : null;
        MilestoneComment comment = milestoneCommentService.urgeTask(taskId, userId, content);
        return Result.success(comment);
    }

    /**
     * 删除评论
     */
    @Operation(summary = "删除评论", description = "删除指定评论")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/comments/{commentId}")
    public Result<Boolean> deleteComment(
            @Parameter(description = "评论ID", required = true) @PathVariable Long commentId) {
        boolean result = milestoneCommentService.deleteComment(commentId);
        return Result.success(result);
    }
}