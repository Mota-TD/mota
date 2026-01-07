package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历订阅实体
 * 对应数据库表: mota_calendar.calendar_subscription
 */
@Data
@TableName("calendar_subscription")
public class CalendarSubscription {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 企业ID
     */
    private Long enterpriseId;
    
    /**
     * 订阅名称
     */
    private String name;
    
    /**
     * 订阅类型: personal, team, project, external
     */
    private String subscriptionType;
    
    /**
     * 订阅源URL (iCal格式)
     */
    private String sourceUrl;
    
    /**
     * 订阅源ID
     */
    private Long sourceId;
    
    /**
     * 日历颜色
     */
    private String color;
    
    /**
     * 是否可见
     */
    private Boolean isVisible;
    
    /**
     * 同步频率（分钟）
     */
    private Integer syncFrequency;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncAt;
    
    /**
     * 同步状态: success, error, pending
     */
    private String syncStatus;
    
    /**
     * 同步错误信息
     */
    private String syncError;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;
    
    // 订阅类型常量
    public static final String TYPE_PERSONAL = "personal";
    public static final String TYPE_TEAM = "team";
    public static final String TYPE_PROJECT = "project";
    public static final String TYPE_EXTERNAL = "external";
    
    // 同步状态常量
    public static final String SYNC_SUCCESS = "success";
    public static final String SYNC_ERROR = "error";
    public static final String SYNC_PENDING = "pending";
    
    // 默认同步频率（分钟）
    public static final int DEFAULT_SYNC_FREQUENCY = 60;
}