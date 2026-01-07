package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历事件实体
 * 对应数据库表: mota_calendar.calendar_event
 */
@Data
@TableName("calendar_event")
public class CalendarEvent {
    
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
     * 事件标题
     */
    private String title;
    
    /**
     * 事件描述
     */
    private String description;
    
    /**
     * 事件类型: meeting(会议), task(任务), milestone(里程碑), reminder(提醒), deadline(截止日期), other(其他)
     */
    private String eventType;
    
    /**
     * 开始时间
     */
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 是否全天事件
     */
    private Boolean allDay;
    
    /**
     * 时区
     */
    private String timezone;
    
    /**
     * 事件地点
     */
    private String location;
    
    /**
     * 事件颜色
     */
    private String color;
    
    /**
     * 是否循环事件
     */
    private Boolean isRecurring;
    
    /**
     * 循环规则: none(不循环), daily(每天), weekly(每周), monthly(每月), yearly(每年)
     */
    private String recurrenceRule;
    
    /**
     * 循环模式 (JSON格式，存储详细的循环配置)
     */
    private String recurrencePattern;
    
    /**
     * 循环结束日期
     */
    private LocalDateTime recurrenceEndDate;
    
    /**
     * 父事件ID (用于循环事件的实例)
     */
    private Long parentEventId;
    
    /**
     * 提醒时间(分钟): 0(准时), 5, 10, 15, 30, 60, 1440(1天前)
     */
    private Integer reminderMinutes;
    
    /**
     * 可见性: private(仅自己), project(项目成员), public(所有人)
     */
    private String visibility;
    
    /**
     * 状态: active(活动), cancelled(已取消)
     */
    private String status;
    
    /**
     * 创建者ID
     */
    private Long creatorId;
    
    /**
     * 关联项目ID
     */
    private Long projectId;
    
    /**
     * 关联任务ID
     */
    private Long taskId;
    
    /**
     * 关联里程碑ID
     */
    private Long milestoneId;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;
    
    /**
     * 参与者列表(非数据库字段)
     */
    @TableField(exist = false)
    private List<CalendarEventAttendee> attendees;
    
    /**
     * 创建者名称(非数据库字段)
     */
    @TableField(exist = false)
    private String creatorName;
    
    /**
     * 项目名称(非数据库字段)
     */
    @TableField(exist = false)
    private String projectName;
    
    // 事件类型常量
    public static final String TYPE_MEETING = "meeting";
    public static final String TYPE_TASK = "task";
    public static final String TYPE_MILESTONE = "milestone";
    public static final String TYPE_REMINDER = "reminder";
    public static final String TYPE_DEADLINE = "deadline";
    public static final String TYPE_OTHER = "other";
    
    // 循环规则常量
    public static final String RECURRENCE_NONE = "none";
    public static final String RECURRENCE_DAILY = "daily";
    public static final String RECURRENCE_WEEKLY = "weekly";
    public static final String RECURRENCE_MONTHLY = "monthly";
    public static final String RECURRENCE_YEARLY = "yearly";
    
    // 可见性常量
    public static final String VISIBILITY_PRIVATE = "private";
    public static final String VISIBILITY_PROJECT = "project";
    public static final String VISIBILITY_PUBLIC = "public";
    
    // 状态常量
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_CANCELLED = "cancelled";
}