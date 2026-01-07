package com.mota.project.entity.knowledge;

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
     * 文件名
     */
    private String name;

    /**
     * 原始文件名
     */
    private String originalName;

    /**
     * 文件大小（字节）
     */
    private Long size;

    /**
     * MIME类型
     */
    private String mimeType;

    /**
     * 文件扩展名
     */
    private String extension;

    /**
     * 文件存储路径
     */
    private String path;

    /**
     * 缩略图路径
     */
    private String thumbnailPath;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 所属文件夹ID
     */
    private Long folderId;

    /**
     * 上传者ID
     */
    private Long uploaderId;

    /**
     * 上传者名称
     */
    @TableField(exist = false)
    private String uploaderName;

    /**
     * 文件状态：uploading, processing, completed, failed
     */
    private String status;

    /**
     * 上传进度（0-100）
     */
    private Integer uploadProgress;

    /**
     * 分类
     */
    private String category;

    /**
     * AI建议的分类
     */
    private String aiSuggestedCategory;

    /**
     * AI分类置信度
     */
    private Double aiConfidence;

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

    /**
     * 标签列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<String> tags;

    /**
     * AI建议的标签（非数据库字段）
     */
    @TableField(exist = false)
    private List<String> aiSuggestedTags;
}