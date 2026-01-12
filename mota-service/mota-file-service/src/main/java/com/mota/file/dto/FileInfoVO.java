package com.mota.file.dto;

import com.mota.file.entity.FileInfo;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件信息VO
 * 
 * @author mota
 */
@Data
public class FileInfoVO {

    /**
     * 文件ID
     */
    private Long id;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件URL
     */
    private String fileUrl;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件大小（格式化）
     */
    private String fileSizeFormatted;

    /**
     * 文件类型
     */
    private String mimeType;

    /**
     * 文件扩展名
     */
    private String extension;

    /**
     * 文件分类
     */
    private String category;

    /**
     * 缩略图URL
     */
    private String thumbnailUrl;

    /**
     * 预览URL
     */
    private String previewUrl;

    /**
     * 图片宽度
     */
    private Integer width;

    /**
     * 图片高度
     */
    private Integer height;

    /**
     * 视频/音频时长
     */
    private Integer duration;

    /**
     * 访问次数
     */
    private Long accessCount;

    /**
     * 下载次数
     */
    private Long downloadCount;

    /**
     * 上传用户名
     */
    private String uploadUserName;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 从实体转换
     */
    public static FileInfoVO fromEntity(FileInfo entity) {
        if (entity == null) {
            return null;
        }
        FileInfoVO vo = new FileInfoVO();
        vo.setId(entity.getId());
        vo.setFileName(entity.getFileName());
        vo.setFileUrl(entity.getFileUrl());
        vo.setFileSize(entity.getFileSize());
        vo.setFileSizeFormatted(formatFileSize(entity.getFileSize()));
        vo.setMimeType(entity.getMimeType());
        vo.setExtension(entity.getExtension());
        vo.setCategory(entity.getCategory());
        vo.setThumbnailUrl(entity.getThumbnailPath());
        vo.setPreviewUrl(entity.getPreviewPath());
        vo.setWidth(entity.getWidth());
        vo.setHeight(entity.getHeight());
        vo.setDuration(entity.getDuration());
        vo.setAccessCount(entity.getAccessCount());
        vo.setDownloadCount(entity.getDownloadCount());
        vo.setUploadUserName(entity.getUploadUserName());
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }

    /**
     * 格式化文件大小
     */
    private static String formatFileSize(Long size) {
        if (size == null || size <= 0) {
            return "0 B";
        }
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double fileSize = size;
        while (fileSize >= 1024 && unitIndex < units.length - 1) {
            fileSize /= 1024;
            unitIndex++;
        }
        return String.format("%.2f %s", fileSize, units[unitIndex]);
    }
}