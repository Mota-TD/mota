package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分片上传实体
 */
@Data
@TableName("chunk_upload")
public class ChunkUpload {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 上传ID（唯一标识一次上传）
     */
    private String uploadId;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件大小
     */
    private Long fileSize;

    /**
     * 文件MD5
     */
    private String md5Hash;

    /**
     * MIME类型
     */
    private String mimeType;

    /**
     * 分片大小
     */
    private Long chunkSize;

    /**
     * 总分片数
     */
    private Integer totalChunks;

    /**
     * 已上传分片数
     */
    private Integer uploadedChunks;

    /**
     * 已上传分片索引（JSON数组）
     */
    private String uploadedChunkIndexes;

    /**
     * 目标文件夹ID
     */
    private Long targetFolderId;

    /**
     * 目标项目ID
     */
    private Long targetProjectId;

    /**
     * 存储桶名称
     */
    private String bucketName;

    /**
     * 临时存储路径
     */
    private String tempPath;

    /**
     * 关联的文件ID（合并完成后）
     */
    private Long fileId;

    /**
     * 状态：uploading/completed/failed/expired
     */
    private String status;

    /**
     * 过期时间
     */
    private LocalDateTime expireAt;

    /**
     * 创建人
     */
    private Long createdBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}