package com.mota.report.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 定时报表任务实体
 * 配置报表的定时生成规则
 *
 * @author mota
 */
@Data
@TableName("report_schedule")
public class ReportSchedule {

    /**
     * 任务ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 报表模板ID
     */
    private Long templateId;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * Cron表达式
     */
    private String cronExpression;

    /**
     * 时区
     */
    private String timezone;

    /**
     * 查询参数（JSON）
     */
    private String queryParams;

    /**
     * 导出格式：excel/pdf/word/html
     */
    private String exportFormat;

    /**
     * 通知方式：email/system/webhook
     */
    private String notifyType;

    /**
     * 通知接收人（JSON数组）
     */
    private String notifyReceivers;

    /**
     * 邮件主题模板
     */
    private String emailSubject;

    /**
     * 邮件内容模板
     */
    private String emailContent;

    /**
     * Webhook URL
     */
    private String webhookUrl;

    /**
     * 报表保留天数
     */
    private Integer retentionDays;

    /**
     * 最大保留份数
     */
    private Integer maxRetentionCount;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 上次执行时间
     */
    private LocalDateTime lastExecuteTime;

    /**
     * 上次执行状态：success/failed
     */
    private String lastExecuteStatus;

    /**
     * 下次执行时间
     */
    private LocalDateTime nextExecuteTime;

    /**
     * 执行次数
     */
    private Integer executeCount;

    /**
     * 成功次数
     */
    private Integer successCount;

    /**
     * 失败次数
     */
    private Integer failCount;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新人ID
     */
    private Long updatedBy;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}