package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI预算配置实体
 * MM-008 成本控制
 */
@Data
@TableName("ai_budget_config")
public class AIBudgetConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 预算类型: daily/weekly/monthly/yearly
     */
    private String budgetType;

    /**
     * 预算金额（元）
     */
    private BigDecimal budgetAmount;

    /**
     * 已使用金额（元）
     */
    private BigDecimal usedAmount;

    /**
     * 当前使用量（别名）
     */
    private BigDecimal currentUsage;

    /**
     * Token预算
     */
    private Long tokenBudget;

    /**
     * 已使用Token
     */
    private Long usedTokens;

    /**
     * 请求次数预算
     */
    private Integer requestBudget;

    /**
     * 已使用请求次数
     */
    private Integer usedRequests;

    /**
     * 预警阈值（百分比）
     */
    private Integer alertThreshold;

    /**
     * 是否启用预警
     */
    private Boolean alertEnabled;

    /**
     * 超限策略: block/warn/continue
     */
    private String overLimitPolicy;

    /**
     * 预算周期开始时间
     */
    private LocalDateTime periodStart;

    /**
     * 预算周期开始日期（别名）
     */
    private java.time.LocalDate periodStartDate;

    /**
     * 预算周期结束时间
     */
    private LocalDateTime periodEnd;

    /**
     * 是否启用
     */
    private Boolean isEnabled;

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

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;
}