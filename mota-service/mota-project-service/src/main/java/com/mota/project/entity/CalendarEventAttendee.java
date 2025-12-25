package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历事件参与者实体
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
     * 响应状态: pending(待确认), accepted(已接受), declined(已拒绝), tentative(暂定)
     */
    private String responseStatus;
    
    /**
     * 是否必须参加
     */
    private Boolean required;
    
    /**
     * 响应时间
     */
    private LocalDateTime respondedAt;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 用户名称(非数据库字段)
     */
    @TableField(exist = false)
    private String userName;
    
    /**
     * 用户头像(非数据库字段)
     */
    @TableField(exist = false)
    private String userAvatar;
    
    /**
     * 用户邮箱(非数据库字段)
     */
    @TableField(exist = false)
    private String userEmail;
    
    // 响应状态常量
    public static final String RESPONSE_PENDING = "pending";
    public static final String RESPONSE_ACCEPTED = "accepted";
    public static final String RESPONSE_DECLINED = "declined";
    public static final String RESPONSE_TENTATIVE = "tentative";
}