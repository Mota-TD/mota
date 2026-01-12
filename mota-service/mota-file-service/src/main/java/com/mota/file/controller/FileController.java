package com.mota.file.controller;

import com.mota.common.core.result.Result;
import com.mota.common.security.util.SecurityUtils;
import com.mota.file.dto.*;
import com.mota.file.service.FileService;
import com.mota.file.service.PreviewService;
import com.mota.file.service.ThumbnailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 文件控制器
 * 
 * @author mota
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "文件管理", description = "文件上传、下载、预览等接口")
public class FileController {

    private final FileService fileService;
    private final PreviewService previewService;
    private final ThumbnailService thumbnailService;

    @PostMapping("/upload")
    @Operation(summary = "上传文件", description = "上传单个文件")
    public Result<FileInfoVO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @ModelAttribute FileUploadRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        String userName = SecurityUtils.getUsername();
        
        FileInfoVO fileInfo = fileService.uploadFile(file, request, tenantId, userId, userName);
        return Result.success(fileInfo);
    }

    @PostMapping("/upload/batch")
    @Operation(summary = "批量上传文件", description = "批量上传多个文件")
    public Result<List<FileInfoVO>> uploadFiles(
            @RequestParam("files") List<MultipartFile> files,
            @ModelAttribute FileUploadRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        String userName = SecurityUtils.getUsername();
        
        List<FileInfoVO> fileInfos = fileService.uploadFiles(files, request, tenantId, userId, userName);
        return Result.success(fileInfos);
    }

    @GetMapping("/instant-check")
    @Operation(summary = "秒传检查", description = "根据MD5检查文件是否已存在")
    public Result<FileInfoVO> checkInstantUpload(
            @Parameter(description = "文件MD5") @RequestParam String md5Hash) {
        Long tenantId = SecurityUtils.getTenantId();
        FileInfoVO fileInfo = fileService.checkInstantUpload(md5Hash, tenantId);
        return Result.success(fileInfo);
    }

    @PostMapping("/chunk/init")
    @Operation(summary = "初始化分片上传", description = "初始化分片上传任务，支持秒传和断点续传")
    public Result<ChunkUploadInitResponse> initChunkUpload(
            @RequestBody @Validated ChunkUploadInitRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        
        ChunkUploadInitResponse response = fileService.initChunkUpload(request, tenantId, userId);
        return Result.success(response);
    }

    @PostMapping("/chunk/upload")
    @Operation(summary = "上传分片", description = "上传单个分片")
    public Result<Boolean> uploadChunk(
            @Parameter(description = "上传ID") @RequestParam String uploadId,
            @Parameter(description = "分片索引") @RequestParam int chunkIndex,
            @RequestParam("file") MultipartFile file) {
        Long tenantId = SecurityUtils.getTenantId();
        
        boolean success = fileService.uploadChunk(uploadId, chunkIndex, file, tenantId);
        return Result.success(success);
    }

    @PostMapping("/chunk/complete")
    @Operation(summary = "完成分片上传", description = "合并所有分片完成上传")
    public Result<FileInfoVO> completeChunkUpload(
            @Parameter(description = "上传ID") @RequestParam String uploadId) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        String userName = SecurityUtils.getUsername();
        
        FileInfoVO fileInfo = fileService.completeChunkUpload(uploadId, tenantId, userId, userName);
        return Result.success(fileInfo);
    }

    @DeleteMapping("/chunk/cancel")
    @Operation(summary = "取消分片上传", description = "取消分片上传任务")
    public Result<Void> cancelChunkUpload(
            @Parameter(description = "上传ID") @RequestParam String uploadId) {
        Long tenantId = SecurityUtils.getTenantId();
        
        fileService.cancelChunkUpload(uploadId, tenantId);
        return Result.success();
    }

    @GetMapping("/chunk/progress")
    @Operation(summary = "获取上传进度", description = "获取分片上传进度")
    public Result<List<Integer>> getUploadProgress(
            @Parameter(description = "上传ID") @RequestParam String uploadId) {
        Long tenantId = SecurityUtils.getTenantId();
        
        List<Integer> uploadedChunks = fileService.getUploadProgress(uploadId, tenantId);
        return Result.success(uploadedChunks);
    }

    @GetMapping("/{fileId}")
    @Operation(summary = "获取文件信息", description = "获取文件详细信息")
    public Result<FileInfoVO> getFileInfo(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        Long tenantId = SecurityUtils.getTenantId();
        
        FileInfoVO fileInfo = fileService.getFileInfo(fileId, tenantId);
        return Result.success(fileInfo);
    }

    @GetMapping("/{fileId}/download")
    @Operation(summary = "下载文件", description = "下载文件")
    public ResponseEntity<InputStreamResource> downloadFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            HttpServletRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        String userName = SecurityUtils.getUsername();
        
        FileInfoVO fileInfo = fileService.getFileInfo(fileId, tenantId);
        InputStream inputStream = fileService.downloadFile(fileId, tenantId);
        
        // 记录访问日志
        fileService.recordAccess(fileId, "download", userId, userName, 
                getClientIp(request), request.getHeader("User-Agent"));
        
        String encodedFileName = URLEncoder.encode(fileInfo.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename*=UTF-8''" + encodedFileName)
                .contentType(MediaType.parseMediaType(fileInfo.getMimeType()))
                .contentLength(fileInfo.getFileSize())
                .body(new InputStreamResource(inputStream));
    }

    @GetMapping("/{fileId}/url")
    @Operation(summary = "获取预签名URL", description = "获取文件的临时访问URL")
    public Result<String> getPresignedUrl(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @Parameter(description = "过期时间（秒）") @RequestParam(defaultValue = "3600") int expiry) {
        Long tenantId = SecurityUtils.getTenantId();
        
        String url = fileService.getPresignedUrl(fileId, tenantId, expiry);
        return Result.success(url);
    }

    @GetMapping("/{fileId}/preview")
    @Operation(summary = "预览文件", description = "获取文件预览")
    public ResponseEntity<InputStreamResource> previewFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            HttpServletRequest request) {
        Long tenantId = SecurityUtils.getTenantId();
        Long userId = SecurityUtils.getUserId();
        String userName = SecurityUtils.getUsername();
        
        InputStream inputStream = previewService.getPreview(fileId, tenantId);
        
        // 记录访问日志
        fileService.recordAccess(fileId, "preview", userId, userName,
                getClientIp(request), request.getHeader("User-Agent"));
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(inputStream));
    }

    @GetMapping("/{fileId}/preview-url")
    @Operation(summary = "获取预览URL", description = "获取文件预览URL")
    public Result<String> getPreviewUrl(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        Long tenantId = SecurityUtils.getTenantId();
        
        String url = previewService.getPreviewUrl(fileId, tenantId);
        return Result.success(url);
    }

    @GetMapping("/{fileId}/thumbnail")
    @Operation(summary = "获取缩略图", description = "获取文件缩略图")
    public ResponseEntity<InputStreamResource> getThumbnail(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @Parameter(description = "宽度") @RequestParam(defaultValue = "200") int width,
            @Parameter(description = "高度") @RequestParam(defaultValue = "200") int height) {
        
        InputStream inputStream = thumbnailService.getThumbnail(fileId, width, height);
        
        if (inputStream == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(new InputStreamResource(inputStream));
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "删除文件", description = "删除单个文件")
    public Result<Void> deleteFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        Long tenantId = SecurityUtils.getTenantId();
        
        fileService.deleteFile(fileId, tenantId);
        return Result.success();
    }

    @DeleteMapping("/batch")
    @Operation(summary = "批量删除文件", description = "批量删除多个文件")
    public Result<Void> deleteFiles(
            @Parameter(description = "文件ID列表") @RequestBody List<Long> fileIds) {
        Long tenantId = SecurityUtils.getTenantId();
        
        fileService.deleteFiles(fileIds, tenantId);
        return Result.success();
    }

    @GetMapping("/list")
    @Operation(summary = "查询文件列表", description = "根据业务类型和业务ID查询文件列表")
    public Result<List<FileInfoVO>> listFiles(
            @Parameter(description = "业务类型") @RequestParam(required = false) String businessType,
            @Parameter(description = "业务ID") @RequestParam(required = false) Long businessId) {
        Long tenantId = SecurityUtils.getTenantId();
        
        List<FileInfoVO> files = fileService.listFiles(businessType, businessId, tenantId);
        return Result.success(files);
    }

    /**
     * 获取客户端IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理时取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}