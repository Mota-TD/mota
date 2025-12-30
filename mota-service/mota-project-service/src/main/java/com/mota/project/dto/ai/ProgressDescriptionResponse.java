package com.mota.project.dto.ai;

import lombok.Builder;
import lombok.Data;

/**
 * AI 进度描述响应 DTO
 */
@Data
@Builder
public class ProgressDescriptionResponse {
    
    /**
     * 生成/润色后的描述
     */
    private String description;
    
    /**
     * 数据来源：ai 或 mock
     */
    private String source;
    
    /**
     * 使用的模型
     */
    private String model;
}