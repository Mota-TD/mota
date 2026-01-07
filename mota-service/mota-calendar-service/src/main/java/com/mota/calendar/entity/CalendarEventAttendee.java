package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历事件参与者实体
 * 对应数据库表: mota_calendar.calendar_event_attendee
 */
@Data
@TableName("calendar_event_attendee")
public class CalendarEventAttendee {
    
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
     * 参与者邮箱
     */
    private String email;
    
    /**
     * 参与者名称
     */
    private String name;
    
    /**
     * 参与者角色: organizer, required, optional
     */
    private String role;
    
    /**
     * 响应状态: pending(待确认), accepted(已接受), declined(已拒绝), tentative(暂定)
     */
    private String status;
    
    /**
     * 是否可选参加
     */
    private Boolean isOptional;
    
    /**
     * 响应时间
     */
    private LocalDateTime responseTime;
    
    /**
     * 备注
     */
    private String comment;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 用户头像(非数据库字段)
     */
    @TableField(exist = false)
    private String userAvatar;
    
    // 角色常量
    public static final String ROLE_ORGANIZER = "organizer";
    public static final String ROLE_REQUIRED = "required";
    public static final String ROLE_OPTIONAL = "optional";
    
    // 响应状态常量
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_ACCEPTED = "accepted";
    public static final String STATUS_DECLINED = "declined";
    public static final String STATUS_TENTATIVE = "tentative";
}