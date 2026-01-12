package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI模型配置实体
 * MM-001~008 多模型支持
 */
@Data
@TableName("ai_model_config")
public class AIModelConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 模型提供商: openai/anthropic/aliyun/baidu/local
     */
    private String provider;

    /**
     * 模型名称: gpt-4/gpt-3.5-turbo/claude-3/qwen-max/ernie-bot-4
     */
    private String modelName;

    /**
     * 模型显示名称
     */
    private String displayName;

    /**
     * 模型描述
     */
    private String description;

    /**
     * API端点
     */
    private String apiEndpoint;

    /**
     * API密钥（加密存储）
     */
    private String apiKey;

    /**
     * API密钥ID（用于多密钥轮换）
     */
    private String apiKeyId;

    /**
     * 模型类型: chat/completion/embedding/image
     */
    private String modelType;

    /**
     * 最大Token数
     */
    private Integer maxTokens;

    /**
     * 上下文窗口大小
     */
    private Integer contextWindow;

    /**
     * 输入价格（每1K tokens）
     */
    private BigDecimal inputPrice;

    /**
     * 输出价格（每1K tokens）
     */
    private BigDecimal outputPrice;

    /**
     * 每分钟请求限制
     */
    private Integer rpmLimit;

    /**
     * 每分钟Token限制
     */
    private Integer tpmLimit;

    /**
     * 优先级（用于路由选择）
     */
    private Integer priority;

    /**
     * 权重（用于负载均衡）
     */
    private Integer weight;

    /**
     * 是否启用
     */
    private Boolean isEnabled;

    /**
     * 是否为默认模型
     */
    private Boolean isDefault;

    /**
     * 支持的功能: chat,completion,embedding,function_calling,vision
     */
    private String capabilities;

    /**
     * 模型参数配置（JSON）
     */
    private String parameters;

    /**
     * 降级模型ID
     */
    private Long fallbackModelId;

    /**
     * 健康状态: healthy/degraded/unhealthy
     */
    private String healthStatus;

    /**
     * 最后健康检查时间
     */
    private LocalDateTime lastHealthCheck;

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