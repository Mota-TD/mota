package com.mota.task.feign.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 里程碑 DTO（用于 Feign 调用）
 */
@Data
public class MilestoneDTO {
    
    private Long id;
    
    /**
     * 项目ID
     */
    private Long projectId;
    
    /**
     * 里程碑名称
     */
    private String name;
    
    /**
     * 里程碑描述
     */
    private String description;
    
    /**
     * 开始日期
     */
    private LocalDate startDate;
    
    /**
     * 截止日期
     */
    private LocalDate dueDate;
    
    /**
     * 状态
     */
    private String status;
    
    /**
     * 进度 (0-100)
     */
    private Integer progress;
    
    /**
     * 排序
     */
    private Integer sortOrder;
    
    /**
     * 完成时间
     */
    private LocalDateTime completedAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}