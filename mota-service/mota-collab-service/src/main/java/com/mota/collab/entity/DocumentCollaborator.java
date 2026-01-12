package com.mota.collab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 文档协作者实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("document_collaborator")
public class DocumentCollaborator {

    /**
     * ID
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
     * 用户ID
     */
    private Long userId;

    /**
     * 权限级别：owner, editor, commenter, viewer
     */
    private String permission;

    /**
     * 是否可以分享
     */
    private Boolean canShare;

    /**
     * 是否可以导出
     */
    private Boolean canExport;

    /**
     * 是否可以打印
     */
    private Boolean canPrint;

    /**
     * 邀请者ID
     */
    private Long invitedBy;

    /**
     * 邀请时间
     */
    private LocalDateTime invitedAt;

    /**
     * 最后访问时间
     */
    private LocalDateTime lastAccessAt;

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