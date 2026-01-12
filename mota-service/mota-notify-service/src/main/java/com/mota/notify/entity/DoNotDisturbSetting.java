package com.mota.notify.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 免打扰设置实体
 */
@Data
@TableName("do_not_disturb_setting")
public class DoNotDisturbSetting {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 是否启用免打扰
     */
    private Boolean isEnabled;

    /**
     * 免打扰模式: scheduled/always/smart
     * scheduled: 定时免打扰
     * always: 始终免打扰
     * smart: 智能免打扰（根据用户行为）
     */
    private String mode;

    /**
     * 开始时间（定时模式）
     */
    private LocalTime startTime;

    /**
     * 结束时间（定时模式）
     */
    private LocalTime endTime;

    /**
     * 适用星期（逗号分隔，1-7表示周一到周日）
     */
    private String weekdays;

    /**
     * 例外通知类型（逗号分隔，这些类型不受免打扰影响）
     */
    private String exceptTypes;

    /**
     * 例外发送人ID（逗号分隔，这些人的通知不受免打扰影响）
     */
    private String exceptSenders;

    /**
     * 是否允许紧急通知
     */
    private Boolean allowUrgent;

    /**
     * 临时免打扰结束时间（用于临时开启免打扰）
     */
    private LocalDateTime tempEndTime;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    // ==================== 别名方法（兼容服务层调用） ====================

    /**
     * 获取是否启用（别名）
     */
    public Boolean getEnabled() {
        return this.isEnabled;
    }

    /**
     * 设置是否启用（别名）
     */
    public void setEnabled(Boolean enabled) {
        this.isEnabled = enabled;
    }

    /**
     * 获取临时结束时间（别名）
     */
    public LocalDateTime getTemporaryEndTime() {
        return this.tempEndTime;
    }

    /**
     * 设置临时结束时间（别名）
     */
    public void setTemporaryEndTime(LocalDateTime temporaryEndTime) {
        this.tempEndTime = temporaryEndTime;
    }
}