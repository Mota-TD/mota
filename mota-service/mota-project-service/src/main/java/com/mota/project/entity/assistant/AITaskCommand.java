package com.mota.project.entity.assistant;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI任务指令实体
 * 用于存储和处理AI助手执行的任务指令
 */
@Data
public class AITaskCommand {
    
    /**
     * 主键ID
     */
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 原始指令文本
     */
    private String commandText;
    
    /**
     * 指令类型 (create, update, delete, query, assign, etc.)
     */
    private String commandType;
    
    /**
     * 目标类型 (task, project, document, etc.)
     */
    private String targetType;
    
    /**
     * 目标ID
     */
    private Long targetId;
    
    /**
     * 解析后的参数 (JSON格式)
     */
    private String parsedParams;
    
    /**
     * 置信度分数
     */
    private BigDecimal confidenceScore;
    
    /**
     * 执行状态 (pending, success, failed, cancelled)
     */
    private String executionStatus;
    
    /**
     * 执行结果 (JSON格式)
     */
    private String executionResult;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 执行时间
     */
    private LocalDateTime executedAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}