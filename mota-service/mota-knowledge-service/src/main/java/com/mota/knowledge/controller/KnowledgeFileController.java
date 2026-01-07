package com.mota.knowledge.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.knowledge.entity.KnowledgeFile;
import com.mota.knowledge.service.KnowledgeFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 知识文件控制器
 */
@RestController
@RequestMapping("/api/v1/knowledge/files")
@RequiredArgsConstructor
public class KnowledgeFileController {

    private final KnowledgeFileService knowledgeFileService;

    /**
     * 上传文件
     */
    @PostMapping("/upload")
    public Result<KnowledgeFile> uploadFile(
            @RequestParam Long enterpriseId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long parentId,
            @RequestParam Long userId,
            @RequestParam("file") MultipartFile file) {
        KnowledgeFile knowledgeFile = knowledgeFileService.uploadFile(enterpriseId, projectId, parentId, file, userId);
        return Result.success(knowledgeFile);
    }

    /**
     * 创建文件夹
     */
    @PostMapping("/folders")
    public Result<KnowledgeFile> createFolder(@RequestBody Map<String, Object> request) {
        Long enterpriseId = Long.valueOf(request.get("enterpriseId").toString());
        Long projectId = request.get("projectId") != null ? 
            Long.valueOf(request.get("projectId").toString()) : null;
        Long parentId = request.get("parentId") != null ? 
            Long.valueOf(request.get("parentId").toString()) : null;
        String name = (String) request.get("name");
        Long userId = Long.valueOf(request.get("userId").toString());
        
        KnowledgeFile folder = knowledgeFileService.createFolder(enterpriseId, projectId, parentId, name, userId);
        return Result.success(folder);
    }

    /**
     * 获取文件列表
     */
    @GetMapping
    public Result<IPage<KnowledgeFile>> getFileList(
            @RequestParam Long enterpriseId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long parentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<KnowledgeFile> files = knowledgeFileService.getFileList(enterpriseId, projectId, parentId, page, size);
        return Result.success(files);
    }

    /**
     * 获取文件详情
     */
    @GetMapping("/{id}")
    public Result<KnowledgeFile> getFileById(@PathVariable Long id) {
        KnowledgeFile file = knowledgeFileService.getFileById(id);
        return Result.success(file);
    }

    /**
     * 更新文件
     */
    @PutMapping("/{id}")
    public Result<Void> updateFile(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        knowledgeFileService.updateFile(id, request.get("name"), request.get("content"));
        return Result.success();
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteFile(@PathVariable Long id) {
        knowledgeFileService.deleteFile(id);
        return Result.success();
    }

    /**
     * 移动文件
     */
    @PostMapping("/{id}/move")
    public Result<Void> moveFile(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        knowledgeFileService.moveFile(id, request.get("targetFolderId"));
        return Result.success();
    }

    /**
     * 复制文件
     */
    @PostMapping("/{id}/copy")
    public Result<KnowledgeFile> copyFile(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        KnowledgeFile file = knowledgeFileService.copyFile(id, request.get("targetFolderId"));
        return Result.success(file);
    }

    /**
     * 搜索文件
     */
    @GetMapping("/search")
    public Result<IPage<KnowledgeFile>> searchFiles(
            @RequestParam Long enterpriseId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<KnowledgeFile> files = knowledgeFileService.searchFiles(enterpriseId, keyword, page, size);
        return Result.success(files);
    }

    /**
     * 获取最近文件
     */
    @GetMapping("/recent")
    public Result<List<KnowledgeFile>> getRecentFiles(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        List<KnowledgeFile> files = knowledgeFileService.getRecentFiles(userId, limit);
        return Result.success(files);
    }

    /**
     * 获取文件下载URL
     */
    @GetMapping("/{id}/download-url")
    public Result<String> getDownloadUrl(@PathVariable Long id) {
        String url = knowledgeFileService.getDownloadUrl(id);
        return Result.success(url);
    }
}