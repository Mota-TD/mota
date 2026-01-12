package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.project.dto.request.CopyProjectRequest;
import com.mota.project.dto.request.CreateTemplateRequest;
import com.mota.project.entity.Project;
import com.mota.project.service.ProjectTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 项目模板控制器
 * 提供项目模板管理和项目复制功能
 */
@Tag(name = "项目模板管理", description = "项目模板的创建、查询、使用等操作")
@RestController
@RequestMapping("/api/v1/project-templates")
@RequiredArgsConstructor
public class ProjectTemplateController {

    private final ProjectTemplateService projectTemplateService;

    // ==================== 模板查询 ====================

    /**
     * 获取模板列表
     */
    @Operation(summary = "获取模板列表", description = "获取所有可用的项目模板，包括系统模板和租户自定义模板")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping
    public Result<List<Project>> getTemplateList(
            @Parameter(description = "模板分类") @RequestParam(value = "category", required = false) String category) {
        List<Project> templates = projectTemplateService.getTemplateList(category);
        return Result.success(templates);
    }

    /**
     * 获取系统模板列表
     */
    @Operation(summary = "获取系统模板列表", description = "获取系统预置的项目模板")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/system")
    public Result<List<Project>> getSystemTemplates() {
        List<Project> templates = projectTemplateService.getSystemTemplates();
        return Result.success(templates);
    }

    /**
     * 获取模板详情
     */
    @Operation(summary = "获取模板详情", description = "根据模板ID获取模板详细信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "查询成功"),
        @ApiResponse(responseCode = "404", description = "模板不存在")
    })
    @GetMapping("/{templateId}")
    public Result<Project> getTemplateDetail(
            @Parameter(description = "模板ID", required = true) @PathVariable("templateId") Long templateId) {
        Project template = projectTemplateService.getTemplateDetail(templateId);
        return Result.success(template);
    }

    /**
     * 获取模板使用统计
     */
    @Operation(summary = "获取模板使用统计", description = "获取模板被使用的次数")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/{templateId}/usage")
    public Result<Integer> getTemplateUsageCount(
            @Parameter(description = "模板ID", required = true) @PathVariable("templateId") Long templateId) {
        Integer count = projectTemplateService.getTemplateUsageCount(templateId);
        return Result.success(count);
    }

    // ==================== 模板管理 ====================

    /**
     * 创建模板
     */
    @Operation(summary = "创建模板", description = "创建一个新的项目模板")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "请求参数错误")
    })
    @PostMapping
    @RequiresPermission("project:template:create")
    public Result<Project> createTemplate(@Valid @RequestBody CreateTemplateRequest request) {
        Project template = projectTemplateService.createTemplate(request);
        return Result.success(template);
    }

    /**
     * 从项目创建模板
     */
    @Operation(summary = "从项目创建模板", description = "将现有项目保存为模板")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "404", description = "源项目不存在")
    })
    @PostMapping("/from-project/{projectId}")
    @RequiresPermission("project:template:create")
    public Result<Project> createTemplateFromProject(
            @Parameter(description = "源项目ID", required = true) @PathVariable("projectId") Long projectId,
            @Parameter(description = "模板名称", required = true) @RequestParam("name") String name,
            @Parameter(description = "模板描述") @RequestParam(value = "description", required = false) String description) {
        Project template = projectTemplateService.createTemplateFromProject(projectId, name, description);
        return Result.success(template);
    }

    /**
     * 更新模板
     */
    @Operation(summary = "更新模板", description = "更新模板信息")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "更新成功"),
        @ApiResponse(responseCode = "404", description = "模板不存在")
    })
    @PutMapping("/{templateId}")
    @RequiresPermission("project:template:update")
    public Result<Project> updateTemplate(
            @Parameter(description = "模板ID", required = true) @PathVariable("templateId") Long templateId,
            @Valid @RequestBody CreateTemplateRequest request) {
        Project template = projectTemplateService.updateTemplate(templateId, request);
        return Result.success(template);
    }

    /**
     * 删除模板
     */
    @Operation(summary = "删除模板", description = "删除指定的模板（系统模板不能删除）")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "删除成功"),
        @ApiResponse(responseCode = "404", description = "模板不存在"),
        @ApiResponse(responseCode = "400", description = "系统模板不能删除")
    })
    @DeleteMapping("/{templateId}")
    @RequiresPermission("project:template:delete")
    public Result<Void> deleteTemplate(
            @Parameter(description = "模板ID", required = true) @PathVariable("templateId") Long templateId) {
        projectTemplateService.deleteTemplate(templateId);
        return Result.success();
    }

    // ==================== 使用模板 ====================

    /**
     * 从模板创建项目
     */
    @Operation(summary = "从模板创建项目", description = "使用模板创建一个新项目")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "404", description = "模板不存在")
    })
    @PostMapping("/{templateId}/create-project")
    @RequiresPermission("project:create")
    public Result<Project> createProjectFromTemplate(
            @Parameter(description = "模板ID", required = true) @PathVariable("templateId") Long templateId,
            @Parameter(description = "项目名称", required = true) @RequestParam("name") String name,
            @Parameter(description = "负责人ID") @RequestParam(value = "ownerId", required = false) Long ownerId) {
        Project project = projectTemplateService.createProjectFromTemplate(templateId, name, ownerId);
        return Result.success(project);
    }

    /**
     * 复制项目
     */
    @Operation(summary = "复制项目", description = "复制一个现有项目，可选择复制成员、里程碑、任务等")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "复制成功"),
        @ApiResponse(responseCode = "404", description = "源项目不存在")
    })
    @PostMapping("/copy")
    @RequiresPermission("project:create")
    public Result<Project> copyProject(@Valid @RequestBody CopyProjectRequest request) {
        Project project = projectTemplateService.copyProject(request);
        return Result.success(project);
    }
}