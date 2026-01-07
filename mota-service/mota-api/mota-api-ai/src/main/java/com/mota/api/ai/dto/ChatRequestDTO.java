package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 聊天请求DTO
 */
@Data
public class ChatRequestDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 会话ID
     */
    private Long sessionId;
    
    /**
     * 消息内容
     */
    private String message;
    
    /**
     * 模型ID
     */
    private String modelId;
    
    /**
     * 上下文长度
     */
    private Integer contextLength;
}