package com.mota.knowledge.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.knowledge.entity.Template;

import java.util.List;

/**
 * 模板服务接口
 */
public interface TemplateService {

    /**
     * 创建模板
     */
    Template createTemplate(Long enterpriseId, String name, String type, String category, 
                           String content, String description, Long userId);

    /**
     * 获取模板列表
     */
    IPage<Template> getTemplateList(Long enterpriseId, String type, String category, int page, int size);

    /**
     * 获取系统模板
     */
    List<Template> getSystemTemplates(String type, String category);

    /**
     * 获取模板详情
     */
    Template getTemplateById(Long id);

    /**
     * 更新模板
     */
    void updateTemplate(Long id, String name, String content, String description);

    /**
     * 删除模板
     */
    void deleteTemplate(Long id);

    /**
     * 使用模板（增加使用次数）
     */
    String useTemplate(Long id);

    /**
     * 获取热门模板
     */
    List<Template> getPopularTemplates(int limit);

    /**
     * 搜索模板
     */
    IPage<Template> searchTemplates(String keyword, int page, int size);
}