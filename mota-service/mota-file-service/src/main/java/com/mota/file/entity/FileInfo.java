package com.mota.file.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件信息实体
 * 
 * @author mota
 */
@Data
@TableName("file_info")
public class FileInfo {

    /**
     * 文件ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 文件名（原始文件名）
     */
    private String fileName;

    /**
     * 存储文件名（UUID生成）
     */
    private String storageName;

    /**
     * 文件路径（相对路径）
     */
    private String filePath;

    /**
     * 完整URL
     */
    private String fileUrl;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型（MIME类型）
     */
    private String mimeType;

    /**
     * 文件扩展名
     */
    private String extension;

    /**
     * 文件MD5哈希值（用于秒传）
     */
    private String md5Hash;

    /**
     * 文件SHA256哈希值
     */
    private String sha256Hash;

    /**
     * 存储桶名称
     */
    private String bucketName;

    /**
     * 存储类型：local/minio/oss/cos/s3
     */
    private String storageType;

    /**
     * 文件分类：image/video/audio/document/archive/other
     */
    private String category;

    /**
     * 业务类型：avatar/attachment/document/cover等
     */
    private String businessType;

    /**
     * 关联业务ID
     */
    private Long businessId;

    /**
     * 是否公开访问
     */
    private Boolean isPublic;

    /**
     * 访问次数
     */
    private Long accessCount;

    /**
     * 下载次数
     */
    private Long downloadCount;

    /**
     * 缩略图路径
     */
    private String thumbnailPath;

    /**
     * 预览路径
     */
    private String previewPath;

    /**
     * 图片宽度（仅图片/视频）
     */
    private Integer width;

    /**
     * 图片高度（仅图片/视频）
     */
    private Integer height;

    /**
     * 视频/音频时长（秒）
     */
    private Integer duration;

    /**
     * 文件元数据（JSON格式）
     */
    private String metadata;

    /**
     * 上传用户ID
     */
    private Long uploadUserId;

    /**
     * 上传用户名
     */
    private String uploadUserName;

    /**
     * 状态：0-上传中 1-正常 2-已删除
     */
    private Integer status;

    /**
     * 删除时间
     */
    private LocalDateTime deletedAt;

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
     * 文件分类常量
     */
    public static class Category {
        public static final String IMAGE = "image";
        public static final String VIDEO = "video";
        public static final String AUDIO = "audio";
        public static final String DOCUMENT = "document";
        public static final String ARCHIVE = "archive";
        public static final String OTHER = "other";
    }

    /**
     * 存储类型常量
     */
    public static class StorageType {
        public static final String LOCAL = "local";
        public static final String MINIO = "minio";
        public static final String OSS = "oss";
        public static final String COS = "cos";
        public static final String S3 = "s3";
    }

    /**
     * 状态常量
     */
    public static class Status {
        public static final int UPLOADING = 0;
        public static final int NORMAL = 1;
        public static final int DELETED = 2;
    }
}