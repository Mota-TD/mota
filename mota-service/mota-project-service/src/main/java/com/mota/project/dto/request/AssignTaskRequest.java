package com.mota.project.dto.request;

import lombok.Data;

/**
 * 任务分配请求 DTO
 */
@Data
public class AssignTaskRequest {
    
    /**
     * 执行人ID
     */
    private Long assigneeId;
}