package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.dto.CriticalPathDTO;
import com.mota.project.dto.DependencyConflictDTO;
import com.mota.project.entity.TaskDependency;
import com.mota.project.service.TaskDependencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 任务依赖关系 Controller
 */
@Tag(name = "任务依赖管理", description = "任务依赖关系的增删改查和关键路径计算")
@RestController
@RequestMapping("/api/v1/task-dependencies")
@RequiredArgsConstructor
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;

    /**
     * 创建任务依赖关系
     */
    @Operation(summary = "创建依赖关系", description = "创建任务之间的依赖关系")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误或会形成循环依赖")
    })
    @PostMapping
    public Result<TaskDependency> create(@RequestBody TaskDependency dependency) {
        TaskDependency created = taskDependencyService.createDependency(dependency);
        return Result.success(created);
    }

    /**
     * 批量创建任务依赖关系
     */
    @Operation(summary = "批量创建依赖关系", description = "批量创建任务之间的依赖关系")
    @ApiResponse(responseCode = "200", description = "创建成功")
    @PostMapping("/batch")
    public Result<Boolean> batchCreate(@RequestBody List<TaskDependency> dependencies) {
        boolean result = taskDependencyService.batchCreateDependencies(dependencies);
        return Result.success(result);
    }

    /**
     * 更新任务依赖关系
     */
    @Operation(summary = "更新依赖关系", description = "更新任务依赖关系的类型或延迟天数")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "依赖关系不存在")
    })
    @PutMapping("/{id}")
    public Result<TaskDependency> update(
            @Parameter(description = "依赖关系ID", required = true) @PathVariable Long id,
            @RequestBody TaskDependency dependency) {
        dependency.setId(id);
        TaskDependency updated = taskDependencyService.updateDependency(dependency);
        return Result.success(updated);
    }

    /**
     * 删除任务依赖关系
     */
    @Operation(summary = "删除依赖关系", description = "删除指定的任务依赖关系")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "依赖关系不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "依赖关系ID", required = true) @PathVariable Long id) {
        boolean result = taskDependencyService.deleteDependency(id);
        return Result.success(result);
    }

    /**
     * 删除任务的所有依赖关系
     */
    @Operation(summary = "删除任务的所有依赖", description = "删除指定任务的所有依赖关系（作为前置或后继）")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/task/{taskId}")
    public Result<Boolean> deleteByTaskId(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        boolean result = taskDependencyService.deleteByTaskId(taskId);
        return Result.success(result);
    }

    /**
     * 获取依赖关系详情
     */
    @Operation(summary = "获取依赖关系详情", description = "根据ID获取依赖关系详情")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}")
    public Result<TaskDependency> getById(
            @Parameter(description = "依赖关系ID", required = true) @PathVariable Long id) {
        TaskDependency dependency = taskDependencyService.getById(id);
        return Result.success(dependency);
    }

    /**
     * 根据后继任务ID查询前置依赖
     */
    @Operation(summary = "查询前置依赖", description = "查询指定任务的所有前置依赖关系")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/predecessors/{successorId}")
    public Result<List<TaskDependency>> listBySuccessorId(
            @Parameter(description = "后继任务ID", required = true) @PathVariable Long successorId) {
        List<TaskDependency> list = taskDependencyService.listBySuccessorId(successorId);
        return Result.success(list);
    }

    /**
     * 根据前置任务ID查询后继依赖
     */
    @Operation(summary = "查询后继依赖", description = "查询指定任务的所有后继依赖关系")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/successors/{predecessorId}")
    public Result<List<TaskDependency>> listByPredecessorId(
            @Parameter(description = "前置任务ID", required = true) @PathVariable Long predecessorId) {
        List<TaskDependency> list = taskDependencyService.listByPredecessorId(predecessorId);
        return Result.success(list);
    }

    /**
     * 根据任务ID查询所有相关依赖
     */
    @Operation(summary = "查询任务的所有依赖", description = "查询指定任务的所有相关依赖关系（作为前置或后继）")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/task/{taskId}")
    public Result<List<TaskDependency>> listByTaskId(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<TaskDependency> list = taskDependencyService.listByTaskId(taskId);
        return Result.success(list);
    }

    /**
     * 根据项目ID查询所有任务依赖关系
     */
    @Operation(summary = "查询项目的所有依赖", description = "查询指定项目的所有任务依赖关系")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<TaskDependency>> listByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<TaskDependency> list = taskDependencyService.listByProjectId(projectId);
        return Result.success(list);
    }

    /**
     * 检查是否存在依赖关系
     */
    @Operation(summary = "检查依赖关系是否存在", description = "检查两个任务之间是否存在依赖关系")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/exists")
    public Result<Boolean> existsDependency(
            @Parameter(description = "前置任务ID", required = true) @RequestParam Long predecessorId,
            @Parameter(description = "后继任务ID", required = true) @RequestParam Long successorId) {
        boolean exists = taskDependencyService.existsDependency(predecessorId, successorId);
        return Result.success(exists);
    }

    /**
     * 检查是否会形成循环依赖
     */
    @Operation(summary = "检查循环依赖", description = "检查添加依赖关系是否会形成循环依赖")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/would-create-cycle")
    public Result<Boolean> wouldCreateCycle(
            @Parameter(description = "前置任务ID", required = true) @RequestParam Long predecessorId,
            @Parameter(description = "后继任务ID", required = true) @RequestParam Long successorId) {
        boolean wouldCycle = taskDependencyService.wouldCreateCycle(predecessorId, successorId);
        return Result.success(wouldCycle);
    }

    /**
     * 计算项目的关键路径
     */
    @Operation(summary = "计算关键路径", description = "计算项目的关键路径，返回关键路径上的任务ID列表")
    @ApiResponse(responseCode = "200", description = "计算成功")
    @GetMapping("/critical-path/{projectId}")
    public Result<List<Long>> calculateCriticalPath(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<Long> criticalPath = taskDependencyService.calculateCriticalPath(projectId);
        return Result.success(criticalPath);
    }

    /**
     * 验证任务是否可以开始
     */
    @Operation(summary = "验证任务是否可开始", description = "检查任务的前置依赖是否满足，任务是否可以开始")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/can-start/{taskId}")
    public Result<Boolean> canTaskStart(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        boolean canStart = taskDependencyService.canTaskStart(taskId);
        return Result.success(canStart);
    }

    /**
     * 获取阻塞任务的前置任务列表
     */
    @Operation(summary = "获取阻塞任务", description = "获取阻塞当前任务开始的前置任务ID列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/blocking-predecessors/{taskId}")
    public Result<List<Long>> getBlockingPredecessors(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<Long> blockingIds = taskDependencyService.getBlockingPredecessors(taskId);
        return Result.success(blockingIds);
    }

    /**
     * 获取任务的所有前置任务ID（递归）
     */
    @Operation(summary = "获取所有前置任务", description = "递归获取任务的所有前置任务ID")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/all-predecessors/{taskId}")
    public Result<List<Long>> getAllPredecessorIds(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<Long> predecessorIds = taskDependencyService.getAllPredecessorIds(taskId);
        return Result.success(predecessorIds);
    }

    /**
     * 获取任务的所有后继任务ID（递归）
     */
    @Operation(summary = "获取所有后继任务", description = "递归获取任务的所有后继任务ID")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/all-successors/{taskId}")
    public Result<List<Long>> getAllSuccessorIds(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<Long> successorIds = taskDependencyService.getAllSuccessorIds(taskId);
        return Result.success(successorIds);
    }

    // ==================== 新增API ====================

    /**
     * 检测任务的依赖冲突
     */
    @Operation(summary = "检测任务依赖冲突", description = "检测指定任务的所有依赖冲突")
    @ApiResponse(responseCode = "200", description = "检测成功")
    @GetMapping("/conflicts/task/{taskId}")
    public Result<List<DependencyConflictDTO>> detectTaskConflicts(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<DependencyConflictDTO> conflicts = taskDependencyService.detectConflicts(taskId);
        return Result.success(conflicts);
    }

    /**
     * 检测项目的所有依赖冲突
     */
    @Operation(summary = "检测项目依赖冲突", description = "检测指定项目的所有任务依赖冲突")
    @ApiResponse(responseCode = "200", description = "检测成功")
    @GetMapping("/conflicts/project/{projectId}")
    public Result<List<DependencyConflictDTO>> detectProjectConflicts(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<DependencyConflictDTO> conflicts = taskDependencyService.detectProjectConflicts(projectId);
        return Result.success(conflicts);
    }

    /**
     * 验证依赖关系
     */
    @Operation(summary = "验证依赖关系", description = "验证依赖关系是否有效，检查循环依赖和日期冲突")
    @ApiResponse(responseCode = "200", description = "验证成功")
    @PostMapping("/validate")
    public Result<DependencyConflictDTO> validateDependency(@RequestBody TaskDependency dependency) {
        DependencyConflictDTO result = taskDependencyService.validateDependency(dependency);
        return Result.success(result);
    }

    /**
     * 计算项目的详细关键路径信息
     */
    @Operation(summary = "计算详细关键路径", description = "计算项目的详细关键路径信息，包含每个任务的ES/EF/LS/LF/Slack")
    @ApiResponse(responseCode = "200", description = "计算成功")
    @GetMapping("/critical-path-detail/{projectId}")
    public Result<CriticalPathDTO> calculateCriticalPathDetail(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        CriticalPathDTO criticalPath = taskDependencyService.calculateCriticalPathDetail(projectId);
        return Result.success(criticalPath);
    }

    /**
     * 计算任务的建议开始日期
     */
    @Operation(summary = "计算建议开始日期", description = "根据依赖关系计算任务的建议开始日期")
    @ApiResponse(responseCode = "200", description = "计算成功")
    @GetMapping("/suggested-start-date/{taskId}")
    public Result<LocalDate> calculateSuggestedStartDate(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        LocalDate suggestedDate = taskDependencyService.calculateSuggestedStartDate(taskId);
        return Result.success(suggestedDate);
    }

    /**
     * 验证任务是否可以完成
     */
    @Operation(summary = "验证任务是否可完成", description = "检查FF和SF依赖是否满足，任务是否可以完成")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/can-complete/{taskId}")
    public Result<Boolean> canTaskComplete(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        boolean canComplete = taskDependencyService.canTaskComplete(taskId);
        return Result.success(canComplete);
    }

    /**
     * 获取阻塞任务完成的前置任务列表
     */
    @Operation(summary = "获取阻塞完成的任务", description = "获取阻塞当前任务完成的前置任务ID列表（FF和SF依赖）")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/blocking-for-completion/{taskId}")
    public Result<List<Long>> getBlockingForCompletion(
            @Parameter(description = "任务ID", required = true) @PathVariable Long taskId) {
        List<Long> blockingIds = taskDependencyService.getBlockingForCompletion(taskId);
        return Result.success(blockingIds);
    }

    /**
     * 获取项目依赖关系详情
     */
    @Operation(summary = "获取依赖关系详情", description = "获取项目的所有依赖关系详情，包含任务名称和冲突信息")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/details/project/{projectId}")
    public Result<List<TaskDependencyService.DependencyDetailDTO>> listDependencyDetails(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<TaskDependencyService.DependencyDetailDTO> details = taskDependencyService.listDependencyDetails(projectId);
        return Result.success(details);
    }
}