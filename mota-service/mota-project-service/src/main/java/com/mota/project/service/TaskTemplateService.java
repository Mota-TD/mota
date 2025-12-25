package com.mota.project.service;

import com.mota.project.entity.TaskTemplate;

import java.util.List;
import java.util.Map;

/**
 * 任务模板服务接口
 */
public interface TaskTemplateService {

    // ========== 模板CRUD ==========

    /**
     * 创建任务模板
     */
    TaskTemplate createTemplate(TaskTemplate template);

    /**
     * 更新任务模板
     */
    TaskTemplate updateTemplate(Long id, TaskTemplate template);

    /**
     * 删除任务模板
     */
    boolean deleteTemplate(Long id);

    /**
     * 获取模板详情
     */
    TaskTemplate getTemplateById(Long id);

    /**
     * 获取模板列表（分页）
     */
    List<TaskTemplate> getTemplates(String category, Boolean isPublic, Long creatorId, int page, int pageSize);

    /**
     * 搜索模板
     */
    List<TaskTemplate> searchTemplates(String keyword, int page, int pageSize);

    // ========== 模板分类 ==========

    /**
     * 获取所有模板分类
     */
    List<String> getAllCategories();

    /**
     * 按分类获取模板
     */
    List<TaskTemplate> getTemplatesByCategory(String category);

    /**
     * 获取分类统计
     */
    Map<String, Long> getCategoryStats();

    // ========== 模板使用 ==========

    /**
     * 从模板创建任务
     */
    Long createTaskFromTemplate(Long templateId, Long projectId, Long assigneeId, Map<String, Object> overrides);

    /**
     * 批量从模板创建任务
     */
    List<Long> batchCreateTasksFromTemplate(Long templateId, Long projectId, List<Map<String, Object>> taskDataList);

    /**
     * 增加模板使用次数
     */
    void incrementUseCount(Long templateId);

    /**
     * 获取热门模板
     */
    List<TaskTemplate> getPopularTemplates(int limit);

    /**
     * 获取最近使用的模板
     */
    List<TaskTemplate> getRecentlyUsedTemplates(Long userId, int limit);

    // ========== 模板权限 ==========

    /**
     * 设置模板公开状态
     */
    void setTemplatePublic(Long templateId, boolean isPublic);

    /**
     * 检查用户是否有权限使用模板
     */
    boolean canUseTemplate(Long templateId, Long userId);

    /**
     * 获取用户创建的模板
     */
    List<TaskTemplate> getUserTemplates(Long userId);

    /**
     * 获取项目模板
     */
    List<TaskTemplate> getProjectTemplates(Long projectId);

    // ========== 模板导入导出 ==========

    /**
     * 导出模板为JSON
     */
    String exportTemplateAsJson(Long templateId);

    /**
     * 从JSON导入模板
     */
    TaskTemplate importTemplateFromJson(String json, Long creatorId);

    /**
     * 复制模板
     */
    TaskTemplate duplicateTemplate(Long templateId, Long newCreatorId);

    // ========== 模板推荐 ==========

    /**
     * 根据项目类型推荐模板
     */
    List<TaskTemplate> recommendTemplates(Long projectId, int limit);

    /**
     * 根据任务描述推荐模板
     */
    List<TaskTemplate> recommendTemplatesByDescription(String description, int limit);
}