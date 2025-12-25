package com.mota.project.controller;

import com.mota.project.entity.TaskTemplate;
import com.mota.project.service.TaskTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 任务模板控制器
 */
@RestController
@RequestMapping("/api/task-templates")
@RequiredArgsConstructor
public class TaskTemplateController {

    private final TaskTemplateService taskTemplateService;

    // ========== 模板CRUD ==========

    @PostMapping
    public ResponseEntity<TaskTemplate> createTemplate(@RequestBody TaskTemplate template) {
        return ResponseEntity.ok(taskTemplateService.createTemplate(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskTemplate> updateTemplate(@PathVariable Long id, @RequestBody TaskTemplate template) {
        return ResponseEntity.ok(taskTemplateService.updateTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(taskTemplateService.deleteTemplate(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskTemplate> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(taskTemplateService.getTemplateById(id));
    }

    @GetMapping
    public ResponseEntity<List<TaskTemplate>> getTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(taskTemplateService.getTemplates(category, isPublic, creatorId, page, pageSize));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TaskTemplate>> searchTemplates(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(taskTemplateService.searchTemplates(keyword, page, pageSize));
    }

    // ========== 模板分类 ==========

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(taskTemplateService.getAllCategories());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TaskTemplate>> getTemplatesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(taskTemplateService.getTemplatesByCategory(category));
    }

    @GetMapping("/categories/stats")
    public ResponseEntity<Map<String, Long>> getCategoryStats() {
        return ResponseEntity.ok(taskTemplateService.getCategoryStats());
    }

    // ========== 模板使用 ==========

    @PostMapping("/{templateId}/create-task")
    public ResponseEntity<Long> createTaskFromTemplate(
            @PathVariable Long templateId,
            @RequestParam Long projectId,
            @RequestParam(required = false) Long assigneeId,
            @RequestBody(required = false) Map<String, Object> overrides) {
        return ResponseEntity.ok(taskTemplateService.createTaskFromTemplate(templateId, projectId, assigneeId, overrides));
    }

    @PostMapping("/{templateId}/batch-create-tasks")
    public ResponseEntity<List<Long>> batchCreateTasksFromTemplate(
            @PathVariable Long templateId,
            @RequestParam Long projectId,
            @RequestBody List<Map<String, Object>> taskDataList) {
        return ResponseEntity.ok(taskTemplateService.batchCreateTasksFromTemplate(templateId, projectId, taskDataList));
    }

    @GetMapping("/popular")
    public ResponseEntity<List<TaskTemplate>> getPopularTemplates(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(taskTemplateService.getPopularTemplates(limit));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TaskTemplate>> getRecentlyUsedTemplates(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(taskTemplateService.getRecentlyUsedTemplates(userId, limit));
    }

    // ========== 模板权限 ==========

    @PutMapping("/{templateId}/public")
    public ResponseEntity<Void> setTemplatePublic(
            @PathVariable Long templateId,
            @RequestParam boolean isPublic) {
        taskTemplateService.setTemplatePublic(templateId, isPublic);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{templateId}/can-use")
    public ResponseEntity<Boolean> canUseTemplate(
            @PathVariable Long templateId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(taskTemplateService.canUseTemplate(templateId, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskTemplate>> getUserTemplates(@PathVariable Long userId) {
        return ResponseEntity.ok(taskTemplateService.getUserTemplates(userId));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskTemplate>> getProjectTemplates(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskTemplateService.getProjectTemplates(projectId));
    }

    // ========== 模板导入导出 ==========

    @GetMapping("/{templateId}/export")
    public ResponseEntity<String> exportTemplateAsJson(@PathVariable Long templateId) {
        return ResponseEntity.ok(taskTemplateService.exportTemplateAsJson(templateId));
    }

    @PostMapping("/import")
    public ResponseEntity<TaskTemplate> importTemplateFromJson(
            @RequestBody String json,
            @RequestParam Long creatorId) {
        return ResponseEntity.ok(taskTemplateService.importTemplateFromJson(json, creatorId));
    }

    @PostMapping("/{templateId}/duplicate")
    public ResponseEntity<TaskTemplate> duplicateTemplate(
            @PathVariable Long templateId,
            @RequestParam Long newCreatorId) {
        return ResponseEntity.ok(taskTemplateService.duplicateTemplate(templateId, newCreatorId));
    }

    // ========== 模板推荐 ==========

    @GetMapping("/recommend/project/{projectId}")
    public ResponseEntity<List<TaskTemplate>> recommendTemplates(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(taskTemplateService.recommendTemplates(projectId, limit));
    }

    @GetMapping("/recommend/description")
    public ResponseEntity<List<TaskTemplate>> recommendTemplatesByDescription(
            @RequestParam String description,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(taskTemplateService.recommendTemplatesByDescription(description, limit));
    }
}