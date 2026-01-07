package com.mota.project.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.knowledge.FileCategory;
import com.mota.project.entity.knowledge.FileTag;
import com.mota.project.entity.knowledge.KnowledgeFile;
import com.mota.project.service.KnowledgeManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 知识管理控制器
 * 处理文件、分类、标签的管理
 */
@Slf4j
@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
@Tag(name = "知识管理", description = "知识文件、分类、标签管理接口")
public class KnowledgeManagementController {

    private final KnowledgeManagementService knowledgeManagementService;

    // ========== 文件管理 API ==========

    @GetMapping("/files")
    @Operation(summary = "获取文件列表", description = "分页查询知识文件列表")
    public ResponseEntity<Map<String, Object>> getFiles(
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "文件夹ID") @RequestParam(required = false) Long folderId,
            @Parameter(description = "分类") @RequestParam(required = false) String category,
            @Parameter(description = "标签，多个用逗号分隔") @RequestParam(required = false) String tags,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") int pageSize) {
        
        List<String> tagList = null;
        if (tags != null && !tags.isEmpty()) {
            tagList = Arrays.asList(tags.split(","));
        }
        
        Page<KnowledgeFile> result = knowledgeManagementService.getFiles(
                projectId, folderId, category, tagList, keyword, page, pageSize);
        
