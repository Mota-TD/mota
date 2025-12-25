package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 翻译记录实体
 * AA-005 多语言翻译
 */
@Data
@TableName("ai_translation")
public class AITranslation {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 来源类型: text/document/message
     */
    private String sourceType;
    
    /**
     * 来源ID
     */
    private Long sourceId;
    
    /**
     * 源语言
     */
    private String sourceLanguage;
    
    /**
     * 目标语言
     */
    private String targetLanguage;
    
    /**
     * 原文
     */
    private String sourceText;
    
    /**
     * 译文
     */
    private String translatedText;
    
    /**
     * 字数
     */
    private Integer wordCount;
    
    /**
     * 翻译引擎: ai/google/deepl
     */
    private String translationEngine;
    
    /**
     * 使用的模型
     */
    private String modelUsed;
    
    /**
     * 使用的Token数
     */
    private Integer tokensUsed;
    
    /**
     * 翻译时间(毫秒)
     */
    private Integer translationTimeMs;
    
    /**
     * 质量评分
     */
    private BigDecimal qualityScore;
    
    /**
     * 是否已审核
     */
    private Boolean isReviewed;
    
    /**
     * 审核后文本
     */
    private String reviewedText;
    
    /**
     * 用户评分
     */
    private Integer feedbackRating;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}