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
     * 解析的意图
     */
    private String parsedIntent;
    
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
     * 解析置信度
     */
    private BigDecimal confidence;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}