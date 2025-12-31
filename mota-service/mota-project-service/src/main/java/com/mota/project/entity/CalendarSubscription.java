package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历订阅实体
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
     * 订阅名称
     */
    private String name;
    
    /**
     * 订阅URL (iCal格式)
     */
    private String url;
    
    /**
     * 日历颜色
     */
    private String color;
    
    /**
     * 同步间隔（分钟）
     */
    private Integer syncInterval;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncAt;
    
    /**
     * 状态: active(活动), error(错误), paused(暂停)
     */
    private String status;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    // 状态常量
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_ERROR = "error";
    public static final String STATUS_PAUSED = "paused";
    
    // 默认同步间隔（分钟）
    public static final int DEFAULT_SYNC_INTERVAL = 60;
}