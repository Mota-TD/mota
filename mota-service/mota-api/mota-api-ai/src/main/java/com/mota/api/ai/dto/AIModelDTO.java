package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * AI模型DTO
 */
@Data
public class AIModelDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 模型ID
     */
    private String id;
    
    /**
     * 模型名称
     */
    private String name;
    
    /**
     * 模型提供商
     */
    private String provider;
    
    /**
     * 模型类型
     */
    private String type;
    
    /**
     * 模型描述
     */
    private String description;
    
    /**
     * 支持的功能
     */
    private List<String> capabilities;
    
    /**
     * 最大Token数
     */
    private Integer maxTokens;
    
    /**
     * 是否可用
     */
    private Boolean available;
}