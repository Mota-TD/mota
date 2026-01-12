package com.mota.collab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("document")
public class Document {

    /**
     * 文档ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 项目ID（可选）
     */
    private Long projectId;

    /**
     * 父文件夹ID
     */
    private Long parentId;

    /**
     * 文档标题
     */
    private String title;

    /**
     * 文档内容（JSON格式，支持富文本）
     */
    private String content;

    /**
     * 纯文本内容（用于搜索）
     */
    private String plainText;

    /**
     * 文档类型：markdown, richtext, code, whiteboard
     */
    private String docType;

    /**
     * 代码语言（当docType为code时）
     */
    private String codeLanguage;

    /**
     * 文档状态：draft, published, archived
     */
    private String status;

    /**
     * 是否为文件夹
     */
    private Boolean isFolder;

    /**
     * 图标
     */
    private String icon;

    /**
     * 封面图片URL
     */
    private String coverImage;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 当前版本号
     */
    private Integer version;

    /**
     * 字数统计
     */
    private Integer wordCount;

    /**
     * 阅读时间（分钟）
     */
    private Integer readingTime;

    /**
     * 访问次数
     */
    private Integer viewCount;

    /**
     * 是否收藏
     */
    private Boolean isFavorite;

    /**
     * 是否置顶
     */
    private Boolean isPinned;

    /**
     * 是否锁定（锁定后不可编辑）
     */
    private Boolean isLocked;

    /**
     * 锁定者ID
     */
    private Long lockedBy;

    /**
     * 锁定时间
     */
    private LocalDateTime lockedAt;

    /**
     * 权限级别：private, team, public
     */
    private String permissionLevel;

    /**
     * 创建者ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * 最后编辑者ID
     */
    private Long lastEditedBy;

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
     * 最后编辑时间
     */
    private LocalDateTime lastEditedAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}