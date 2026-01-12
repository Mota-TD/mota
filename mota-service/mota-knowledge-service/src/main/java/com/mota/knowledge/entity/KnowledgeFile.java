package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 知识文件实体
 */
@Data
@TableName("knowledge_file")
public class KnowledgeFile {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 企业ID
     */
    private Long enterpriseId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 父级ID（文件夹）
     */
    private Long parentId;

    /**
     * 文件名
     */
    private String name;

    /**
     * 原始文件名
     */
    private String originalName;

    /**
     * 类型：folder/file
     */
    private String type;

    /**
     * 文件类型（扩展名类型）
     */
    private String fileType;

    /**
     * 文件类型（MIME类型）
     */
    private String mimeType;

    /**
     * 文件扩展名
     */
    private String extension;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 存储路径（MinIO对象键）
     */
    private String storagePath;

    /**
     * 文件路径（兼容旧字段）
     */
    private String filePath;

    /**
     * 存储桶名称
     */
    private String bucketName;

    /**
     * 文件内容（文本类，用于搜索）
     */
    private String content;

    /**
     * 纯文本内容（用于全文搜索）
     */
    private String plainText;

    /**
     * 文件摘要（AI生成）
     */
    private String summary;

    /**
     * 缩略图路径
     */
    private String thumbnailPath;

    /**
     * 版本号
     */
    private Integer version;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 状态：draft/published/archived
     */
    private String status;

    /**
     * 权限级别：private/team/public
     */
    private String permissionLevel;

    /**
     * 是否已索引（ES）
     */
    private Boolean isIndexed;

    /**
     * 是否已向量化（Milvus）
     */
    private Boolean isVectorized;

    /**
     * 向量ID（Milvus）
     */
    private String vectorId;

    /**
     * 浏览次数
     */
    private Integer viewCount;

    /**
     * 下载次数
     */
    private Integer downloadCount;

    /**
     * 收藏次数
     */
    private Integer favoriteCount;

    /**
     * 文件MD5哈希（用于秒传）
     */
    private String md5Hash;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

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
     * 更新人
     */
    private Long updatedBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 标签列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<String> tags;

    /**
     * 创建人名称（非数据库字段）
     */
    @TableField(exist = false)
    private String creatorName;

    /**
     * 分类名称（非数据库字段）
     */
    @TableField(exist = false)
    private String categoryName;

    /**
     * 子文件数量（非数据库字段）
     */
    @TableField(exist = false)
    private Integer childCount;
}