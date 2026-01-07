package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历配置实体
 * 对应数据库表: mota_calendar.calendar_config
 */
@Data
@TableName("calendar_config")
public class CalendarConfig {
    
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
     * 默认视图: day, week, month, year
     */
    private String defaultView;
    
    /**
     * 周起始日: 0=周日, 1=周一
     */
    private Integer weekStart;
    
    /**
     * 工作时间开始
     */
    private String workHoursStart;
    
    /**
     * 工作时间结束
     */
    private String workHoursEnd;
    
    /**
     * 工作日 (JSON数组，如 [1,2,3,4,5])
     */
    private String workDays;
    
    /**
     * 时区
     */
    private String timezone;
    
    /**
     * 默认提醒时间（分钟）
     */
    private Integer defaultReminder;
    
    /**
     * 是否显示周末
     */
    private Boolean showWeekends;
    
    /**
     * 是否显示已拒绝的事件
     */
    private Boolean showDeclined;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    // 默认视图常量
    public static final String VIEW_DAY = "day";
    public static final String VIEW_WEEK = "week";
    public static final String VIEW_MONTH = "month";
    public static final String VIEW_YEAR = "year";
    
    // 周起始日常量
    public static final int WEEK_START_SUNDAY = 0;
    public static final int WEEK_START_MONDAY = 1;
}