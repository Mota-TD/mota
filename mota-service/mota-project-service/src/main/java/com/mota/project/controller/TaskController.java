package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.project.dto.request.AssignTaskRequest;
import com.mota.project.dto.request.ProgressUpdateRequest;
import com.mota.project.dto.request.StatusUpdateRequest;
import com.mota.project.entity.Task;
import com.mota.project.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 执行任务 Controller
 */
@Tag(name = "任务管理", description = "执行任务的增删改查和状态管理")
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * 获取任务列表（分页）
     */
    @Operation(summary = "获取任务列表", description = "分页获取任务列表，支持多条件筛选")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "401", description = "未授权")
    })
    @GetMapping
    public Result<IPage<Task>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "部门任务ID") @RequestParam(required = false) Long departmentTaskId,
            @Parameter(description = "执行人ID") @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status,
            @Parameter(description = "优先级") @RequestParam(required = false) String priority,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String keyword
    ) {
        Page<Task> pageParam = new Page<>(page, pageSize);
        IPage<Task> result = taskService.pageTasks(
                pageParam, projectId, departmentTaskId, assigneeId, status, priority
        );
        return Result.success(result);
    }

    /**
     * 获取当前用户的任务列表
     */
    @Operation(summary = "获取我的任务", description = "获取当前登录用户的任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/my")
    public Result<IPage<Task>> getMyTasks(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status,
            @Parameter(description = "优先级") @RequestParam(required = false) String priority
    ) {
        Long currentUserId = null;
        try {
            currentUserId = SecurityUtils.getUserId();
        } catch (Exception e) {
            // 如果未登录，默认使用用户ID 1（开发环境）
            currentUserId = 1L;
        }
        Page<Task> pageParam = new Page<>(page, pageSize);
        IPage<Task> result = taskService.pageTasks(
                pageParam, null, null, currentUserId, status, priority
        );
        return Result.success(result);
    }

    /**
     * 创建执行任务
     */
    @Operation(summary = "创建任务", description = "创建一个新的执行任务")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<Task> create(@RequestBody Task task) {
        Task created = taskService.createTask(task);
        return Result.success(created);
    }

    /**
     * 更新执行任务
     */
    @Operation(summary = "更新任务", description = "更新任务信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "任务不存在")
    })
    @PutMapping("/{id}")
    public Result<Task> update(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id,
            @RequestBody Task task) {
        task.setId(id);
        Task updated = taskService.updateTask(task);
        return Result.success(updated);
    }

    /**
     * 获取执行任务详情
     */
    @Operation(summary = "获取任务详情", description = "根据ID获取任务详细信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "任务不存在")
    })
    @GetMapping("/{id}")
    public Result<Task> getById(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id) {
        Task task = taskService.getDetailById(id);
        return Result.success(task);
    }

    /**
     * 删除执行任务
     */
    @Operation(summary = "删除任务", description = "根据ID删除任务")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "任务不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id) {
        boolean result = taskService.removeById(id);
        return Result.success(result);
    }

    /**
     * 根据部门任务ID查询执行任务列表
     */
    @Operation(summary = "根据部门任务获取任务列表", description = "获取指定部门任务下的所有执行任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/department-task/{departmentTaskId}")
    public Result<List<Task>> listByDepartmentTaskId(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long departmentTaskId) {
        List<Task> list = taskService.listByDepartmentTaskId(departmentTaskId);
        return Result.success(list);
    }

    /**
     * 根据项目ID查询执行任务列表
     */
    @Operation(summary = "根据项目获取任务列表", description = "获取指定项目下的所有执行任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<Task>> listByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<Task> list = taskService.listByProjectId(projectId);
        return Result.success(list);
    }

    /**
     * 根据执行人ID查询任务列表
     */
    @Operation(summary = "根据执行人获取任务列表", description = "获取指定执行人的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/assignee/{assigneeId}")
    public Result<List<Task>> listByAssigneeId(
            @Parameter(description = "执行人ID", required = true) @PathVariable Long assigneeId) {
        List<Task> list = taskService.listByAssigneeId(assigneeId);
        return Result.success(list);
    }

    /**
     * 分页查询执行任务
     */
    @Operation(summary = "分页查询任务", description = "分页查询任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/page")
    public Result<IPage<Task>> page(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "部门任务ID") @RequestParam(required = false) Long departmentTaskId,
            @Parameter(description = "执行人ID") @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status,
            @Parameter(description = "优先级") @RequestParam(required = false) String priority
    ) {
        Page<Task> page = new Page<>(current, size);
        IPage<Task> result = taskService.pageTasks(
                page, projectId, departmentTaskId, assigneeId, status, priority
        );
        return Result.success(result);
    }

    /**
     * 更新任务状态
     */
    @Operation(summary = "更新任务状态", description = "更新任务的状态")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/status")
    public Result<Boolean> updateStatus(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        boolean result = taskService.updateStatus(id, request.getStatus());
        return Result.success(result);
    }

    /**
     * 更新任务进度
     */
    @Operation(summary = "更新任务进度", description = "更新任务的完成进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/progress")
    public Result<Boolean> updateProgress(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id,
            @RequestBody ProgressUpdateRequest request) {
        boolean result = taskService.updateProgress(id, request.getProgress(), request.getNote());
        return Result.success(result);
    }

    /**
     * 完成任务 (PUT)
     */
    @Operation(summary = "完成任务", description = "将任务标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/{id}/complete")
    public Result<Boolean> complete(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id) {
        boolean result = taskService.completeTask(id);
        return Result.success(result);
    }

    /**
     * 完成任务 (POST)
     */
    @Operation(summary = "完成任务", description = "将任务标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PostMapping("/{id}/complete")
    public Result<Boolean> completePost(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id) {
        boolean result = taskService.completeTask(id);
        return Result.success(result);
    }

    /**
     * 分配任务
     */
    @Operation(summary = "分配任务", description = "将任务分配给指定执行人")
    @ApiResponse(responseCode = "200", description = "分配成功")
    @PutMapping("/{id}/assign")
    public Result<Boolean> assign(
            @Parameter(description = "任务ID", required = true) @PathVariable Long id,
            @RequestBody AssignTaskRequest request) {
        boolean result = taskService.assignTask(id, request.getAssigneeId());
        return Result.success(result);
    }

    /**
     * 获取用户待办任务列表
     */
    @Operation(summary = "获取用户待办任务", description = "获取指定用户的待办任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/todo/{userId}")
    public Result<List<Task>> getTodoList(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {
        List<Task> list = taskService.getTodoListByUserId(userId);
        return Result.success(list);
    }

    /**
     * 获取即将到期的任务（全局）
     */
    @Operation(summary = "获取即将到期任务", description = "获取指定天数内即将到期的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/upcoming")
    public Result<List<Task>> getUpcomingTasksGlobal(
            @Parameter(description = "天数范围") @RequestParam(defaultValue = "7") Integer days) {
        List<Task> list = taskService.getUpcomingTasks(days);
        return Result.success(list);
    }

    /**
     * 获取即将到期的任务（按用户）
     */
    @Operation(summary = "获取用户即将到期任务", description = "获取指定用户在指定天数内即将到期的任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/upcoming/{userId}")
    public Result<List<Task>> getUpcomingTasks(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId,
            @Parameter(description = "天数范围") @RequestParam(defaultValue = "7") Integer days) {
        List<Task> list = taskService.getUpcomingTasksByUserId(userId, days);
        return Result.success(list);
    }

    /**
     * 获取已逾期的任务（全局）
     */
    @Operation(summary = "获取逾期任务", description = "获取所有已逾期的任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/overdue")
    public Result<List<Task>> getOverdueTasksGlobal() {
        List<Task> list = taskService.getOverdueTasks();
        return Result.success(list);
    }

    /**
     * 获取已逾期的任务（按用户）
     */
    @Operation(summary = "获取用户逾期任务", description = "获取指定用户已逾期的任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/overdue/{userId}")
    public Result<List<Task>> getOverdueTasks(
            @Parameter(description = "用户ID", required = true) @PathVariable Long userId) {
        List<Task> list = taskService.getOverdueTasksByUserId(userId);
        return Result.success(list);
    }

    /**
     * 统计部门任务下各状态的执行任务数量
     */
    @Operation(summary = "部门任务统计", description = "统计部门任务下各状态的执行任务数量")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/stats/department-task/{departmentTaskId}")
    public Result<Map<String, Long>> getStatisticsByDepartmentTask(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long departmentTaskId) {
        Map<String, Long> statistics = taskService.countByDepartmentTaskIdGroupByStatus(departmentTaskId);
        return Result.success(statistics);
    }

    /**
     * 统计项目下各状态的执行任务数量
     */
    @Operation(summary = "项目任务统计", description = "统计项目下各状态的执行任务数量")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/stats/project/{projectId}")
    public Result<Map<String, Long>> getStatisticsByProject(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        Map<String, Long> statistics = taskService.countByProjectIdGroupByStatus(projectId);
        return Result.success(statistics);
    }

    /**
     * 统计项目下各状态的执行任务数量（兼容路径）
     */
    @Operation(summary = "项目任务统计", description = "统计项目下各状态的执行任务数量")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}/statistics")
    public Result<Map<String, Long>> getProjectStatistics(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        Map<String, Long> statistics = taskService.countByProjectIdGroupByStatus(projectId);
        return Result.success(statistics);
    }
}