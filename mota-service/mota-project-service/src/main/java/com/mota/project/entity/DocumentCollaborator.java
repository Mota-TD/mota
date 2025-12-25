package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档协作者实体
 */
@Data
@TableName("document_collaborator")
public class DocumentCollaborator {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 权限: view, comment, edit, admin
     */
    private String permission;

    /**
     * 是否在线编辑
     */
    private Boolean isOnline;

    /**
     * 最后活跃时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastActiveAt;

    /**
     * 光标位置
     */
    private Integer cursorPosition;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // ========== 非数据库字段 ==========

    /**
     * 用户名称
     */
    @TableField(exist = false)
    private String userName;

    /**
     * 用户头像
     */
    @TableField(exist = false)
    private String userAvatar;

    /**
     * 用户邮箱
     */
    @TableField(exist = false)
    private String userEmail;
}