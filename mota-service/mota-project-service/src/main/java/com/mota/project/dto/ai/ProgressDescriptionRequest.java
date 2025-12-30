package com.mota.project.dto.ai;

import lombok.Data;

/**
 * AI 进度描述请求 DTO
 */
@Data
public class ProgressDescriptionRequest {
    
    /**
     * 任务ID
     */
    private Long taskId;
    
    /**
     * 任务名称
     */
    private String taskName;
    
    /**
     * 任务描述
     */
    private String taskDescription;
    
    /**
     * 当前进度
     */
    private Integer currentProgress;
    
    /**
     * 新进度
     */
    private Integer newProgress;
    
    /**
     * 用户输入的描述（用于润色）
     */
    private String userDescription;
    
    /**
     * 操作类型：polish（润色）或 generate（自动生成）
     */
    private String actionType;
}