package com.mota.knowledge.controller;

import com.mota.common.core.result.Result;
import com.mota.knowledge.entity.ChunkUpload;
import com.mota.knowledge.service.ChunkUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 分片上传控制器
 */
@Tag(name = "分片上传", description = "大文件分片上传接口")
@RestController
@RequestMapping("/api/v1/knowledge/upload")
@RequiredArgsConstructor
public class ChunkUploadController {

    private final ChunkUploadService uploadService;

    @Operation(summary = "初始化分片上传")
    @PostMapping("/init")
    public Result<Map<String, Object>> initUpload(
            @Parameter(description = "文件名") @RequestParam String fileName,
            @Parameter(description = "文件大小") @RequestParam Long fileSize,
            @Parameter(description = "总分片数") @RequestParam Integer totalChunks,
            @Parameter(description = "文件MD5") @RequestParam(required = false) String md5Hash) {
        return Result.success(uploadService.initUpload(fileName, fileSize, totalChunks, md5Hash));
    }

    @Operation(summary = "上传分片")
    @PostMapping("/chunk")
    public Result<ChunkUpload> uploadChunk(
            @Parameter(description = "上传ID") @RequestParam String uploadId,
            @Parameter(description = "分片索引") @RequestParam Integer chunkIndex,
            @Parameter(description = "分片文件") @RequestParam("file") MultipartFile file,
            @Parameter(description = "分片MD5") @RequestParam(required = false) String chunkMd5) throws IOException {
        return Result.success(uploadService.uploadChunk(uploadId, chunkIndex, file.getBytes(), chunkMd5));
    }

    @Operation(summary = "获取上传进度")
    @GetMapping("/{uploadId}/progress")
    public Result<Map<String, Object>> getUploadProgress(@PathVariable String uploadId) {
        return Result.success(uploadService.getUploadProgress(uploadId));
    }

    @Operation(summary = "获取已上传的分片列表")
    @GetMapping("/{uploadId}/chunks")
    public Result<List<Integer>> getUploadedChunks(@PathVariable String uploadId) {
        return Result.success(uploadService.getUploadedChunks(uploadId));
    }

    @Operation(summary = "合并分片")
    @PostMapping("/{uploadId}/merge")
    public Result<Long> mergeChunks(
            @PathVariable String uploadId,
            @Parameter(description = "项目ID") @RequestParam Long projectId,
            @Parameter(description = "父文件夹ID") @RequestParam(required = false) Long parentId) {
        return Result.success(uploadService.mergeChunks(uploadId, projectId, parentId));
    }

    @Operation(summary = "取消上传")
    @DeleteMapping("/{uploadId}")
    public Result<Void> cancelUpload(@PathVariable String uploadId) {
        uploadService.cancelUpload(uploadId);
        return Result.success();
    }

    @Operation(summary = "秒传检查")
    @GetMapping("/instant-check")
    public Result<Long> checkInstantUpload(
            @Parameter(description = "文件MD5") @RequestParam String md5Hash) {
        return Result.success(uploadService.checkInstantUpload(md5Hash));
    }
}