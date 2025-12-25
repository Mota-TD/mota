package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI助手配置实体
 */
@Data
@TableName("ai_assistant_config")
public class AIAssistantConfig {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 助手名称
     */
    private String assistantName;
    
    /**
     * 助手头像
     */
    private String assistantAvatar;
    
    /**
     * 默认模型
     */
    private String defaultModel;
    
    /**
     * 温度参数
     */
    private BigDecimal temperature;
    
    /**
     * 最大Token数
     */
    private Integer maxTokens;
    
    /**
     * 启用上下文
     */
    private Boolean enableContext;
    
    /**
     * 上下文窗口大小
     */
    private Integer contextWindow;
    
    /**
     * 启用建议
     */
    private Boolean enableSuggestions;
    
    /**
     * 建议频率
     */
    private String suggestionFrequency;
    
    /**
     * 启用自动摘要
     */
    private Boolean enableAutoSummary;
    
    /**
     * 启用自动翻译
     */
    private Boolean enableAutoTranslation;
    
    /**
     * 首选语言
     */
    private String preferredLanguage;
    
    /**
     * 报告计划(JSON)
     */
    private String reportSchedule;
    
    /**
     * 通知设置(JSON)
     */
    private String notificationSettings;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}