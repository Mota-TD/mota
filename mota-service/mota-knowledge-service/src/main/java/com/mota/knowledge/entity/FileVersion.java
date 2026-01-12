package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件版本实体
 */
@Data
@TableName("file_version")
public class FileVersion {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 文件ID
     */
    private Long fileId;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 版本号
     */
    private Integer versionNumber;

    /**
     * 存储路径
     */
    private String storagePath;

    /**
     * 存储桶名称
     */
    private String bucketName;

    /**
     * 文件大小
     */
    private Long fileSize;

    /**
     * 文件MD5
     */
    private String md5Hash;

    /**
     * 变更说明
     */
    private String changeNote;

    /**
     * 变更描述（兼容字段）
     */
    private String changeDescription;

    /**
     * 变更类型：create/update/restore
     */
    private String changeType;

    /**
     * 是否为当前版本
     */
    private Boolean isCurrent;

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
     * 是否删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 创建人名称（非数据库字段）
     */
    @TableField(exist = false)
    private String creatorName;
}