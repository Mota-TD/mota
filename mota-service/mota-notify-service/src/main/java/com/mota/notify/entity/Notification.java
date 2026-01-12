package com.mota.notify.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知实体
 */
@Data
@TableName("notification")
public class Notification {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 接收用户ID
     */
    private Long userId;

    /**
     * 发送人ID
     */
    private Long senderId;

    /**
     * 发送人名称
     */
    private String senderName;

    /**
     * 通知类型: system/task/project/document/comment/mention/reminder
     */
    private String type;

    /**
     * 通知分类: important/normal/low
     */
    private String category;

    /**
     * 通知标题
     */
    private String title;

    /**
     * 通知内容
     */
    private String content;

    /**
     * 通知摘要（用于列表展示）
     */
    private String summary;

    /**
     * 跳转链接
     */
    private String link;

    /**
     * 关联业务类型: task/project/document/comment
     */
    private String bizType;

    /**
     * 关联业务ID
     */
    private Long bizId;

    /**
     * 通知渠道: app/email/sms/wechat/dingtalk/feishu
     */
    private String channel;

    /**
     * 发送状态: pending/sent/failed
     */
    private String sendStatus;

    /**
     * 发送时间
     */
    private LocalDateTime sentAt;

    /**
     * 发送失败原因
     */
    private String failReason;

    /**
     * 重试次数
     */
    private Integer retryCount;

    /**
     * 是否已读：0-未读，1-已读
     */
    private Integer isRead;

    /**
     * 阅读时间
     */
    private LocalDateTime readAt;

    /**
     * 是否置顶
     */
    private Boolean isPinned;

    /**
     * 是否归档
     */
    private Boolean isArchived;

    /**
     * 归档时间
     */
    private LocalDateTime archivedAt;

    /**
     * 聚合组ID（用于通知聚合）
     */
    private String aggregationGroupId;

    /**
     * 是否为聚合通知
     */
    private Boolean isAggregated;

    /**
     * 聚合数量
     */
    private Integer aggregationCount;

    /**
     * 扩展数据（JSON格式）
     */
    private String extraData;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;
}