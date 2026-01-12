package com.mota.notify.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 通知模板实体
 */
@Data
@TableName("notification_template")
public class NotificationTemplate {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID（0表示系统模板）
     */
    private Long tenantId;

    /**
     * 模板编码（唯一标识）
     */
    private String templateCode;

    /**
     * 模板名称
     */
    private String templateName;

    /**
     * 通知类型: system/task/project/document/comment/mention/reminder
     */
    private String notifyType;

    /**
     * 通知渠道: app/email/sms/wechat/dingtalk/feishu
     */
    private String channel;

    /**
     * 标题模板
     */
    private String titleTemplate;

    /**
     * 内容模板
     */
    private String contentTemplate;

    /**
     * 摘要模板
     */
    private String summaryTemplate;

    /**
     * 邮件HTML模板（仅邮件渠道）
     */
    private String htmlTemplate;

    /**
     * 模板变量说明（JSON格式）
     */
    private String variablesDesc;

    /**
     * 是否系统模板
     */
    private Boolean isSystem;

    /**
     * 是否启用
     */
    private Boolean isEnabled;

    /**
     * 默认分类: important/normal/low
     */
    private String defaultCategory;

    // ==================== 别名方法（兼容服务层调用） ====================

    /**
     * 获取模板编码（别名）
     */
    public String getCode() {
        return this.templateCode;
    }

    /**
     * 设置模板编码（别名）
     */
    public void setCode(String code) {
        this.templateCode = code;
    }

    /**
     * 获取模板名称（别名）
     */
    public String getName() {
        return this.templateName;
    }

    /**
     * 设置模板名称（别名）
     */
    public void setName(String name) {
        this.templateName = name;
    }

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
     * 获取分类（别名）
     */
    public String getCategory() {
        return this.defaultCategory;
    }

    /**
     * 设置分类（别名）
     */
    public void setCategory(String category) {
        this.defaultCategory = category;
    }

    /**
     * 获取变量说明（别名）
     */
    public String getVariables() {
        return this.variablesDesc;
    }

    /**
     * 设置变量说明（别名）
     */
    public void setVariables(String variables) {
        this.variablesDesc = variables;
    }

    /**
     * 描述
     */
    private String description;

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

    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;
}