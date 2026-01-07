package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 模型调用结果DTO
 */
@Data
public class ModelInvokeResultDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 响应内容
     */
    private String content;
    
    /**
     * 使用的模型
     */
    private String model;
    
    /**
     * 输入Token数
     */
    private Integer promptTokens;
    
    /**
     * 输出Token数
     */
    private Integer completionTokens;
    
    /**
     * 总Token数
     */
    private Integer totalTokens;
    
    /**
     * 完成原因
     */
    private String finishReason;
    
    /**
     * 耗时(毫秒)
     */
    private Long latency;
}