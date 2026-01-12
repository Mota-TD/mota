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
     * 租户ID（多租户支持）
     */
    private Long tenantId;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 日历ID（所属日历）
     */
    private Long calendarId;
    
    /**
     * 事件标题
     */
    private String title;
    
    /**
     * 事件描述
     */
    private String description;
    
    /**
     * 事件类型: meeting(会议), task(任务), milestone(里程碑), reminder(提醒), deadline(截止日期), birthday(生日), holiday(节假日), other(其他)
     */
    private String eventType;
    
    /**
     * 事件分类: work(工作), personal(个人), family(家庭), social(社交)
     */
    private String category;
    
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
     * 在线会议链接
     */
    private String meetingUrl;
    
    /**
     * 事件颜色
     */
    private String color;
    
    /**
     * 事件图标
     */
    private String icon;
    
    /**
     * 是否循环事件
     */
    private Boolean isRecurring;
    
    /**
     * 循环规则: none(不循环), daily(每天), weekly(每周), biweekly(每两周), monthly(每月), yearly(每年), custom(自定义)
     */
    private String recurrenceRule;
    
    /**
     * 循环模式 (JSON格式，存储详细的循环配置)
     * 例如: {"interval": 1, "daysOfWeek": [1,3,5], "endType": "count", "count": 10}
     */
    private String recurrencePattern;
    
    /**
     * 循环结束日期
     */
    private LocalDateTime recurrenceEndDate;
    
    /**
     * 循环次数限制
     */
    private Integer recurrenceCount;
    
    /**
     * 父事件ID (用于循环事件的实例)
     */
    private Long parentEventId;
    
    /**
     * 循环事件的原始日期（用于标识修改过的实例）
     */
    private LocalDateTime originalStartTime;
    
    /**
     * 是否为循环事件的例外
     */
    private Boolean isException;
    
    /**
     * 提醒设置 (JSON格式，支持多个提醒)
     * 例如: [{"minutes": 15, "type": "notification"}, {"minutes": 60, "type": "email"}]
     */
    private String reminders;
    
    /**
     * 提醒时间(分钟): 0(准时), 5, 10, 15, 30, 60, 1440(1天前)
     */
    private Integer reminderMinutes;
    
    /**
     * 是否已发送提醒
     */
    private Boolean reminderSent;
    
    /**
     * 可见性: private(仅自己), project(项目成员), team(团队), public(所有人)
     */
    private String visibility;
    
    /**
     * 状态: tentative(暂定), confirmed(已确认), cancelled(已取消)
     */
    private String status;
    
    /**
     * 忙闲状态: free(空闲), busy(忙碌), tentative(暂定), outOfOffice(外出)
     */
    private String busyStatus;
    
    /**
     * 优先级: low(低), normal(普通), high(高)
     */
    private String priority;
    
    /**
     * 创建者ID
     */
    private Long creatorId;
    
    /**
     * 组织者ID（会议组织者）
     */
    private Long organizerId;
    
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
    
    /**
     * 外部事件ID（用于同步外部日历）
     */
    private String externalId;
    
    /**
     * 外部日历来源: google, outlook, apple, exchange
     */
    private String externalSource;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncTime;
    
    /**
     * 附件列表 (JSON格式)
     */
    private String attachments;
    
    /**
     * 扩展数据 (JSON格式)
     */
    private String extraData;
    
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
    
    /**
     * 日历名称(非数据库字段)
     */
    @TableField(exist = false)
    private String calendarName;
    
    // 事件类型常量
    public static final String TYPE_MEETING = "meeting";
    public static final String TYPE_TASK = "task";
    public static final String TYPE_MILESTONE = "milestone";
    public static final String TYPE_REMINDER = "reminder";
    public static final String TYPE_DEADLINE = "deadline";
    public static final String TYPE_BIRTHDAY = "birthday";
    public static final String TYPE_HOLIDAY = "holiday";
    public static final String TYPE_OTHER = "other";
    
    // 事件分类常量
    public static final String CATEGORY_WORK = "work";
    public static final String CATEGORY_PERSONAL = "personal";
    public static final String CATEGORY_FAMILY = "family";
    public static final String CATEGORY_SOCIAL = "social";
    
    // 循环规则常量
    public static final String RECURRENCE_NONE = "none";
    public static final String RECURRENCE_DAILY = "daily";
    public static final String RECURRENCE_WEEKLY = "weekly";
    public static final String RECURRENCE_BIWEEKLY = "biweekly";
    public static final String RECURRENCE_MONTHLY = "monthly";
    public static final String RECURRENCE_YEARLY = "yearly";
    public static final String RECURRENCE_CUSTOM = "custom";
    
    // 可见性常量
    public static final String VISIBILITY_PRIVATE = "private";
    public static final String VISIBILITY_PROJECT = "project";
    public static final String VISIBILITY_TEAM = "team";
    public static final String VISIBILITY_PUBLIC = "public";
    
    // 状态常量
    public static final String STATUS_TENTATIVE = "tentative";
    public static final String STATUS_CONFIRMED = "confirmed";
    public static final String STATUS_CANCELLED = "cancelled";
    public static final String STATUS_ACTIVE = "confirmed"; // 别名，映射到confirmed
    
    // 忙闲状态常量
    public static final String BUSY_FREE = "free";
    public static final String BUSY_BUSY = "busy";
    public static final String BUSY_TENTATIVE = "tentative";
    public static final String BUSY_OUT_OF_OFFICE = "outOfOffice";
    
    // 优先级常量
    public static final String PRIORITY_LOW = "low";
    public static final String PRIORITY_NORMAL = "normal";
    public static final String PRIORITY_HIGH = "high";
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 会议ID（非数据库字段，用于关联会议）
     */
    @TableField(exist = false)
    private Long meetingId;
    
    /**
     * 企业ID（非数据库字段，用于兼容）
     */
    @TableField(exist = false)
    private Long enterpriseId;
    
    /**
     * 获取会议ID
     */
    public Long getMeetingId() {
        return this.meetingId;
    }
    
    /**
     * 设置会议ID
     */
    public void setMeetingId(Long meetingId) {
        this.meetingId = meetingId;
    }
    
    /**
     * 获取企业ID（别名方法，映射到tenantId）
     */
    public Long getEnterpriseId() {
        return this.enterpriseId != null ? this.enterpriseId : this.tenantId;
    }
    
    /**
     * 设置企业ID（别名方法，映射到tenantId）
     */
    public void setEnterpriseId(Long enterpriseId) {
        this.enterpriseId = enterpriseId;
        if (this.tenantId == null) {
            this.tenantId = enterpriseId;
        }
    }
}