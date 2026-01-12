package com.mota.knowledge.controller;

import com.mota.common.core.result.Result;
import com.mota.knowledge.entity.FileVersion;
import com.mota.knowledge.service.FileVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文件版本控制器
 */
@Tag(name = "文件版本", description = "文件版本管理接口")
@RestController
@RequestMapping("/api/v1/knowledge/files")
@RequiredArgsConstructor
public class FileVersionController {

    private final FileVersionService versionService;

    @Operation(summary = "创建新版本")
    @PostMapping("/{fileId}/versions")
    public Result<FileVersion> createVersion(
            @PathVariable Long fileId,
            @Parameter(description = "变更描述") @RequestParam(required = false) String changeDescription) {
        return Result.success(versionService.createVersion(fileId, changeDescription));
    }

    @Operation(summary = "获取文件的所有版本")
    @GetMapping("/{fileId}/versions")
    public Result<List<FileVersion>> getFileVersions(@PathVariable Long fileId) {
        return Result.success(versionService.getFileVersions(fileId));
    }

    @Operation(summary = "获取指定版本")
    @GetMapping("/versions/{versionId}")
    public Result<FileVersion> getVersion(@PathVariable Long versionId) {
        return Result.success(versionService.getVersion(versionId));
    }

    @Operation(summary = "获取文件的最新版本")
    @GetMapping("/{fileId}/versions/latest")
    public Result<FileVersion> getLatestVersion(@PathVariable Long fileId) {
        return Result.success(versionService.getLatestVersion(fileId));
    }

    @Operation(summary = "获取指定版本号的版本")
    @GetMapping("/{fileId}/versions/number/{versionNumber}")
    public Result<FileVersion> getVersionByNumber(
            @PathVariable Long fileId,
            @PathVariable Integer versionNumber) {
        return Result.success(versionService.getVersionByNumber(fileId, versionNumber));
    }

    @Operation(summary = "回滚到指定版本")
    @PostMapping("/{fileId}/versions/{versionId}/rollback")
    public Result<FileVersion> rollbackToVersion(
            @PathVariable Long fileId,
            @PathVariable Long versionId) {
        return Result.success(versionService.rollbackToVersion(fileId, versionId));
    }

    @Operation(summary = "比较两个版本")
    @GetMapping("/versions/compare")
    public Result<Object> compareVersions(
            @Parameter(description = "版本1 ID") @RequestParam Long versionId1,
            @Parameter(description = "版本2 ID") @RequestParam Long versionId2) {
        return Result.success(versionService.compareVersions(versionId1, versionId2));
    }

    @Operation(summary = "删除版本")
    @DeleteMapping("/versions/{versionId}")
    public Result<Void> deleteVersion(@PathVariable Long versionId) {
        versionService.deleteVersion(versionId);
        return Result.success();
    }

    @Operation(summary = "清理旧版本")
    @PostMapping("/{fileId}/versions/clean")
    public Result<Void> cleanOldVersions(
            @PathVariable Long fileId,
            @Parameter(description = "保留版本数") @RequestParam(defaultValue = "10") Integer keepCount) {
        versionService.cleanOldVersions(fileId, keepCount);
        return Result.success();
    }
}