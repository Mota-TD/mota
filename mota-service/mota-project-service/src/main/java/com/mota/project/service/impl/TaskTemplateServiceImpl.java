package com.mota.project.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.project.entity.Task;
import com.mota.project.entity.TaskTemplate;
import com.mota.project.mapper.TaskMapper;
import com.mota.project.mapper.TaskTemplateMapper;
import com.mota.project.service.TaskTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 任务模板服务实现类
 */
@Service
@RequiredArgsConstructor
public class TaskTemplateServiceImpl implements TaskTemplateService {

    private final TaskTemplateMapper taskTemplateMapper;
    private final TaskMapper taskMapper;
    private final ObjectMapper objectMapper;

    // ========== 模板CRUD ==========

    @Override
    @Transactional
    public TaskTemplate createTemplate(TaskTemplate template) {
        template.setUseCount(0);
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());
        taskTemplateMapper.insert(template);
        return template;
    }

    @Override
    @Transactional
    public TaskTemplate updateTemplate(Long id, TaskTemplate template) {
        TaskTemplate existing = taskTemplateMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("模板不存在");
        }
        
        template.setId(id);
        template.setUpdatedAt(LocalDateTime.now());
        taskTemplateMapper.updateById(template);
        
        return taskTemplateMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteTemplate(Long id) {
        return taskTemplateMapper.deleteById(id) > 0;
    }

    @Override
    public TaskTemplate getTemplateById(Long id) {
        return taskTemplateMapper.selectById(id);
    }

    @Override
    public List<TaskTemplate> getTemplates(String category, Boolean isPublic, Long creatorId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return taskTemplateMapper.selectByConditions(category, isPublic, creatorId, offset, pageSize);
    }

    @Override
    public List<TaskTemplate> searchTemplates(String keyword, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return taskTemplateMapper.searchTemplates(keyword, offset, pageSize);
    }

    // ========== 模板分类 ==========

    @Override
    public List<String> getAllCategories() {
        return taskTemplateMapper.selectAllCategories();
    }

    @Override
    public List<TaskTemplate> getTemplatesByCategory(String category) {
        return taskTemplateMapper.selectByCategory(category);
    }

    @Override
    public Map<String, Long> getCategoryStats() {
        List<Object> stats = taskTemplateMapper.selectCategoryStats();
        Map<String, Long> result = new HashMap<>();
        // TODO: 转换统计结果
        return result;
    }

    // ========== 模板使用 ==========

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Long createTaskFromTemplate(Long templateId, Long projectId, Long assigneeId, Map<String, Object> overrides) {
        TaskTemplate template = taskTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new RuntimeException("模板不存在");
        }
        
        try {
            Map<String, Object> templateData = objectMapper.readValue(template.getTemplateData(), Map.class);
            
            Task task = new Task();
            task.setProjectId(projectId);
            task.setAssigneeId(assigneeId);
            task.setName((String) templateData.getOrDefault("name", templateData.getOrDefault("title", "新任务")));
            task.setDescription((String) templateData.get("description"));
            task.setPriority((String) templateData.getOrDefault("priority", "medium"));
            task.setStatus("pending");
            // createdAt and updatedAt are auto-filled by MyBatis-Plus
            
            // 应用覆盖值
            if (overrides != null) {
                if (overrides.containsKey("name")) {
                    task.setName((String) overrides.get("name"));
                } else if (overrides.containsKey("title")) {
                    task.setName((String) overrides.get("title"));
                }
                if (overrides.containsKey("description")) {
                    task.setDescription((String) overrides.get("description"));
                }
                if (overrides.containsKey("priority")) {
                    task.setPriority((String) overrides.get("priority"));
                }
            }
            
            taskMapper.insert(task);
            
            // 增加模板使用次数
            incrementUseCount(templateId);
            
            return task.getId();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("解析模板数据失败", e);
        }
    }

    @Override
    @Transactional
    public List<Long> batchCreateTasksFromTemplate(Long templateId, Long projectId, List<Map<String, Object>> taskDataList) {
        List<Long> taskIds = new ArrayList<>();
        for (Map<String, Object> taskData : taskDataList) {
            Long assigneeId = taskData.get("assigneeId") != null ? 
                    Long.valueOf(taskData.get("assigneeId").toString()) : null;
            Long taskId = createTaskFromTemplate(templateId, projectId, assigneeId, taskData);
            taskIds.add(taskId);
        }
        return taskIds;
    }

    @Override
    @Transactional
    public void incrementUseCount(Long templateId) {
        taskTemplateMapper.incrementUseCount(templateId);
    }

    @Override
    public List<TaskTemplate> getPopularTemplates(int limit) {
        return taskTemplateMapper.selectPopularTemplates(limit);
    }

    @Override
    public List<TaskTemplate> getRecentlyUsedTemplates(Long userId, int limit) {
        // TODO: 实现最近使用的模板查询
        return List.of();
    }

    // ========== 模板权限 ==========

    @Override
    @Transactional
    public void setTemplatePublic(Long templateId, boolean isPublic) {
        TaskTemplate template = taskTemplateMapper.selectById(templateId);
        if (template != null) {
            template.setIsPublic(isPublic);
            template.setUpdatedAt(LocalDateTime.now());
            taskTemplateMapper.updateById(template);
        }
    }

    @Override
    public boolean canUseTemplate(Long templateId, Long userId) {
        TaskTemplate template = taskTemplateMapper.selectById(templateId);
        if (template == null) {
            return false;
        }
        
        // 公开模板或创建者可以使用
        return template.getIsPublic() || template.getCreatorId().equals(userId);
    }

    @Override
    public List<TaskTemplate> getUserTemplates(Long userId) {
        return taskTemplateMapper.selectByCreatorId(userId);
    }

    @Override
    public List<TaskTemplate> getProjectTemplates(Long projectId) {
        return taskTemplateMapper.selectByProjectId(projectId);
    }

    // ========== 模板导入导出 ==========

    @Override
    public String exportTemplateAsJson(Long templateId) {
        TaskTemplate template = taskTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new RuntimeException("模板不存在");
        }
        
        try {
            return objectMapper.writeValueAsString(template);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("导出模板失败", e);
        }
    }

    @Override
    @Transactional
    public TaskTemplate importTemplateFromJson(String json, Long creatorId) {
        try {
            TaskTemplate template = objectMapper.readValue(json, TaskTemplate.class);
            template.setId(null);
            template.setCreatorId(creatorId);
            template.setUseCount(0);
            template.setCreatedAt(LocalDateTime.now());
            template.setUpdatedAt(LocalDateTime.now());
            
            taskTemplateMapper.insert(template);
            return template;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("导入模板失败", e);
        }
    }

    @Override
    @Transactional
    public TaskTemplate duplicateTemplate(Long templateId, Long newCreatorId) {
        TaskTemplate original = taskTemplateMapper.selectById(templateId);
        if (original == null) {
            throw new RuntimeException("模板不存在");
        }
        
        TaskTemplate copy = new TaskTemplate();
        copy.setName(original.getName() + " (副本)");
        copy.setDescription(original.getDescription());
        copy.setCategory(original.getCategory());
        copy.setTemplateData(original.getTemplateData());
        copy.setCreatorId(newCreatorId);
        copy.setIsPublic(false);
        copy.setUseCount(0);
        copy.setCreatedAt(LocalDateTime.now());
        copy.setUpdatedAt(LocalDateTime.now());
        
        taskTemplateMapper.insert(copy);
        return copy;
    }

    // ========== 模板推荐 ==========

    @Override
    public List<TaskTemplate> recommendTemplates(Long projectId, int limit) {
        // TODO: 基于项目类型推荐模板
        return getPopularTemplates(limit);
    }

    @Override
    public List<TaskTemplate> recommendTemplatesByDescription(String description, int limit) {
        // TODO: 基于描述语义匹配推荐模板
        return searchTemplates(description, 1, limit);
    }
}