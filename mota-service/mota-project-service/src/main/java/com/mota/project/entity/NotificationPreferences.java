package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知偏好设置实体
 * 用于管理用户的通知显示和行为偏好
 */
@Data
@TableName("notification_preferences")
public class NotificationPreferences {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    // ========== 聚合设置 ==========

    /**
     * 是否启用通知聚合
     */
    private Boolean enableAggregation;

    /**
     * 聚合间隔（分钟）
     */
    private Integer aggregationInterval;

    // ========== 智能分类设置 ==========

    /**
     * 是否启用AI智能分类
     */
    private Boolean enableAiClassification;

    /**
     * 自动折叠阈值（AI评分低于此值自动折叠）
     */
    private Integer autoCollapseThreshold;

    // ========== 置顶设置 ==========

    /**
     * 自动置顶紧急通知
     */
    private Boolean autoPinUrgent;

    /**
     * 自动置顶@提及
     */
    private Boolean autoPinMentions;

    // ========== 显示设置 ==========

    /**
     * 低优先级默认折叠
     */
    private Boolean showLowPriorityCollapsed;

    /**
     * 最大显示数量
     */
    private Integer maxVisibleNotifications;

    // ========== 邮件设置 ==========

    /**
     * 是否启用邮件摘要
     */
    private Boolean emailDigestEnabled;

    /**
     * 邮件摘要频率: realtime, hourly, daily, weekly
     */
    private String emailDigestFrequency;

    /**
     * 每日摘要发送时间 HH:mm
     */
    private String emailDigestTime;

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

    /**
     * 创建默认偏好设置
     */
    public static NotificationPreferences createDefault(Long userId) {
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.setUserId(userId);
        prefs.setEnableAggregation(true);
        prefs.setAggregationInterval(30);
        prefs.setEnableAiClassification(true);
        prefs.setAutoCollapseThreshold(30);
        prefs.setAutoPinUrgent(true);
        prefs.setAutoPinMentions(false);
        prefs.setShowLowPriorityCollapsed(true);
        prefs.setMaxVisibleNotifications(50);
        prefs.setEmailDigestEnabled(false);
        prefs.setEmailDigestFrequency("daily");
        prefs.setEmailDigestTime("09:00");
        prefs.setCreatedAt(LocalDateTime.now());
        prefs.setUpdatedAt(LocalDateTime.now());
        return prefs;
    }
}