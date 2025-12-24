package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 任务分解建议 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDecompositionSuggestion {
    private String id;
    private String name;
    private String description;
    private String suggestedDepartment;
    private String suggestedPriority;
    private Integer estimatedDays;
    private List<String> dependencies;
}