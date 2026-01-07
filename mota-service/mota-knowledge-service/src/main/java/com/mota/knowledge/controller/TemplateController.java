package com.mota.knowledge.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.knowledge.entity.Template;
import com.mota.knowledge.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 模板控制器
 */
@RestController
@RequestMapping("/api/v1/knowledge/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    /**
     * 创建模板
     */
    @PostMapping
    public Result<Template> createTemplate(@RequestBody Map<String, Object> request) {
        Long enterpriseId = request.get("enterpriseId") != null ? 
            Long.valueOf(request.get("enterpriseId").toString()) : null;
        String name = (String) request.get("name");
        String type = (String) request.get("type");
        String category = (String) request.get("category");
        String content = (String) request.get("content");
        String description = (String) request.get("description");
        Long userId = Long.valueOf(request.get("userId").toString());
        
        Template template = templateService.createTemplate(enterpriseId, name, type, category, content, description, userId);
        return Result.success(template);
    }

    /**
     * 获取模板列表
     */
    @GetMapping
    public Result<IPage<Template>> getTemplateList(
            @RequestParam(required = false) Long enterpriseId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<Template> templates = templateService.getTemplateList(enterpriseId, type, category, page, size);
        return Result.success(templates);
    }

    /**
     * 获取系统模板
     */
    @GetMapping("/system")
    public Result<List<Template>> getSystemTemplates(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category) {
        List<Template> templates = templateService.getSystemTemplates(type, category);
        return Result.success(templates);
    }

    /**
     * 获取模板详情
     */
    @GetMapping("/{id}")
    public Result<Template> getTemplateById(@PathVariable Long id) {
        Template template = templateService.getTemplateById(id);
        return Result.success(template);
    }

    /**
     * 更新模板
     */
    @PutMapping("/{id}")
    public Result<Void> updateTemplate(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        templateService.updateTemplate(id, request.get("name"), request.get("content"), request.get("description"));
        return Result.success();
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return Result.success();
    }

    /**
     * 使用模板
     */
    @PostMapping("/{id}/use")
    public Result<String> useTemplate(@PathVariable Long id) {
        String content = templateService.useTemplate(id);
        return Result.success(content);
    }

    /**
     * 获取热门模板
     */
    @GetMapping("/popular")
    public Result<List<Template>> getPopularTemplates(
            @RequestParam(defaultValue = "10") int limit) {
        List<Template> templates = templateService.getPopularTemplates(limit);
        return Result.success(templates);
    }

    /**
     * 搜索模板
     */
    @GetMapping("/search")
    public Result<IPage<Template>> searchTemplates(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<Template> templates = templateService.searchTemplates(keyword, page, size);
        return Result.success(templates);
    }
}