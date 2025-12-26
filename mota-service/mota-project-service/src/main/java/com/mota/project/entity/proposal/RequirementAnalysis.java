package com.mota.project.entity.proposal;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 需求解析实体 (AG-002 需求解析)
 */
@Data
@TableName("ai_requirement_analysis")
public class RequirementAnalysis {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 原始需求文本
     */
    private String originalText;
    
    /**
     * 原始输入（用于AI处理）
     */
    private String originalInput;
    
    /**
     * 解析的意图
     */
    private String parsedIntent;
    
    /**
     * 意图类型
     */
    private String intentType;
    
    /**
     * 关键要素(JSON)
     */
    private String keyElements;
    
    /**
     * 识别的实体(JSON)
     */
    private String entities;
    
    /**
     * 约束条件(JSON)
     */
    private String constraints;
    
    /**
     * 目标列表(JSON)
     */
    private String goals;
    
    /**
     * 利益相关者(JSON)
     */
    private String stakeholders;
    
    /**
     * 时间线要求(JSON)
     */
    private String timeline;
    
    /**
     * 预算要求(JSON)
     */
    private String budget;
    
    /**
     * 目标受众
     */
    private String targetAudience;
    
    /**
     * 预期输出
     */
    private String expectedOutput;
    
    /**
     * 解析置信度
     */
    private BigDecimal confidence;
    
    /**
     * 置信度分数
     */
    private BigDecimal confidenceScore;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}