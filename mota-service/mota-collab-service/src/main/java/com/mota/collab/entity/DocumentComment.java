package com.mota.collab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档评论实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("document_comment")
public class DocumentComment {

    /**
     * 评论ID
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
     * 父评论ID（用于回复）
     */
    private Long parentId;

    /**
     * 评论类型：inline（行内评论）, block（区域批注）, general（普通评论）
     */
    private String commentType;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 选中的文本（行内评论时）
     */
    private String selectedText;

    /**
     * 锚点位置（JSON格式，包含起始和结束位置）
     */
    private String anchorPosition;

    /**
     * 评论状态：open, resolved, closed
     */
    private String status;

    /**
     * 是否已解决
     */
    private Boolean isResolved;

    /**
     * 解决者ID
     */
    private Long resolvedBy;

    /**
     * 解决时间
     */
    private LocalDateTime resolvedAt;

    /**
     * @提及的用户ID列表（JSON数组）
     */
    private String mentionedUsers;

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

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}