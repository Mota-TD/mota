package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知订阅规则实体
 * 用于管理用户对不同类型通知的订阅设置
 */
@Data
@TableName("notification_subscription")
public class NotificationSubscription {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 通知分类: task, project, comment, system, reminder, plan, feedback
     */
    private String category;

    /**
     * 通知类型（可选，为空表示该分类下所有类型）
     */
    private String type;

    /**
     * 项目ID（可选，为空表示所有项目）
     */
    private Long projectId;

    /**
     * 是否启用站内通知
     */
    private Boolean enabled;

    /**
     * 是否启用邮件通知
     */
    private Boolean emailEnabled;

    /**
     * 是否启用推送通知
     */
    private Boolean pushEnabled;

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
}