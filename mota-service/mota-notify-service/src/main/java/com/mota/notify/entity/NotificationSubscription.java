package com.mota.notify.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知订阅实体
 */
@Data
@TableName("notification_subscription")
public class NotificationSubscription {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 订阅类型: all/project/task/document/mention/system
     */
    private String subscribeType;

    /**
     * 关联业务类型（可选）
     */
    private String bizType;

    /**
     * 关联业务ID（可选，如特定项目ID）
     */
    private Long bizId;

    /**
     * 通知渠道: app/email/sms/wechat/dingtalk/feishu
     */
    private String channel;

    /**
     * 是否启用
     */
    private Boolean isEnabled;

    /**
     * 订阅级别: all/important/none
     */
    private String level;

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

    // ==================== 别名方法（兼容服务层调用） ====================

    /**
     * 获取通知类型（别名）
     */
    public String getNotifyType() {
        return this.subscribeType;
    }

    /**
     * 设置通知类型（别名）
     */
    public void setNotifyType(String notifyType) {
        this.subscribeType = notifyType;
    }

    /**
     * 获取业务类型（别名）
     */
    public String getBusinessType() {
        return this.bizType;
    }

    /**
     * 设置业务类型（别名）
     */
    public void setBusinessType(String businessType) {
        this.bizType = businessType;
    }

    /**
     * 获取业务ID（别名）
     */
    public Long getBusinessId() {
        return this.bizId;
    }

    /**
     * 设置业务ID（别名）
     */
    public void setBusinessId(Long businessId) {
        this.bizId = businessId;
    }

    /**
     * 获取是否启用（别名）
     */
    public Boolean getEnabled() {
        return this.isEnabled;
    }

    /**
     * 设置是否启用（别名）
     */
    public void setEnabled(Boolean enabled) {
        this.isEnabled = enabled;
    }

    /**
     * 获取渠道列表（别名）
     */
    public String getChannels() {
        return this.channel;
    }

    /**
     * 设置渠道列表（别名）
     */
    public void setChannels(String channels) {
        this.channel = channels;
    }
}