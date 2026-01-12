package com.mota.file.service.impl;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import com.mota.file.config.MinioConfig;
import com.mota.file.entity.FileInfo;
import com.mota.file.mapper.FileInfoMapper;
import com.mota.file.service.StorageService;
import com.mota.file.service.ThumbnailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;

/**
 * 缩略图服务实现
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ThumbnailServiceImpl implements ThumbnailService {

    private final StorageService storageService;
    private final FileInfoMapper fileInfoMapper;
    private final MinioConfig minioConfig;

    @Override
    @Async
    public String generateImageThumbnail(FileInfo fileInfo, int width, int height) {
        try {
            // 下载原图
            InputStream inputStream = storageService.downloadFile(
                    fileInfo.getBucketName(), fileInfo.getFilePath());

            // 生成缩略图
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(inputStream)
                    .size(width, height)
                    .keepAspectRatio(true)
                    .outputFormat("jpg")
                    .outputQuality(0.8)
                    .toOutputStream(outputStream);

            // 上传缩略图
            String thumbnailName = String.format("thumb_%dx%d_%s.jpg", width, height, 
                    IdUtil.fastSimpleUUID());
            String thumbnailPath = generateThumbnailPath(fileInfo, thumbnailName);

            ByteArrayInputStream thumbnailInputStream = new ByteArrayInputStream(outputStream.toByteArray());
            String thumbnailUrl = storageService.uploadFile(
                    minioConfig.getThumbnailBucket(), 
                    thumbnailPath,
                    thumbnailInputStream,
                    "image/jpeg",
                    outputStream.size());

            // 更新文件信息
            fileInfo.setThumbnailPath(thumbnailUrl);
            fileInfoMapper.updateById(fileInfo);

            log.info("生成图片缩略图成功: fileId={}, thumbnailUrl={}", fileInfo.getId(), thumbnailUrl);
            return thumbnailUrl;
        } catch (Exception e) {
            log.error("生成图片缩略图失败: fileId={}", fileInfo.getId(), e);
            return null;
        }
    }

    @Override
    @Async
    public String generateVideoThumbnail(FileInfo fileInfo, int width, int height) {
        // 视频缩略图需要FFmpeg支持，这里提供基本框架
        log.info("视频缩略图生成需要FFmpeg支持: fileId={}", fileInfo.getId());
        // TODO: 使用FFmpeg截取视频第一帧
        return null;
    }

    @Override
    @Async
    public String generatePdfThumbnail(FileInfo fileInfo, int width, int height) {
        try {
            // 下载PDF文件
            InputStream inputStream = storageService.downloadFile(
                    fileInfo.getBucketName(), fileInfo.getFilePath());

            // 读取PDF第一页
            byte[] pdfBytes = inputStream.readAllBytes();
            try (PDDocument document = Loader.loadPDF(pdfBytes)) {
                PDFRenderer renderer = new PDFRenderer(document);
                BufferedImage image = renderer.renderImageWithDPI(0, 150);

                // 生成缩略图
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                Thumbnails.of(image)
                        .size(width, height)
                        .keepAspectRatio(true)
                        .outputFormat("jpg")
                        .outputQuality(0.8)
                        .toOutputStream(outputStream);

                // 上传缩略图
                String thumbnailName = String.format("thumb_%dx%d_%s.jpg", width, height,
                        IdUtil.fastSimpleUUID());
                String thumbnailPath = generateThumbnailPath(fileInfo, thumbnailName);

                ByteArrayInputStream thumbnailInputStream = new ByteArrayInputStream(outputStream.toByteArray());
                String thumbnailUrl = storageService.uploadFile(
                        minioConfig.getThumbnailBucket(),
                        thumbnailPath,
                        thumbnailInputStream,
                        "image/jpeg",
                        outputStream.size());

                // 更新文件信息
                fileInfo.setThumbnailPath(thumbnailUrl);
                fileInfoMapper.updateById(fileInfo);

                log.info("生成PDF缩略图成功: fileId={}, thumbnailUrl={}", fileInfo.getId(), thumbnailUrl);
                return thumbnailUrl;
            }
        } catch (Exception e) {
            log.error("生成PDF缩略图失败: fileId={}", fileInfo.getId(), e);
            return null;
        }
    }

    @Override
    @Async
    public String generateOfficeThumbnail(FileInfo fileInfo, int width, int height) {
        // Office文档缩略图需要LibreOffice或其他工具支持
        log.info("Office文档缩略图生成需要额外工具支持: fileId={}", fileInfo.getId());
        // TODO: 使用LibreOffice转换为PDF后再生成缩略图
        return null;
    }

    @Override
    public InputStream getThumbnail(Long fileId, int width, int height) {
        FileInfo fileInfo = fileInfoMapper.selectById(fileId);
        if (fileInfo == null) {
            return null;
        }

        // 如果已有缩略图，直接返回
        if (fileInfo.getThumbnailPath() != null) {
            String thumbnailPath = extractPathFromUrl(fileInfo.getThumbnailPath());
            return storageService.downloadFile(minioConfig.getThumbnailBucket(), thumbnailPath);
        }

        // 根据文件类型生成缩略图
        String category = fileInfo.getCategory();
        String thumbnailUrl = null;

        switch (category) {
            case FileInfo.Category.IMAGE:
                thumbnailUrl = generateImageThumbnail(fileInfo, width, height);
                break;
            case FileInfo.Category.VIDEO:
                thumbnailUrl = generateVideoThumbnail(fileInfo, width, height);
                break;
            case FileInfo.Category.DOCUMENT:
                if ("pdf".equalsIgnoreCase(fileInfo.getExtension())) {
                    thumbnailUrl = generatePdfThumbnail(fileInfo, width, height);
                } else {
                    thumbnailUrl = generateOfficeThumbnail(fileInfo, width, height);
                }
                break;
            default:
                return null;
        }

        if (thumbnailUrl != null) {
            String thumbnailPath = extractPathFromUrl(thumbnailUrl);
            return storageService.downloadFile(minioConfig.getThumbnailBucket(), thumbnailPath);
        }

        return null;
    }

    /**
     * 生成缩略图存储路径
     */
    private String generateThumbnailPath(FileInfo fileInfo, String thumbnailName) {
        return String.format("%d/thumbnails/%s", fileInfo.getTenantId(), thumbnailName);
    }

    /**
     * 从URL中提取路径
     */
    private String extractPathFromUrl(String url) {
        // 假设URL格式为: http://endpoint/bucket/path
        int bucketIndex = url.indexOf(minioConfig.getThumbnailBucket());
        if (bucketIndex > 0) {
            return url.substring(bucketIndex + minioConfig.getThumbnailBucket().length() + 1);
        }
        return url;
    }
}