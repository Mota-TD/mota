package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 工作建议DTO
 */
@Data
public class WorkSuggestionDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 建议ID
     */
    private Long id;
    
    /**
     * 建议类型
     */
    private String type;
    
    /**
     * 建议标题
     */
    private String title;
    
    /**
     * 建议内容
     */
    private String content;
    
    /**
     * 优先级
     */
    private Integer priority;
    
    /**
     * 关联任务ID
     */
    private Long taskId;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}