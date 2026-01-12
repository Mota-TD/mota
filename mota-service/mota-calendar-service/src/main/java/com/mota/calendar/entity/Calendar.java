package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历实体
 * 用户可以拥有多个日历（个人日历、工作日历、项目日历等）
 */
@Data
@TableName("calendar")
public class Calendar {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 租户ID
     */
    private Long tenantId;
    
    /**
     * 所有者ID（用户ID）
     */
    private Long ownerId;
    
    /**
     * 日历名称
     */
    private String name;
    
    /**
     * 日历描述
     */
    private String description;
    
    /**
     * 日历类型: personal(个人), work(工作), project(项目), team(团队), shared(共享), holiday(节假日)
     */
    private String calendarType;
    
    /**
     * 日历颜色
     */
    private String color;
    
    /**
     * 日历图标
     */
    private String icon;
    
    /**
     * 时区
     */
    private String timezone;
    
    /**
     * 是否默认日历
     */
    private Boolean isDefault;
    
    /**
     * 是否可见
     */
    private Boolean isVisible;
    
    /**
     * 是否只读
     */
    private Boolean isReadOnly;
    
    /**
     * 是否公开
     */
    private Boolean isPublic;
    
    /**
     * 关联项目ID（项目日历）
     */
    private Long projectId;
    
    /**
     * 关联团队ID（团队日历）
     */
    private Long teamId;
    
    /**
     * 外部日历ID（用于同步）
     */
    private String externalId;
    
    /**
     * 外部日历来源: google, outlook, apple, exchange, ical
     */
    private String externalSource;
    
    /**
     * 外部日历URL（用于订阅）
     */
    private String externalUrl;
    
    /**
     * 同步令牌
     */
    private String syncToken;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncTime;
    
    /**
     * 同步间隔（分钟）
     */
    private Integer syncInterval;
    
    /**
     * 是否启用同步
     */
    private Boolean syncEnabled;
    
    /**
     * 排序顺序
     */
    private Integer sortOrder;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    @TableLogic
    private Integer deleted;
    
    // 日历类型常量
    public static final String TYPE_PERSONAL = "personal";
    public static final String TYPE_WORK = "work";
    public static final String TYPE_PROJECT = "project";
    public static final String TYPE_TEAM = "team";
    public static final String TYPE_SHARED = "shared";
    public static final String TYPE_HOLIDAY = "holiday";
    
    // 外部来源常量
    public static final String SOURCE_GOOGLE = "google";
    public static final String SOURCE_OUTLOOK = "outlook";
    public static final String SOURCE_APPLE = "apple";
    public static final String SOURCE_EXCHANGE = "exchange";
    public static final String SOURCE_ICAL = "ical";
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 获取用户ID（别名方法，映射到ownerId）
     */
    public Long getUserId() {
        return this.ownerId;
    }
    
    /**
     * 设置用户ID（别名方法，映射到ownerId）
     */
    public void setUserId(Long userId) {
        this.ownerId = userId;
    }
    
    /**
     * 获取类型（别名方法，映射到calendarType）
     */
    public String getType() {
        return this.calendarType;
    }
    
    /**
     * 设置类型（别名方法，映射到calendarType）
     */
    public void setType(String type) {
        this.calendarType = type;
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