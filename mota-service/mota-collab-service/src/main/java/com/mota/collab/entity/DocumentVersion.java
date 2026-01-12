package com.mota.collab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档版本实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("document_version")
public class DocumentVersion {

    /**
     * 版本ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 版本号
     */
    private Integer versionNumber;

    /**
     * 版本标题
     */
    private String title;

    /**
     * 版本内容（完整内容快照）
     */
    private String content;

    /**
     * 纯文本内容
     */
    private String plainText;

    /**
     * 变更摘要
     */
    private String changeSummary;

    /**
     * 变更类型：auto, manual, restore
     */
    private String changeType;

    /**
     * 字数统计
     */
    private Integer wordCount;

    /**
     * 内容大小（字节）
     */
    private Long contentSize;

    /**
     * 差异内容（与上一版本的diff）
     */
    private String diffContent;

    /**
     * 是否为主要版本（手动保存的版本）
     */
    private Boolean isMajor;

    /**
     * 创建者ID
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}