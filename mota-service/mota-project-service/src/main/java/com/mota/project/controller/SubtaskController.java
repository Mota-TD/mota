package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.Subtask;
import com.mota.project.service.SubtaskService;
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
 * 子任务 Controller
 * 支持多级子任务结构
 */
@Tag(name = "子任务管理", description = "子任务的增删改查和状态管理，支持多级子任务")
@RestController
@RequestMapping("/api/v1/subtasks")
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskService subtaskService;

    /**
     * 创建子任务
     */
    @Operation(summary = "创建子任务", description = "为指定任务创建子任务")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<Subtask> create(@RequestBody Subtask subtask) {
        Subtask created = subtaskService.createSubtask(subtask);
        return Result.success(created);
    }

    /**
     * 创建子子任务
     */
    @Operation(summary = "创建子子任务", description = "在子任务下创建子子任务（多级子任务）")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误"),
        @ApiResponse(responseCode = "404", description = "父子任务不存在")
    })
    @PostMapping("/{parentSubtaskId}/children")
    public Result<Subtask> createChild(
            @Parameter(description = "父子任务ID", required = true) @PathVariable Long parentSubtaskId,
            @RequestBody Subtask subtask) {
        Subtask created = subtaskService.createChildSubtask(parentSubtaskId, subtask);
        return Result.success(created);
    }

    /**
     * 批量创建子任务
     */
    @Operation(summary = "批量创建子任务", description = "批量为指定任务创建子任务")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping("/batch")
    public Result<Boolean> batchCreate(@RequestBody List<Subtask> subtasks) {
        boolean result = subtaskService.batchCreateSubtasks(subtasks);
        return Result.success(result);
    }

    /**
     * 更新子任务
     */
    @Operation(summary = "更新子任务", description = "更新子任务信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "子任务不存在")
    })
    @PutMapping("/{id}")
    public Result<Subtask> update(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id,
            @RequestBody Subtask subtask) {
        subtask.setId(id);
        Subtask updated = subtaskService.updateSubtask(subtask);
        return Result.success(updated);
    }

    /**
     * 删除子任务
     */
    @Operation(summary = "删除子任务", description = "删除指定的子任务及其所有子子任务")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "子任务不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id) {
        boolean result = subtaskService.deleteSubtask(id);
        return Result.success(result);
    }

    /**
     * 获取子任务详情
     */
    @Operation(summary = "获取子任务详情", description = "根据ID获取子任务详情")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}")
    public Result<Subtask> getById(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id) {
        Subtask subtask = subtaskService.getById(id);
        return Result.success(subtask);
    }

    /**
     * 根据父任务ID查询一级子任务列表
     */
    @Operation(summary = "查询父任务的一级子任务", description = "查询指定父任务的一级子任务（不包含子子任务）")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/parent/{parentTaskId}")
    public Result<List<Subtask>> listByParentTaskId(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long parentTaskId) {
        List<Subtask> list = subtaskService.listByParentTaskId(parentTaskId);
        return Result.success(list);
    }

    /**
     * 根据父任务ID查询所有子任务（包含所有层级）
     */
    @Operation(summary = "查询父任务的所有子任务", description = "查询指定父任务的所有子任务（包含所有层级）")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/parent/{parentTaskId}/all")
    public Result<List<Subtask>> listAllByParentTaskId(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long parentTaskId) {
        List<Subtask> list = subtaskService.listAllByParentTaskId(parentTaskId);
        return Result.success(list);
    }

    /**
     * 根据父任务ID查询子任务树形结构
     */
    @Operation(summary = "查询父任务的子任务树", description = "查询指定父任务的子任务树形结构")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/parent/{parentTaskId}/tree")
    public Result<List<Subtask>> listTreeByParentTaskId(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long parentTaskId) {
        List<Subtask> tree = subtaskService.listTreeByParentTaskId(parentTaskId);
        return Result.success(tree);
    }

    /**
     * 根据父子任务ID查询子任务列表
     */
    @Operation(summary = "查询子任务的子任务", description = "查询指定子任务的子子任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{parentSubtaskId}/children")
    public Result<List<Subtask>> listByParentSubtaskId(
            @Parameter(description = "父子任务ID", required = true) @PathVariable Long parentSubtaskId) {
        List<Subtask> list = subtaskService.listByParentSubtaskId(parentSubtaskId);
        return Result.success(list);
    }

    /**
     * 根据项目ID查询所有子任务
     */
    @Operation(summary = "查询项目的所有子任务", description = "查询指定项目的所有子任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<Subtask>> listByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<Subtask> list = subtaskService.listByProjectId(projectId);
        return Result.success(list);
    }

    /**
     * 根据执行人ID查询子任务列表
     */
    @Operation(summary = "查询执行人的子任务", description = "查询指定执行人的所有子任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/assignee/{assigneeId}")
    public Result<List<Subtask>> listByAssigneeId(
            @Parameter(description = "执行人ID", required = true) @PathVariable Long assigneeId) {
        List<Subtask> list = subtaskService.listByAssigneeId(assigneeId);
        return Result.success(list);
    }

    /**
     * 更新子任务状态
     */
    @Operation(summary = "更新子任务状态", description = "更新子任务的状态")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/status")
    public Result<Boolean> updateStatus(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        boolean result = subtaskService.updateStatus(id, status);
        return Result.success(result);
    }

    /**
     * 更新子任务进度
     */
    @Operation(summary = "更新子任务进度", description = "更新子任务的完成进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/progress")
    public Result<Boolean> updateProgress(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        Integer progress = request.get("progress");
        boolean result = subtaskService.updateProgress(id, progress);
        return Result.success(result);
    }

    /**
     * 完成子任务
     */
    @Operation(summary = "完成子任务", description = "将子任务标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PutMapping("/{id}/complete")
    public Result<Boolean> complete(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id) {
        boolean result = subtaskService.completeSubtask(id);
        return Result.success(result);
    }

    /**
     * 分配子任务
     */
    @Operation(summary = "分配子任务", description = "将子任务分配给指定执行人")
    @ApiResponse(responseCode = "200", description = "分配成功")
    @PutMapping("/{id}/assign")
    public Result<Boolean> assign(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long assigneeId = request.get("assigneeId");
        boolean result = subtaskService.assignSubtask(id, assigneeId);
        return Result.success(result);
    }

    /**
     * 移动子任务
     */
    @Operation(summary = "移动子任务", description = "将子任务移动到另一个父任务或父子任务下")
    @ApiResponse(responseCode = "200", description = "移动成功")
    @PutMapping("/{id}/move")
    public Result<Boolean> move(
            @Parameter(description = "子任务ID", required = true) @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long newParentTaskId = request.get("parentTaskId");
        Long newParentSubtaskId = request.get("parentSubtaskId");
        boolean result = subtaskService.moveSubtask(id, newParentTaskId, newParentSubtaskId);
        return Result.success(result);
    }

    /**
     * 统计父任务下各状态的子任务数量
     */
    @Operation(summary = "子任务状态统计", description = "统计父任务下各状态的子任务数量（包含所有层级）")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/stats/parent/{parentTaskId}")
    public Result<Map<String, Long>> getStatisticsByParentTask(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long parentTaskId) {
        Map<String, Long> statistics = subtaskService.countByParentTaskIdGroupByStatus(parentTaskId);
        return Result.success(statistics);
    }

    /**
     * 计算父任务的进度
     */
    @Operation(summary = "计算父任务进度", description = "基于所有子任务计算父任务的进度")
    @ApiResponse(responseCode = "200", description = "计算成功")
    @GetMapping("/progress/parent/{parentTaskId}")
    public Result<Integer> calculateParentTaskProgress(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long parentTaskId) {
        Integer progress = subtaskService.calculateParentTaskProgress(parentTaskId);
        return Result.success(progress);
    }

    /**
     * 获取子任务进度汇总
     */
    @Operation(summary = "获取子任务进度汇总", description = "获取父任务下所有子任务的进度汇总信息")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/progress/parent/{parentTaskId}/summary")
    public Result<Map<String, Object>> getProgressSummary(
            @Parameter(description = "父任务ID", required = true) @PathVariable Long parentTaskId) {
        Map<String, Object> summary = subtaskService.getSubtaskProgressSummary(parentTaskId);
        return Result.success(summary);
    }

    /**
     * 更新子任务排序
     */
    @Operation(summary = "更新子任务排序", description = "批量更新子任务的排序顺序")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/sort-order")
    public Result<Boolean> updateSortOrder(@RequestBody List<Subtask> subtasks) {
        boolean result = subtaskService.updateSortOrder(subtasks);
        return Result.success(result);
    }
}