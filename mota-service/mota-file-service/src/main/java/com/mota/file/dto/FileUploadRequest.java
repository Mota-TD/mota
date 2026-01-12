package com.mota.file.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

/**
 * 文件上传请求
 * 
 * @author mota
 */
@Data
public class FileUploadRequest {

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 关联业务ID
     */
    private Long businessId;

    /**
     * 是否公开访问
     */
    private Boolean isPublic = false;

    /**
     * 自定义存储路径
     */
    private String customPath;

    /**
     * 是否生成缩略图（仅图片）
     */
    private Boolean generateThumbnail = true;

    /**
     * 缩略图宽度
     */
    private Integer thumbnailWidth = 200;

    /**
     * 缩略图高度
     */
    private Integer thumbnailHeight = 200;
}