        Map<String, Object> response = new HashMap<>();
        response.put("files", result.getRecords());
        response.put("total", result.getTotal());
        response.put("page", result.getCurrent());
        response.put("pageSize", result.getSize());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/files/{fileId}")
    @Operation(summary = "获取文件详情", description = "根据ID获取文件详细信息")
    public ResponseEntity<KnowledgeFile> getFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        KnowledgeFile file = knowledgeManagementService.getFileById(fileId);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(file);
    }

    @PostMapping("/files")
    @Operation(summary = "创建文件记录", description = "创建新的文件记录")
    public ResponseEntity<KnowledgeFile> createFile(@RequestBody KnowledgeFile file) {
        KnowledgeFile created = knowledgeManagementService.createFile(file);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/files/{fileId}")
    @Operation(summary = "更新文件信息", description = "更新文件的基本信息")
    public ResponseEntity<KnowledgeFile> updateFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @RequestBody KnowledgeFile file) {
        KnowledgeFile updated = knowledgeManagementService.updateFile(fileId, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/files/{fileId}")
    @Operation(summary = "删除文件", description = "删除指定文件")
    public ResponseEntity<Boolean> deleteFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        boolean result = knowledgeManagementService.deleteFile(fileId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/files/batch/delete")
    @Operation(summary = "批量删除文件", description = "批量删除多个文件")
    public ResponseEntity<Map<String, Object>> batchDeleteFiles(@RequestBody Map<String, List<Long>> request) {
        List<Long> fileIds = request.get("fileIds");
        int successCount = knowledgeManagementService.batchDeleteFiles(fileIds);
        
        Map<String, Object> response = new HashMap<>();
        response.put("successCount", successCount);
        response.put("failedIds", fileIds.size() - successCount > 0 ? 
                fileIds.subList(successCount, fileIds.size()) : List.of());
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/files/{fileId}/move")
    @Operation(summary = "移动文件", description = "将文件移动到指定文件夹")
    public ResponseEntity<KnowledgeFile> moveFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @RequestBody Map<String, Long> request) {
        Long folderId = request.get("folderId");
        KnowledgeFile file = knowledgeManagementService.moveFile(fileId, folderId);
        return ResponseEntity.ok(file);
    }

    @PutMapping("/files/{fileId}/category")
    @Operation(summary = "设置文件分类", description = "设置文件的分类")
    public ResponseEntity<KnowledgeFile> setFileCategory(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @RequestBody Map<String, String> request) {
        String category = request.get("category");
        KnowledgeFile file = knowledgeManagementService.setFileCategory(fileId, category);
        return ResponseEntity.ok(file);
    }

    @PutMapping("/files/{fileId}/tags")
    @Operation(summary = "设置文件标签", description = "设置文件的标签列表")
    public ResponseEntity<KnowledgeFile> setFileTags(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @RequestBody Map<String, List<String>> request) {
        List<String> tags = request.get("tags");
        KnowledgeFile file = knowledgeManagementService.setFileTags(fileId, tags);
        return ResponseEntity.ok(file);
    }

    @PostMapping("/files/{fileId}/tags")
    @Operation(summary = "添加文件标签", description = "为文件添加一个标签")
    public ResponseEntity<KnowledgeFile> addFileTag(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @RequestBody Map<String, String> request) {
        String tag = request.get("tag");
        KnowledgeFile file = knowledgeManagementService.addFileTag(fileId, tag);
        return ResponseEntity.ok(file);
    }

    @DeleteMapping("/files/{fileId}/tags/{tag}")
    @Operation(summary = "移除文件标签", description = "从文件中移除指定标签")
    public ResponseEntity<KnowledgeFile> removeFileTag(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @Parameter(description = "标签名称") @PathVariable String tag) {
        KnowledgeFile file = knowledgeManagementService.removeFileTag(fileId, tag);
        return ResponseEntity.ok(file);
    }

    // ========== 分类管理 API ==========

    @GetMapping("/categories")
    @Operation(summary = "获取所有分类", description = "获取所有文件分类列表")
    public ResponseEntity<List<FileCategory>> getCategories() {
        List<FileCategory> categories = knowledgeManagementService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/tree")
    @Operation(summary = "获取分类树", description = "获取分类的树形结构")
    public ResponseEntity<List<FileCategory>> getCategoryTree() {
        List<FileCategory> tree = knowledgeManagementService.getCategoryTree();
        return ResponseEntity.ok(tree);
    }

    @PostMapping("/categories")
    @Operation(summary = "创建分类", description = "创建新的文件分类")
    public ResponseEntity<FileCategory> createCategory(@RequestBody FileCategory category) {
        FileCategory created = knowledgeManagementService.createCategory(category);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "更新分类", description = "更新分类信息")
    public ResponseEntity<FileCategory> updateCategory(
            @Parameter(description = "分类ID") @PathVariable Long id,
            @RequestBody FileCategory category) {
        FileCategory updated = knowledgeManagementService.updateCategory(id, category);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "删除分类", description = "删除指定分类")
    public ResponseEntity<Boolean> deleteCategory(
            @Parameter(description = "分类ID") @PathVariable Long id) {
        boolean result = knowledgeManagementService.deleteCategory(id);
        return ResponseEntity.ok(result);
    }

    // ========== 标签管理 API ==========

    @GetMapping("/tags")
    @Operation(summary = "获取所有标签", description = "获取所有文件标签列表")
    public ResponseEntity<List<FileTag>> getTags() {
        List<FileTag> tags = knowledgeManagementService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/tags/popular")
    @Operation(summary = "获取热门标签", description = "获取使用最多的标签")
    public ResponseEntity<List<FileTag>> getPopularTags(
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "20") int limit) {
        List<FileTag> tags = knowledgeManagementService.getPopularTags(limit);
        return ResponseEntity.ok(tags);
    }

    @PostMapping("/tags")
    @Operation(summary = "创建标签", description = "创建新的文件标签")
    public ResponseEntity<FileTag> createTag(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String color = request.get("color");
        FileTag tag = knowledgeManagementService.createTag(name, color);
        return ResponseEntity.ok(tag);
    }

    @DeleteMapping("/tags/{id}")
    @Operation(summary = "删除标签", description = "删除指定标签")
    public ResponseEntity<Boolean> deleteTag(
            @Parameter(description = "标签ID") @PathVariable Long id) {
        boolean result = knowledgeManagementService.deleteTag(id);
        return ResponseEntity.ok(result);
    }
}