package com.mota.file.service.impl;

import cn.hutool.core.util.IdUtil;
import com.mota.common.core.exception.BusinessException;
import com.mota.file.config.MinioConfig;
import com.mota.file.entity.FileInfo;
import com.mota.file.mapper.FileInfoMapper;
import com.mota.file.service.PreviewService;
import com.mota.file.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * 文件预览服务实现
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PreviewServiceImpl implements PreviewService {

    private final StorageService storageService;
    private final FileInfoMapper fileInfoMapper;
    private final MinioConfig minioConfig;

    /**
     * 支持预览的MIME类型
     */
    private static final Set<String> SUPPORTED_PREVIEW_TYPES = new HashSet<>(Arrays.asList(
            // 图片
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
            // PDF
            "application/pdf",
            // 文本
            "text/plain", "text/html", "text/css", "text/javascript",
            "application/json", "application/xml",
            // Office文档（需要转换）
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            // 代码文件
            "text/x-java-source", "text/x-python", "text/x-c", "text/x-c++",
            // Markdown
            "text/markdown"
    ));

    @Override
    public InputStream getPreview(Long fileId, Long tenantId) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null || !fileInfo.getTenantId().equals(tenantId)) {
            throw new BusinessException("文件不存在");
        }

        // 如果已有预览文件，直接返回
        if (fileInfo.getPreviewPath() != null) {
            String previewPath = extractPathFromUrl(fileInfo.getPreviewPath());
            return storageService.downloadFile(minioConfig.getPreviewBucket(), previewPath);
        }

        // 根据文件类型处理
        String mimeType = fileInfo.getMimeType();
        
        // 图片和PDF可以直接预览
        if (mimeType.startsWith("image/") || mimeType.equals("application/pdf")) {
            return storageService.downloadFile(fileInfo.getBucketName(), fileInfo.getFilePath());
        }

        // 文本文件直接返回
        if (mimeType.startsWith("text/") || mimeType.equals("application/json") 
                || mimeType.equals("application/xml")) {
            return storageService.downloadFile(fileInfo.getBucketName(), fileInfo.getFilePath());
        }

        // Office文档需要转换
        if (isOfficeDocument(mimeType)) {
            String previewUrl = generateOfficePreview(fileInfo);
            if (previewUrl != null) {
                String previewPath = extractPathFromUrl(previewUrl);
                return storageService.downloadFile(minioConfig.getPreviewBucket(), previewPath);
            }
        }

        throw new BusinessException("不支持预览该类型文件");
    }

    @Override
    public String getPreviewUrl(Long fileId, Long tenantId) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null || !fileInfo.getTenantId().equals(tenantId)) {
            throw new BusinessException("文件不存在");
        }

        // 如果已有预览文件
        if (fileInfo.getPreviewPath() != null) {
            return fileInfo.getPreviewPath();
        }

        // 图片和PDF可以直接预览
        String mimeType = fileInfo.getMimeType();
        if (mimeType.startsWith("image/") || mimeType.equals("application/pdf")) {
            return storageService.getPresignedUrl(fileInfo.getBucketName(), 
                    fileInfo.getFilePath(), minioConfig.getPresignedExpiry());
        }

        // 文本文件
        if (mimeType.startsWith("text/") || mimeType.equals("application/json")
                || mimeType.equals("application/xml")) {
            return storageService.getPresignedUrl(fileInfo.getBucketName(),
                    fileInfo.getFilePath(), minioConfig.getPresignedExpiry());
        }

        // Office文档需要转换
        if (isOfficeDocument(mimeType)) {
            String previewUrl = generateOfficePreview(fileInfo);
            if (previewUrl != null) {
                return previewUrl;
            }
        }

        throw new BusinessException("不支持预览该类型文件");
    }

    @Override
    public String generatePdfPreview(FileInfo fileInfo) {
        // PDF文件本身就可以预览，直接返回URL
        return storageService.getPresignedUrl(fileInfo.getBucketName(), 
                fileInfo.getFilePath(), minioConfig.getPresignedExpiry());
    }

    @Override
    @Async
    public String generateOfficePreview(FileInfo fileInfo) {
        // Office文档转PDF预览需要LibreOffice或其他工具
        // 这里提供基本框架，实际实现需要集成转换工具
        log.info("Office文档预览转换需要LibreOffice支持: fileId={}", fileInfo.getId());
        
        // TODO: 实现Office转PDF
        // 1. 下载Office文件
        // 2. 使用LibreOffice转换为PDF
        // 3. 上传PDF到预览存储桶
        // 4. 更新文件信息的previewPath
        
        return null;
    }

    @Override
    public String generateTextPreview(FileInfo fileInfo) {
        try {
            // 下载文本文件
            InputStream inputStream = storageService.downloadFile(
                    fileInfo.getBucketName(), fileInfo.getFilePath());
            
            // 读取内容
            byte[] content = inputStream.readAllBytes();
            String text = new String(content, StandardCharsets.UTF_8);
            
            // 生成HTML预览
            String html = generateHtmlPreview(text, fileInfo.getExtension());
            
            // 上传预览文件
            String previewName = String.format("preview_%s.html", IdUtil.fastSimpleUUID());
            String previewPath = generatePreviewPath(fileInfo, previewName);
            
            ByteArrayInputStream htmlInputStream = new ByteArrayInputStream(
                    html.getBytes(StandardCharsets.UTF_8));
            String previewUrl = storageService.uploadFile(
                    minioConfig.getPreviewBucket(),
                    previewPath,
                    htmlInputStream,
                    "text/html",
                    html.length());
            
            // 更新文件信息
            fileInfo.setPreviewPath(previewUrl);
            fileInfoMapper.updateById(fileInfo);
            
            return previewUrl;
        } catch (Exception e) {
            log.error("生成文本预览失败: fileId={}", fileInfo.getId(), e);
            return null;
        }
    }

    @Override
    public boolean isPreviewSupported(String mimeType) {
        if (mimeType == null) {
            return false;
        }
        return SUPPORTED_PREVIEW_TYPES.contains(mimeType) 
                || mimeType.startsWith("image/") 
                || mimeType.startsWith("text/");
    }

    /**
     * 检查是否为Office文档
     */
    private boolean isOfficeDocument(String mimeType) {
        return mimeType != null && (
                mimeType.contains("msword") ||
                mimeType.contains("wordprocessingml") ||
                mimeType.contains("ms-excel") ||
                mimeType.contains("spreadsheetml") ||
                mimeType.contains("ms-powerpoint") ||
                mimeType.contains("presentationml")
        );
    }

    /**
     * 生成HTML预览
     */
    private String generateHtmlPreview(String content, String extension) {
        String escapedContent = escapeHtml(content);
        String language = getLanguageFromExtension(extension);
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>文件预览</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
                <style>
                    body { margin: 0; padding: 20px; font-family: monospace; }
                    pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
                </style>
            </head>
            <body>
                <pre><code class="language-%s">%s</code></pre>
                <script>hljs.highlightAll();</script>
            </body>
            </html>
            """, language, escapedContent);
    }

    /**
     * HTML转义
     */
    private String escapeHtml(String content) {
        return content
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /**
     * 根据扩展名获取语言
     */
    private String getLanguageFromExtension(String extension) {
        if (extension == null) {
            return "plaintext";
        }
        return switch (extension.toLowerCase()) {
            case "java" -> "java";
            case "py" -> "python";
            case "js" -> "javascript";
            case "ts" -> "typescript";
            case "html", "htm" -> "html";
            case "css" -> "css";
            case "json" -> "json";
            case "xml" -> "xml";
            case "sql" -> "sql";
            case "sh", "bash" -> "bash";
            case "yml", "yaml" -> "yaml";
            case "md" -> "markdown";
            case "c" -> "c";
            case "cpp", "cc", "cxx" -> "cpp";
            case "go" -> "go";
            case "rs" -> "rust";
            case "rb" -> "ruby";
            case "php" -> "php";
            default -> "plaintext";
        };
    }

    /**
     * 生成预览文件存储路径
     */
    private String generatePreviewPath(FileInfo fileInfo, String previewName) {
        return String.format("%d/previews/%s", fileInfo.getTenantId(), previewName);
    }

    /**
     * 从URL中提取路径
     */
    private String extractPathFromUrl(String url) {
        int bucketIndex = url.indexOf(minioConfig.getPreviewBucket());
        if (bucketIndex > 0) {
            return url.substring(bucketIndex + minioConfig.getPreviewBucket().length() + 1);
        }
        return url;
    }
}