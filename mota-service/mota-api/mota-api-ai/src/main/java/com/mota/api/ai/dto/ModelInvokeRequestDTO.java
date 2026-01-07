package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 模型调用请求DTO
 */
@Data
public class ModelInvokeRequestDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 提示词
     */
    private String prompt;
    
    /**
     * 消息列表
     */
    private List<MessageDTO> messages;
    
    /**
     * 温度参数
     */
    private Double temperature;
    
    /**
     * 最大Token数
     */
    private Integer maxTokens;
    
    /**
     * 额外参数
     */
    private Map<String, Object> params;
    
    @Data
    public static class MessageDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        
        private String role;
        private String content;
    }
}