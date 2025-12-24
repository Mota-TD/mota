package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 任务优先级请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskPriorityRequest {
    private String taskDescription;
    private String deadline;
}