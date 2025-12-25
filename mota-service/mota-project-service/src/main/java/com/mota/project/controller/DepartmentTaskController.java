package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.dto.request.ProgressUpdateRequest;
import com.mota.project.dto.request.StatusUpdateRequest;
import com.mota.project.entity.DepartmentTask;
import com.mota.project.service.DepartmentTaskService;
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
 * 部门任务 Controller
 */
@Tag(name = "部门任务管理", description = "部门级别任务的增删改查和状态管理")
@RestController
@RequestMapping("/api/v1/department-tasks")
@RequiredArgsConstructor
public class DepartmentTaskController {

    private final DepartmentTaskService departmentTaskService;

    /**
     * 获取部门任务列表（分页）
     */
    @Operation(summary = "获取部门任务列表", description = "分页获取部门任务列表，支持多条件筛选")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "401", description = "未授权")
    })
    @GetMapping
    public Result<IPage<DepartmentTask>> list(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "部门ID") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status,
            @Parameter(description = "优先级") @RequestParam(required = false) String priority,
            @Parameter(description = "搜索关键字") @RequestParam(required = false) String keyword
    ) {
        Page<DepartmentTask> pageParam = new Page<>(page, pageSize);
        IPage<DepartmentTask> result = departmentTaskService.pageDepartmentTasks(
                pageParam, projectId, departmentId, status, priority
        );
        return Result.success(result);
    }

    /**
     * 创建部门任务
     */
    @Operation(summary = "创建部门任务", description = "创建一个新的部门任务")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<DepartmentTask> create(@RequestBody DepartmentTask departmentTask) {
        DepartmentTask created = departmentTaskService.createDepartmentTask(departmentTask);
        return Result.success(created);
    }

    /**
     * 更新部门任务
     */
    @Operation(summary = "更新部门任务", description = "更新部门任务信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "部门任务不存在")
    })
    @PutMapping("/{id}")
    public Result<DepartmentTask> update(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long id,
            @RequestBody DepartmentTask departmentTask) {
        departmentTask.setId(id);
        DepartmentTask updated = departmentTaskService.updateDepartmentTask(departmentTask);
        return Result.success(updated);
    }

    /**
     * 获取部门任务详情
     */
    @Operation(summary = "获取部门任务详情", description = "根据ID获取部门任务详细信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "部门任务不存在")
    })
    @GetMapping("/{id}")
    public Result<DepartmentTask> getById(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long id) {
        DepartmentTask departmentTask = departmentTaskService.getDetailById(id);
        return Result.success(departmentTask);
    }

    /**
     * 删除部门任务
     */
    @Operation(summary = "删除部门任务", description = "根据ID删除部门任务")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "部门任务不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long id) {
        boolean result = departmentTaskService.removeById(id);
        return Result.success(result);
    }

    /**
     * 根据项目ID查询部门任务列表
     */
    @Operation(summary = "根据项目获取部门任务列表", description = "获取指定项目下的所有部门任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<DepartmentTask>> listByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<DepartmentTask> list = departmentTaskService.listByProjectId(projectId);
        return Result.success(list);
    }

    /**
     * 根据部门ID查询部门任务列表
     */
    @Operation(summary = "根据部门获取任务列表", description = "获取指定部门的所有任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/department/{departmentId}")
    public Result<List<DepartmentTask>> listByDepartmentId(
            @Parameter(description = "部门ID", required = true) @PathVariable Long departmentId) {
        List<DepartmentTask> list = departmentTaskService.listByDepartmentId(departmentId);
        return Result.success(list);
    }

    /**
     * 根据负责人ID查询部门任务列表
     */
    @Operation(summary = "根据负责人获取任务列表", description = "获取指定负责人的所有部门任务")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/manager/{managerId}")
    public Result<List<DepartmentTask>> listByManagerId(
            @Parameter(description = "负责人ID", required = true) @PathVariable Long managerId) {
        List<DepartmentTask> list = departmentTaskService.listByManagerId(managerId);
        return Result.success(list);
    }

    /**
     * 分页查询部门任务
     */
    @Operation(summary = "分页查询部门任务", description = "分页查询部门任务列表")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/page")
    public Result<IPage<DepartmentTask>> page(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "部门ID") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "任务状态") @RequestParam(required = false) String status,
            @Parameter(description = "优先级") @RequestParam(required = false) String priority
    ) {
        Page<DepartmentTask> page = new Page<>(current, size);
        IPage<DepartmentTask> result = departmentTaskService.pageDepartmentTasks(
                page, projectId, departmentId, status, priority
        );
        return Result.success(result);
    }

    /**
     * 更新部门任务状态
     */
    @Operation(summary = "更新部门任务状态", description = "更新部门任务的状态")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/status")
    public Result<Boolean> updateStatus(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        boolean result = departmentTaskService.updateStatus(id, request.getStatus());
        return Result.success(result);
    }

    /**
     * 更新部门任务进度
     */
    @Operation(summary = "更新部门任务进度", description = "更新部门任务的完成进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/progress")
    public Result<Boolean> updateProgress(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long id,
            @RequestBody ProgressUpdateRequest request) {
        boolean result = departmentTaskService.updateProgress(id, request.getProgress());
        return Result.success(result);
    }

    /**
     * 重新计算部门任务进度
     */
    @Operation(summary = "重新计算进度", description = "根据子任务完成情况重新计算部门任务进度")
    @ApiResponse(responseCode = "200", description = "计算成功")
    @PostMapping("/{id}/calculate-progress")
    public Result<Boolean> calculateProgress(
            @Parameter(description = "部门任务ID", required = true) @PathVariable Long id) {
        boolean result = departmentTaskService.calculateAndUpdateProgress(id);
        return Result.success(result);
    }

    /**
     * 统计项目下各状态的部门任务数量
     */
    @Operation(summary = "项目部门任务统计", description = "统计项目下各状态的部门任务数量")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/stats/project/{projectId}")
    public Result<Map<String, Long>> getStatistics(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        Map<String, Long> statistics = departmentTaskService.countByProjectIdGroupByStatus(projectId);
        return Result.success(statistics);
    }

    /**
     * 统计项目下各状态的部门任务数量（兼容路径）
     */
    @Operation(summary = "项目部门任务统计", description = "统计项目下各状态的部门任务数量")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}/statistics")
    public Result<Map<String, Long>> getProjectStatistics(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        Map<String, Long> statistics = departmentTaskService.countByProjectIdGroupByStatus(projectId);
        return Result.success(statistics);
    }
}