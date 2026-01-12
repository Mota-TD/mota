package com.mota.project.service;

import com.mota.project.dto.request.CopyProjectRequest;
import com.mota.project.dto.request.CreateTemplateRequest;
import com.mota.project.entity.Project;

import java.util.List;

/**
 * 项目模板服务接口
 */
public interface ProjectTemplateService {

    /**
     * 获取模板列表
     *
     * @param category 模板分类（可选）
     * @return 模板列表
     */
    List<Project> getTemplateList(String category);

    /**
     * 获取系统模板列表
     *
     * @return 系统模板列表
     */
    List<Project> getSystemTemplates();

    /**
     * 获取租户自定义模板列表
     *
     * @param tenantId 租户ID
     * @return 自定义模板列表
     */
    List<Project> getTenantTemplates(Long tenantId);

    /**
     * 创建项目模板
     *
     * @param request 创建模板请求
     * @return 创建的模板
     */
    Project createTemplate(CreateTemplateRequest request);

    /**
     * 从现有项目创建模板
     *
     * @param projectId 源项目ID
     * @param templateName 模板名称
     * @param description 模板描述
     * @return 创建的模板
     */
    Project createTemplateFromProject(Long projectId, String templateName, String description);

    /**
     * 更新模板
     *
     * @param templateId 模板ID
     * @param request 更新请求
     * @return 更新后的模板
     */
    Project updateTemplate(Long templateId, CreateTemplateRequest request);

    /**
     * 删除模板
     *
     * @param templateId 模板ID
     */
    void deleteTemplate(Long templateId);

    /**
     * 从模板创建项目
     *
     * @param templateId 模板ID
     * @param projectName 项目名称
     * @param ownerId 负责人ID
     * @return 创建的项目
     */
    Project createProjectFromTemplate(Long templateId, String projectName, Long ownerId);

    /**
     * 复制项目
     *
     * @param request 复制项目请求
     * @return 复制后的新项目
     */
    Project copyProject(CopyProjectRequest request);

    /**
     * 获取模板详情
     *
     * @param templateId 模板ID
     * @return 模板详情
     */
    Project getTemplateDetail(Long templateId);

    /**
     * 获取模板使用统计
     *
     * @param templateId 模板ID
     * @return 使用次数
     */
    Integer getTemplateUsageCount(Long templateId);
}