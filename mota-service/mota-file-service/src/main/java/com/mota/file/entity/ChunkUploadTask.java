package com.mota.file.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分片上传任务实体
 * 
 * @author mota
 */
@Data
@TableName("chunk_upload_task")
public class ChunkUploadTask {

    /**
     * 任务ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 上传标识（唯一标识一次上传）
     */
    private String uploadId;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件MD5
     */
    private String md5Hash;

    /**
     * 文件类型
     */
    private String mimeType;

    /**
     * 存储桶
     */
    private String bucketName;

    /**
     * 存储路径
     */
    private String storagePath;

    /**
     * 分片大小（字节）
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
    private String uploadedIndexes;

    /**
     * 状态：0-上传中 1-已完成 2-已取消 3-已过期
     */
    private Integer status;

    /**
     * 上传用户ID
     */
    private Long uploadUserId;

    /**
     * 过期时间
     */
    private LocalDateTime expireTime;

    /**
     * 完成时间
     */
    private LocalDateTime completeTime;

    /**
     * 合并后的文件ID
     */
    private Long fileId;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 状态常量
     */
    public static class Status {
        public static final int UPLOADING = 0;
        public static final int COMPLETED = 1;
        public static final int CANCELLED = 2;
        public static final int EXPIRED = 3;
    }
}