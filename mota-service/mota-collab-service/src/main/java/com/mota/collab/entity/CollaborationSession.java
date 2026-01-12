package com.mota.collab.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 协作会话实体
 * 用于跟踪实时协作状态
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("collaboration_session")
public class CollaborationSession {

    /**
     * 会话ID
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
     * 会话标识（WebSocket连接ID）
     */
    private String sessionId;

    /**
     * 用户名称（冗余，用于显示）
     */
    private String userName;

    /**
     * 用户头像（冗余，用于显示）
     */
    private String userAvatar;

    /**
     * 光标位置（JSON格式）
     */
    private String cursorPosition;

    /**
     * 选区范围（JSON格式）
     */
    private String selectionRange;

    /**
     * 用户颜色（用于区分不同用户的光标）
     */
    private String userColor;

    /**
     * 会话状态：active, idle, disconnected
     */
    private String status;

    /**
     * 最后活动时间
     */
    private LocalDateTime lastActiveAt;

    /**
     * 加入时间
     */
    private LocalDateTime joinedAt;

    /**
     * 离开时间
     */
    private LocalDateTime leftAt;

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