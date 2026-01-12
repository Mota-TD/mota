package com.mota.file.service;

import com.mota.file.entity.FileInfo;

import java.io.InputStream;

/**
 * 文件预览服务接口
 * 
 * @author mota
 */
public interface PreviewService {

    /**
     * 获取文件预览
     *
     * @param fileId 文件ID
     * @param tenantId 租户ID
     * @return 预览内容输入流
     */
    InputStream getPreview(Long fileId, Long tenantId);

    /**
     * 获取预览URL
     *
     * @param fileId 文件ID
     * @param tenantId 租户ID
     * @return 预览URL
     */
    String getPreviewUrl(Long fileId, Long tenantId);

    /**
     * 生成PDF预览
     *
     * @param fileInfo 文件信息
     * @return 预览URL
     */
    String generatePdfPreview(FileInfo fileInfo);

    /**
     * 生成Office文档预览（转PDF）
     *
     * @param fileInfo 文件信息
     * @return 预览URL
     */
    String generateOfficePreview(FileInfo fileInfo);

    /**
     * 生成文本文件预览
     *
     * @param fileInfo 文件信息
     * @return 预览URL
     */
    String generateTextPreview(FileInfo fileInfo);

    /**
     * 检查是否支持预览
     *
     * @param mimeType MIME类型
     * @return 是否支持
     */
    boolean isPreviewSupported(String mimeType);
}