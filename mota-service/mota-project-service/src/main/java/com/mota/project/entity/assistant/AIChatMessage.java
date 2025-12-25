package com.mota.project.entity.assistant;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI对话消息实体
 * AA-001 智能问答
 */
@Data
@TableName("ai_chat_message")
public class AIChatMessage {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 会话ID
     */
    private Long sessionId;
    
    /**
     * 角色: user/assistant/system
     */
    private String role;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 内容类型: text/markdown/code/image
     */
    private String contentType;
    
    /**
     * 意图类型
     */
    private String intentType;
    
    /**
     * 意图置信度
     */
    private BigDecimal intentConfidence;
    
    /**
     * 使用的Token数
     */
    private Integer tokensUsed;
    
    /**
     * 响应时间(毫秒)
     */
    private Integer responseTimeMs;
    
    /**
     * 是否错误
     */
    private Boolean isError;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 反馈评分: 1-5
     */
    private Integer feedbackRating;
    
    /**
     * 反馈评论
     */
    private String feedbackComment;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}