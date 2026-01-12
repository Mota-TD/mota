package com.mota.collab.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.collab.entity.Document;
import com.mota.collab.service.DocumentService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文档控制器
 */
@Tag(name = "文档管理", description = "文档CRUD、搜索、收藏等功能")
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "创建文档")
    @PostMapping
    public Result<Document> createDocument(@RequestBody Document document) {
        return Result.success(documentService.createDocument(document));
    }

    @Operation(summary = "创建文件夹")
    @PostMapping("/folder")
    public Result<Document> createFolder(
            @RequestParam(required = false) Long parentId,
            @RequestParam String title,
            @RequestParam(required = false) Long projectId) {
        return Result.success(documentService.createFolder(parentId, title, projectId));
    }

    @Operation(summary = "更新文档")
    @PutMapping("/{documentId}")
    public Result<Document> updateDocument(
            @PathVariable Long documentId,
            @RequestBody Document document) {
        document.setId(documentId);
        return Result.success(documentService.updateDocument(document));
    }

    @Operation(summary = "更新文档内容")
    @PutMapping("/{documentId}/content")
    public Result<Document> updateContent(
            @PathVariable Long documentId,
            @RequestBody ContentUpdateRequest request) {
        return Result.success(documentService.updateContent(documentId, request.getContent(), request.getPlainText()));
    }

    @Operation(summary = "获取文档详情")
    @GetMapping("/{documentId}")
    public Result<Document> getDocument(@PathVariable Long documentId) {
        documentService.incrementViewCount(documentId);
        return Result.success(documentService.getById(documentId));
    }

    @Operation(summary = "删除文档")
    @DeleteMapping("/{documentId}")
    public Result<Void> deleteDocument(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return Result.success();
    }

    @Operation(summary = "批量删除文档")
    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> documentIds) {
        documentService.batchDelete(documentIds);
        return Result.success();
    }

    @Operation(summary = "移动文档")
    @PostMapping("/{documentId}/move")
    public Result<Void> moveDocument(
            @PathVariable Long documentId,
            @RequestParam(required = false) Long targetFolderId) {
        documentService.moveDocument(documentId, targetFolderId);
        return Result.success();
    }

    @Operation(summary = "复制文档")
    @PostMapping("/{documentId}/copy")
    public Result<Document> copyDocument(
            @PathVariable Long documentId,
            @RequestParam(required = false) Long targetFolderId) {
        return Result.success(documentService.copyDocument(documentId, targetFolderId));
    }

    @Operation(summary = "获取文件夹下的文档列表")
    @GetMapping("/folder/{parentId}")
    public Result<List<Document>> listByParentId(@PathVariable Long parentId) {
        return Result.success(documentService.listByParentId(parentId));
    }

    @Operation(summary = "获取根目录文档列表")
    @GetMapping("/root")
    public Result<List<Document>> listRootDocuments() {
        return Result.success(documentService.listByParentId(null));
    }

    @Operation(summary = "获取项目下的文档列表")
    @GetMapping("/project/{projectId}")
    public Result<List<Document>> listByProjectId(@PathVariable Long projectId) {
        return Result.success(documentService.listByProjectId(projectId));
    }

    @Operation(summary = "获取收藏的文档")
    @GetMapping("/favorites")
    public Result<List<Document>> listFavorites(@RequestParam Long userId) {
        return Result.success(documentService.listFavorites(userId));
    }

    @Operation(summary = "获取最近访问的文档")
    @GetMapping("/recent")
    public Result<List<Document>> listRecentDocuments(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return Result.success(documentService.listRecentDocuments(userId, limit));
    }

    @Operation(summary = "搜索文档")
    @GetMapping("/search")
    public Result<IPage<Document>> searchDocuments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String docType) {
        Page<Document> pageParam = new Page<>(page, size);
        return Result.success(documentService.searchDocuments(pageParam, keyword, projectId, docType));
    }

    @Operation(summary = "获取文档路径（面包屑）")
    @GetMapping("/{documentId}/path")
    public Result<List<Document>> getDocumentPath(@PathVariable Long documentId) {
        return Result.success(documentService.getDocumentPath(documentId));
    }

    @Operation(summary = "收藏/取消收藏文档")
    @PostMapping("/{documentId}/favorite")
    public Result<Void> toggleFavorite(
            @PathVariable Long documentId,
            @RequestParam boolean favorite) {
        documentService.toggleFavorite(documentId, favorite);
        return Result.success();
    }

    @Operation(summary = "置顶/取消置顶文档")
    @PostMapping("/{documentId}/pin")
    public Result<Void> togglePinned(
            @PathVariable Long documentId,
            @RequestParam boolean pinned) {
        documentService.togglePinned(documentId, pinned);
        return Result.success();
    }

    @Operation(summary = "锁定文档")
    @PostMapping("/{documentId}/lock")
    public Result<Void> lockDocument(
            @PathVariable Long documentId,
            @RequestParam Long userId) {
        documentService.lockDocument(documentId, userId);
        return Result.success();
    }

    @Operation(summary = "解锁文档")
    @PostMapping("/{documentId}/unlock")
    public Result<Void> unlockDocument(@PathVariable Long documentId) {
        documentService.unlockDocument(documentId);
        return Result.success();
    }

    @Operation(summary = "归档文档")
    @PostMapping("/{documentId}/archive")
    public Result<Void> archiveDocument(@PathVariable Long documentId) {
        documentService.archiveDocument(documentId);
        return Result.success();
    }

    @Operation(summary = "发布文档")
    @PostMapping("/{documentId}/publish")
    public Result<Void> publishDocument(@PathVariable Long documentId) {
        documentService.publishDocument(documentId);
        return Result.success();
    }

    @Operation(summary = "更新排序")
    @PostMapping("/{documentId}/sort")
    public Result<Void> updateSortOrder(
            @PathVariable Long documentId,
            @RequestParam Integer sortOrder) {
        documentService.updateSortOrder(documentId, sortOrder);
        return Result.success();
    }

    /**
     * 内容更新请求
     */
    @lombok.Data
    public static class ContentUpdateRequest {
        private String content;
        private String plainText;
    }
}