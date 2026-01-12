package com.mota.file.service;

import com.mota.file.entity.FileInfo;

import java.io.InputStream;

/**
 * 缩略图服务接口
 * 
 * @author mota
 */
public interface ThumbnailService {

    /**
     * 生成图片缩略图
     *
     * @param fileInfo 文件信息
     * @param width 宽度
     * @param height 高度
     * @return 缩略图URL
     */
    String generateImageThumbnail(FileInfo fileInfo, int width, int height);

    /**
     * 生成视频缩略图（截取第一帧）
     *
     * @param fileInfo 文件信息
     * @param width 宽度
     * @param height 高度
     * @return 缩略图URL
     */
    String generateVideoThumbnail(FileInfo fileInfo, int width, int height);

    /**
     * 生成PDF缩略图（第一页）
     *
     * @param fileInfo 文件信息
     * @param width 宽度
     * @param height 高度
     * @return 缩略图URL
     */
    String generatePdfThumbnail(FileInfo fileInfo, int width, int height);

    /**
     * 生成Office文档缩略图
     *
     * @param fileInfo 文件信息
     * @param width 宽度
     * @param height 高度
     * @return 缩略图URL
     */
    String generateOfficeThumbnail(FileInfo fileInfo, int width, int height);

    /**
     * 获取缩略图
     *
     * @param fileId 文件ID
     * @param width 宽度
     * @param height 高度
     * @return 缩略图输入流
     */
    InputStream getThumbnail(Long fileId, int width, int height);
}