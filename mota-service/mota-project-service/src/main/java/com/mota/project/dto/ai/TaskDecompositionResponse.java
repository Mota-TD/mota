package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 任务分解响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDecompositionResponse {
    /**
     * 任务分解建议列表
     */
    private List<TaskDecompositionSuggestion> suggestions;
    
    /**
     * 预估总工期（天）
     */
    private Integer totalEstimatedDays;
    
    /**
     * 风险评估
     */
    private String riskAssessment;
    
    /**
     * 数据来源：ai（真实AI生成）或 mock（模拟数据）
     */
    private String source;
    
    /**
     * 使用的AI模型名称（仅当source为ai时有值）
     */
    private String model;
    
    /**
     * 生成时间
     */
    private String generatedAt;
}