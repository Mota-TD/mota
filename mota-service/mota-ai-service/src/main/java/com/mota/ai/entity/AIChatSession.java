package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI对话会话实体
 * AA-001 智能问答
 */
@Data
@TableName("ai_chat_session")
public class AIChatSession {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 企业ID
     */
    private Long enterpriseId;
    
    /**
     * 会话类型: general/task/document/schedule/report
     */
    private String sessionType;
    
    /**
     * 会话标题
     */
    private String title;
    
    /**
     * 上下文类型: project/task/document
     */
    private String contextType;
    
    /**
     * 上下文ID
     */
    private Long contextId;
    
    /**
     * 使用的模型
     */
    private String modelName;
    
    /**
     * 总Token数
     */
    private Integer totalTokens;
    
    /**
     * 消息数量
     */
    private Integer messageCount;
    
    /**
     * 是否置顶
     */
    private Boolean isPinned;
    
    /**
     * 是否归档
     */
    private Boolean isArchived;
    
    /**
     * 状态：0-已归档，1-活跃
     */
    private Integer status;
    
    /**
     * 最后消息时间
     */
    private LocalDateTime lastMessageAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 是否删除
     */
    private Integer deleted;
}