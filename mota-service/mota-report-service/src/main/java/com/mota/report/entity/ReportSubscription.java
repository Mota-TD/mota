package com.mota.report.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报表订阅实体
 * 用户订阅报表，定期接收报表
 *
 * @author mota
 */
@Data
@TableName("report_subscription")
public class ReportSubscription {

    /**
     * 订阅ID
     */
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
     * 订阅类型：template/schedule/dashboard
     */
    private String subscribeType;

    /**
     * 订阅目标ID（模板ID/定时任务ID/仪表盘ID）
     */
    private Long targetId;

    /**
     * 通知方式：email/system/webhook
     */
    private String notifyType;

    /**
     * 邮箱地址（当notifyType=email时）
     */
    private String email;

    /**
     * Webhook URL（当notifyType=webhook时）
     */
    private String webhookUrl;

    /**
     * 导出格式偏好：excel/pdf/word/html
     */
    private String preferredFormat;

    /**
     * 状态：0-取消订阅，1-已订阅
     */
    private Integer status;

    /**
     * 订阅时间
     */
    private LocalDateTime subscribedAt;

    /**
     * 取消订阅时间
     */
    private LocalDateTime unsubscribedAt;

    /**
     * 最后接收时间
     */
    private LocalDateTime lastReceivedAt;

    /**
     * 接收次数
     */
    private Integer receiveCount;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}