package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.entity.Milestone;
import com.mota.project.service.MilestoneService;
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
 * 里程碑控制器
 */
@Tag(name = "里程碑管理", description = "项目里程碑的增删改查和状态管理")
@RestController
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

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
     * 根据项目ID获取里程碑列表
     */
    @Operation(summary = "根据项目获取里程碑列表", description = "获取指定项目的所有里程碑")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/project/{projectId}")
    public Result<List<Milestone>> getByProjectId(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        List<Milestone> milestones = milestoneService.getByProjectId(projectId);
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
            @Parameter(description = "里程碑ID", required = true) @PathVariable Long id) {
        Milestone milestone = milestoneService.getDetailById(id);
        return Result.success(milestone);
    }

    /**
     * 创建里程碑
     */
    @Operation(summary = "创建里程碑", description = "创建一个新的里程碑")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<Milestone> create(@RequestBody Milestone milestone) {
        Milestone created = milestoneService.createMilestone(milestone);
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
}