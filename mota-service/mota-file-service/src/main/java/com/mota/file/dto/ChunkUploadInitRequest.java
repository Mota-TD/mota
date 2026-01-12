package com.mota.file.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * 分片上传初始化请求
 * 
 * @author mota
 */
@Data
public class ChunkUploadInitRequest {

    /**
     * 文件名
     */
    @NotBlank(message = "文件名不能为空")
    private String fileName;

    /**
     * 文件大小（字节）
     */
    @NotNull(message = "文件大小不能为空")
    @Positive(message = "文件大小必须大于0")
    private Long fileSize;

    /**
     * 文件MD5
     */
    @NotBlank(message = "文件MD5不能为空")
    private String md5Hash;

    /**
     * 文件类型
     */
    private String mimeType;

    /**
     * 分片大小（字节），默认5MB
     */
    private Long chunkSize = 5 * 1024 * 1024L;

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
}