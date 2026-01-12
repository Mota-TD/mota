package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 事件提醒实体
 * 管理事件的提醒设置
 */
@Data
@TableName("event_reminder")
public class EventReminder {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 事件ID
     */
    private Long eventId;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 提醒类型: notification(站内通知), email(邮件), sms(短信), push(推送)
     */
    private String reminderType;
    
    /**
     * 提前提醒时间（分钟）
     */
    private Integer minutesBefore;
    
    /**
     * 提醒时间
     */
    private LocalDateTime reminderTime;
    
    /**
     * 是否已发送
     */
    private Boolean isSent;
    
    /**
     * 发送时间
     */
    private LocalDateTime sentTime;
    
    /**
     * 发送状态: pending(待发送), sent(已发送), failed(发送失败)
     */
    private String sendStatus;
    
    /**
     * 失败原因
     */
    private String failReason;
    
    /**
     * 重试次数
     */
    private Integer retryCount;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    // 提醒类型常量
    public static final String TYPE_NOTIFICATION = "notification";
    public static final String TYPE_EMAIL = "email";
    public static final String TYPE_SMS = "sms";
    public static final String TYPE_PUSH = "push";
    
    // 发送状态常量
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_SENT = "sent";
    public static final String STATUS_FAILED = "failed";
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 获取提醒分钟数（别名方法，映射到minutesBefore）
     */
    public Integer getReminderMinutes() {
        return this.minutesBefore;
    }
    
    /**
     * 设置提醒分钟数（别名方法，映射到minutesBefore）
     */
    public void setReminderMinutes(Integer reminderMinutes) {
        this.minutesBefore = reminderMinutes;
    }
    
    /**
     * 获取状态（别名方法，映射到sendStatus）
     */
    public String getStatus() {
        return this.sendStatus;
    }
    
    /**
     * 设置状态（别名方法，映射到sendStatus）
     */
    public void setStatus(String status) {
        this.sendStatus = status;
    }
    
    /**
     * 获取提醒时间（别名方法，映射到reminderTime）
     */
    public LocalDateTime getRemindTime() {
        return this.reminderTime;
    }
    
    /**
     * 设置提醒时间（别名方法，映射到reminderTime）
     */
    public void setRemindTime(LocalDateTime remindTime) {
        this.reminderTime = remindTime;
    }
    
    /**
     * 获取创建时间（别名方法，映射到createdAt）
     */
    public LocalDateTime getCreateTime() {
        return this.createdAt;
    }
    
    /**
     * 设置创建时间（别名方法，映射到createdAt）
     */
    public void setCreateTime(LocalDateTime createTime) {
        this.createdAt = createTime;
    }
    
    /**
     * 获取更新时间（别名方法，映射到updatedAt）
     */
    public LocalDateTime getUpdateTime() {
        return this.updatedAt;
    }
    
    /**
     * 设置更新时间（别名方法，映射到updatedAt）
     */
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updatedAt = updateTime;
    }
}