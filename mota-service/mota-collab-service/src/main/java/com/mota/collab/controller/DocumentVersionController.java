package com.mota.collab.controller;

import com.mota.collab.entity.DocumentVersion;
import com.mota.collab.service.DocumentVersionService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文档版本控制器
 */
@Tag(name = "文档版本管理", description = "版本历史、版本对比、版本回滚等功能")
@RestController
@RequestMapping("/api/v1/documents/{documentId}/versions")
@RequiredArgsConstructor
public class DocumentVersionController {

    private final DocumentVersionService versionService;

    @Operation(summary = "创建手动版本")
    @PostMapping
    public Result<DocumentVersion> createVersion(
            @PathVariable Long documentId,
            @RequestBody VersionCreateRequest request) {
        return Result.success(versionService.createManualVersion(
            documentId, 
            request.getContent(), 
            request.getPlainText(), 
            request.getChangeSummary()
        ));
    }

    @Operation(summary = "获取版本历史")
    @GetMapping
    public Result<List<DocumentVersion>> listVersions(@PathVariable Long documentId) {
        return Result.success(versionService.listVersions(documentId));
    }

    @Operation(summary = "获取主要版本列表")
    @GetMapping("/major")
    public Result<List<DocumentVersion>> listMajorVersions(@PathVariable Long documentId) {
        return Result.success(versionService.listMajorVersions(documentId));
    }

    @Operation(summary = "获取最新版本")
    @GetMapping("/latest")
    public Result<DocumentVersion> getLatestVersion(@PathVariable Long documentId) {
        return Result.success(versionService.getLatestVersion(documentId));
    }

    @Operation(summary = "获取指定版本号的版本")
    @GetMapping("/number/{versionNumber}")
    public Result<DocumentVersion> getByVersionNumber(
            @PathVariable Long documentId,
            @PathVariable Integer versionNumber) {
        return Result.success(versionService.getByVersionNumber(documentId, versionNumber));
    }

    @Operation(summary = "获取版本详情")
    @GetMapping("/{versionId}")
    public Result<DocumentVersion> getVersion(@PathVariable Long versionId) {
        return Result.success(versionService.getById(versionId));
    }

    @Operation(summary = "回滚到指定版本")
    @PostMapping("/{versionId}/rollback")
    public Result<DocumentVersion> rollbackToVersion(
            @PathVariable Long documentId,
            @PathVariable Long versionId) {
        return Result.success(versionService.rollbackToVersion(documentId, versionId));
    }

    @Operation(summary = "比较两个版本")
    @GetMapping("/compare")
    public Result<String> compareVersions(
            @RequestParam Long versionId1,
            @RequestParam Long versionId2) {
        return Result.success(versionService.compareVersions(versionId1, versionId2));
    }

    @Operation(summary = "删除版本")
    @DeleteMapping("/{versionId}")
    public Result<Void> deleteVersion(@PathVariable Long versionId) {
        versionService.deleteVersion(versionId);
        return Result.success();
    }

    @Operation(summary = "清理旧版本")
    @PostMapping("/cleanup")
    public Result<Void> cleanupOldVersions(
            @PathVariable Long documentId,
            @RequestParam(defaultValue = "50") int keepCount) {
        versionService.cleanupOldVersions(documentId, keepCount);
        return Result.success();
    }

    /**
     * 版本创建请求
     */
    @lombok.Data
    public static class VersionCreateRequest {
        private String content;
        private String plainText;
        private String changeSummary;
    }
}