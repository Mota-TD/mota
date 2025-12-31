package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历配置实体
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
     * 日历类型: personal(个人), team(团队), project(项目), task(任务)
     */
    private String calendarType;
    
    /**
     * 日历名称
     */
    private String name;
    
    /**
     * 日历颜色
     */
    private String color;
    
    /**
     * 是否可见
     */
    private Boolean visible;
    
    /**
     * 是否默认日历
     */
    private Boolean isDefault;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    // 日历类型常量
    public static final String TYPE_PERSONAL = "personal";
    public static final String TYPE_TEAM = "team";
    public static final String TYPE_PROJECT = "project";
    public static final String TYPE_TASK = "task";
}