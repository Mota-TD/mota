package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * AI使用统计实体
 * MM-008 成本控制
 */
@Data
@TableName("ai_usage_stats")
public class AIUsageStats {

    @TableId(type = IdType.AUTO)
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
     * 模型配置ID
     */
    private Long modelConfigId;

    /**
     * 模型名称
     */
    private String modelName;

    /**
     * 统计日期
     */
    private LocalDate statsDate;

    /**
     * 请求次数
     */
    private Integer requestCount;

    /**
     * 成功次数
     */
    private Integer successCount;

    /**
     * 失败次数
     */
    private Integer failureCount;

    /**
     * 输入Token数
     */
    private Long inputTokens;

    /**
     * 输出Token数
     */
    private Long outputTokens;

    /**
     * 总Token数
     */
    private Long totalTokens;

    /**
     * 总输入Token数（别名）
     */
    private Long totalInputTokens;

    /**
     * 总输出Token数（别名）
     */
    private Long totalOutputTokens;

    /**
     * 费用（元）
     */
    private BigDecimal cost;

    /**
     * 总费用（别名）
     */
    private BigDecimal totalCost;

    /**
     * 平均响应时间（毫秒）
     */
    private Integer avgResponseTime;

    /**
     * 最大响应时间（毫秒）
     */
    private Integer maxResponseTime;

    /**
     * 最小响应时间（毫秒）
     */
    private Integer minResponseTime;

    /**
     * 总响应时间（毫秒）
     */
    private Integer totalResponseTime;

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