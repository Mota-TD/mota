package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 任务优先级建议 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskPrioritySuggestion {
    private String suggestedPriority;
    private String reason;
}