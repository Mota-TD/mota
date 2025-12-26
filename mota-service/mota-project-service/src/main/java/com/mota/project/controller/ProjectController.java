package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.dto.request.CreateProjectRequest;
import com.mota.project.dto.request.ProjectQueryRequest;
import com.mota.project.dto.request.UpdateProjectRequest;
import com.mota.project.dto.response.ProjectDetailResponse;
import com.mota.project.dto.response.ProjectListResponse;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.Project;
import com.mota.project.entity.ProjectMember;
import com.mota.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 项目控制器
 * 提供项目管理的完整生命周期API
 */
@Tag(name = "项目管理", description = "项目的创建、查询、更新、删除等操作")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // ==================== 项目基础操作 ====================

    /**
     * 获取下一个项目标识
     */
    @Operation(summary = "获取下一个项目标识", description = "获取系统自动生成的下一个项目标识（格式：AF-0000）")
    @ApiResponse(responseCode = "200", description = "获取成功")
    @GetMapping("/key/next")
    public Result<String> getNextProjectKey() {
        String nextKey = projectService.getNextProjectKey();
        return Result.success(nextKey);
    }

    /**
     * 获取项目列表（简单查询）
     */
    @Operation(summary = "获取项目列表", description = "根据关键字和状态筛选项目列表")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "401", description = "未授权")
    })
    @GetMapping
    public Result<List<Project>> list(
            @Parameter(description = "搜索关键字") @RequestParam(value = "keyword", required = false) String keyword,
            @Parameter(description = "项目状态") @RequestParam(value = "status", required = false) String status) {
        List<Project> projects = projectService.getProjectList(keyword, status);
        return Result.success(projects);
    }

    /**
     * 获取项目列表（高级查询）
     */
    @Operation(summary = "高级查询项目列表", description = "支持多条件分页查询项目")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping("/query")
    public Result<ProjectListResponse> queryList(@RequestBody ProjectQueryRequest query) {
        ProjectListResponse response = projectService.getProjectList(query);
        return Result.success(response);
    }

    /**
     * 获取项目详情（简单）
     */
    @Operation(summary = "获取项目详情", description = "根据项目ID获取项目基本信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "项目不存在")
    })
    @GetMapping("/{id}")
    public Result<Project> detail(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        Project project = projectService.getProjectDetail(id);
        return Result.success(project);
    }

    /**
     * 获取项目详情（完整信息）
     */
    @Operation(summary = "获取项目完整详情", description = "获取项目的完整信息，包括成员、里程碑、统计等")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "项目不存在")
    })
    @GetMapping("/{id}/full")
    public Result<ProjectDetailResponse> detailFull(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        ProjectDetailResponse response = projectService.getProjectDetailFull(id);
        return Result.success(response);
    }

    /**
     * 创建项目（简单）
     */
    @Operation(summary = "创建项目", description = "创建一个新项目")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    public Result<Project> create(@RequestBody Project project) {
        Project created = projectService.createProject(project);
        return Result.success(created);
    }

    /**
     * 创建项目（完整流程）
     */
    @Operation(summary = "创建项目（完整）", description = "使用完整参数创建项目，支持同时添加成员和里程碑")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping("/create")
    public Result<Project> createFull(@Valid @RequestBody CreateProjectRequest request) {
        Project created = projectService.createProject(request);
        return Result.success(created);
    }

    /**
     * 更新项目（简单）
     */
    @Operation(summary = "更新项目", description = "更新项目基本信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "项目不存在")
    })
    @PutMapping("/{id}")
    public Result<Project> update(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @RequestBody Project project) {
        Project updated = projectService.updateProject(id, project);
        return Result.success(updated);
    }

    /**
     * 更新项目（完整）
     */
    @Operation(summary = "更新项目（完整）", description = "使用完整参数更新项目")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "项目不存在")
    })
    @PutMapping("/{id}/update")
    public Result<Project> updateFull(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @Valid @RequestBody UpdateProjectRequest request) {
        Project updated = projectService.updateProject(id, request);
        return Result.success(updated);
    }

    /**
     * 删除项目
     */
    @Operation(summary = "删除项目", description = "根据ID删除项目")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "项目不存在")
    })
    @DeleteMapping("/{id}")
    public Result<Void> delete(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        projectService.deleteProject(id);
        return Result.success();
    }

    /**
     * 切换收藏状态
     */
    @Operation(summary = "切换收藏状态", description = "收藏或取消收藏项目")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PostMapping("/{id}/star")
    public Result<Void> toggleStar(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        projectService.toggleStar(id);
        return Result.success();
    }

    // ==================== 项目生命周期管理 ====================

    /**
     * 归档项目
     */
    @Operation(summary = "归档项目", description = "将项目归档")
    @ApiResponse(responseCode = "200", description = "归档成功")
    @PostMapping("/{id}/archive")
    public Result<Void> archive(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        projectService.archiveProject(id);
        return Result.success();
    }

    /**
     * 恢复归档项目
     */
    @Operation(summary = "恢复归档项目", description = "将已归档的项目恢复")
    @ApiResponse(responseCode = "200", description = "恢复成功")
    @PostMapping("/{id}/restore")
    public Result<Void> restore(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        projectService.restoreProject(id);
        return Result.success();
    }

    /**
     * 更新项目状态
     */
    @Operation(summary = "更新项目状态", description = "更新项目的状态")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @Parameter(description = "新状态", required = true) @RequestParam("status") String status) {
        projectService.updateProjectStatus(id, status);
        return Result.success();
    }

    /**
     * 更新项目进度
     */
    @Operation(summary = "更新项目进度", description = "更新项目的完成进度")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/progress")
    public Result<Void> updateProgress(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @Parameter(description = "进度百分比(0-100)", required = true) @RequestParam("progress") Integer progress) {
        projectService.updateProjectProgress(id, progress);
        return Result.success();
    }

    /**
     * 获取归档项目列表
     */
    @Operation(summary = "获取归档项目列表", description = "获取所有已归档的项目")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/archived")
    public Result<List<Project>> getArchivedProjects() {
        List<Project> projects = projectService.getArchivedProjects();
        return Result.success(projects);
    }

    /**
     * 获取收藏的项目列表
     */
    @Operation(summary = "获取收藏项目列表", description = "获取当前用户收藏的项目")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/starred")
    public Result<List<Project>> getStarredProjects() {
        List<Project> projects = projectService.getStarredProjects();
        return Result.success(projects);
    }

    /**
     * 获取最近访问的项目
     */
    @Operation(summary = "获取最近访问项目", description = "获取当前用户最近访问的项目")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/recent")
    public Result<List<Project>> getRecentProjects(
            @Parameter(description = "返回数量限制") @RequestParam(value = "limit", required = false) Integer limit) {
        List<Project> projects = projectService.getRecentProjects(limit);
        return Result.success(projects);
    }

    // ==================== 项目成员管理 ====================

    /**
     * 获取项目成员列表
     */
    @Operation(summary = "获取项目成员列表", description = "获取指定项目的所有成员")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}/members")
    public Result<List<ProjectMember>> getMembers(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        List<ProjectMember> members = projectService.getProjectMembers(id);
        return Result.success(members);
    }

    /**
     * 添加项目成员
     */
    @Operation(summary = "添加项目成员", description = "向项目添加一个成员")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{id}/members")
    public Result<Void> addMember(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @Parameter(description = "用户ID", required = true) @RequestParam("userId") Long userId,
            @Parameter(description = "成员角色") @RequestParam(value = "role", required = false) String role) {
        projectService.addProjectMember(id, userId, role, null);
        return Result.success();
    }

    /**
     * 批量添加项目成员
     */
    @Operation(summary = "批量添加项目成员", description = "向项目批量添加成员")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{id}/members/batch")
    public Result<Void> addMembers(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @RequestBody List<Long> userIds,
            @Parameter(description = "成员角色") @RequestParam(value = "role", required = false) String role) {
        projectService.addProjectMembers(id, userIds, role);
        return Result.success();
    }

    /**
     * 移除项目成员
     */
    @Operation(summary = "移除项目成员", description = "从项目中移除一个成员")
    @ApiResponse(responseCode = "200", description = "移除成功")
    @DeleteMapping("/{id}/members/{userId}")
    public Result<Void> removeMember(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @Parameter(description = "用户ID", required = true) @PathVariable("userId") Long userId) {
        projectService.removeProjectMember(id, userId);
        return Result.success();
    }

    /**
     * 更新成员角色
     */
    @Operation(summary = "更新成员角色", description = "更新项目成员的角色")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/{id}/members/{userId}/role")
    public Result<Void> updateMemberRole(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @Parameter(description = "用户ID", required = true) @PathVariable("userId") Long userId,
            @Parameter(description = "新角色", required = true) @RequestParam("role") String role) {
        projectService.updateMemberRole(id, userId, role);
        return Result.success();
    }

    // ==================== 项目里程碑管理 ====================

    /**
     * 获取项目里程碑列表
     */
    @Operation(summary = "获取项目里程碑列表", description = "获取指定项目的所有里程碑")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}/milestones")
    public Result<List<Milestone>> getMilestones(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        List<Milestone> milestones = projectService.getProjectMilestones(id);
        return Result.success(milestones);
    }

    /**
     * 添加里程碑
     */
    @Operation(summary = "添加里程碑", description = "向项目添加一个里程碑")
    @ApiResponse(responseCode = "200", description = "添加成功")
    @PostMapping("/{id}/milestones")
    public Result<Milestone> addMilestone(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id,
            @RequestBody Milestone milestone) {
        Milestone created = projectService.addMilestone(id, milestone);
        return Result.success(created);
    }

    /**
     * 更新里程碑
     */
    @Operation(summary = "更新里程碑", description = "更新里程碑信息")
    @ApiResponse(responseCode = "200", description = "更新成功")
    @PutMapping("/milestones/{milestoneId}")
    public Result<Milestone> updateMilestone(
            @Parameter(description = "里程碑ID", required = true) @PathVariable("milestoneId") Long milestoneId,
            @RequestBody Milestone milestone) {
        Milestone updated = projectService.updateMilestone(milestoneId, milestone);
        return Result.success(updated);
    }

    /**
     * 删除里程碑
     */
    @Operation(summary = "删除里程碑", description = "删除指定的里程碑")
    @ApiResponse(responseCode = "200", description = "删除成功")
    @DeleteMapping("/milestones/{milestoneId}")
    public Result<Void> deleteMilestone(
            @Parameter(description = "里程碑ID", required = true) @PathVariable("milestoneId") Long milestoneId) {
        projectService.deleteMilestone(milestoneId);
        return Result.success();
    }

    /**
     * 完成里程碑
     */
    @Operation(summary = "完成里程碑", description = "将里程碑标记为已完成")
    @ApiResponse(responseCode = "200", description = "操作成功")
    @PostMapping("/milestones/{milestoneId}/complete")
    public Result<Void> completeMilestone(
            @Parameter(description = "里程碑ID", required = true) @PathVariable("milestoneId") Long milestoneId) {
        projectService.completeMilestone(milestoneId);
        return Result.success();
    }

    // ==================== 项目统计 ====================

    /**
     * 获取项目统计信息
     */
    @Operation(summary = "获取项目统计信息", description = "获取项目的任务统计、进度等信息")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{id}/statistics")
    public Result<ProjectDetailResponse.ProjectStatistics> getStatistics(
            @Parameter(description = "项目ID", required = true) @PathVariable("id") Long id) {
        ProjectDetailResponse.ProjectStatistics statistics = projectService.getProjectStatistics(id);
        return Result.success(statistics);
    }
}