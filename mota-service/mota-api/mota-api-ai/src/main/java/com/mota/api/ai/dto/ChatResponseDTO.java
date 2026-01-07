package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 聊天响应DTO
 */
@Data
public class ChatResponseDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 消息ID
     */
    private Long messageId;
    
    /**
     * 会话ID
     */
    private Long sessionId;
    
    /**
     * 响应内容
     */
    private String content;
    
    /**
     * 使用的模型
     */
    private String model;
    
    /**
     * Token使用量
     */
    private Integer tokensUsed;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}