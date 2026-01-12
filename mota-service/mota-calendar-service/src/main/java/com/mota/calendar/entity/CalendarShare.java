package com.mota.calendar.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 日历共享实体
 * 管理日历的共享权限
 */
@Data
@TableName("calendar_share")
public class CalendarShare {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 日历ID
     */
    private Long calendarId;
    
    /**
     * 共享类型: user(用户), team(团队), department(部门), all(所有人)
     */
    private String shareType;
    
    /**
     * 共享目标ID（用户ID/团队ID/部门ID）
     */
    private Long shareTargetId;
    
    /**
     * 权限级别: view(查看), edit(编辑), manage(管理)
     */
    private String permission;
    
    /**
     * 是否可以查看事件详情
     */
    private Boolean canViewDetails;
    
    /**
     * 是否可以创建事件
     */
    private Boolean canCreateEvents;
    
    /**
     * 是否可以编辑事件
     */
    private Boolean canEditEvents;
    
    /**
     * 是否可以删除事件
     */
    private Boolean canDeleteEvents;
    
    /**
     * 是否可以邀请他人
     */
    private Boolean canInviteOthers;
    
    /**
     * 共享者ID
     */
    private Long sharedBy;
    
    /**
     * 共享时间
     */
    private LocalDateTime sharedAt;
    
    /**
     * 过期时间
     */
    private LocalDateTime expireTime;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    // 共享类型常量
    public static final String SHARE_TYPE_USER = "user";
    public static final String SHARE_TYPE_TEAM = "team";
    public static final String SHARE_TYPE_DEPARTMENT = "department";
    public static final String SHARE_TYPE_ALL = "all";
    
    // 权限级别常量
    public static final String PERMISSION_VIEW = "view";
    public static final String PERMISSION_EDIT = "edit";
    public static final String PERMISSION_MANAGE = "manage";
    
    // 状态常量
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_REVOKED = "revoked";
    
    /**
     * 状态（非数据库字段，用于兼容）
     */
    @TableField(exist = false)
    private String status;
    
    // ========== 别名方法（兼容服务层调用）==========
    
    /**
     * 获取状态
     */
    public String getStatus() {
        return this.status;
    }
    
    /**
     * 设置状态
     */
    public void setStatus(String status) {
        this.status = status;
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