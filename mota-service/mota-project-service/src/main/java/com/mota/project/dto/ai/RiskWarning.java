package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 风险预警 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskWarning {
    private String id;
    private String type;  // delay, resource, dependency, quality
    private String severity;  // low, medium, high, critical
    private String title;
    private String description;
    private List<String> affectedTasks;
    private List<String> suggestions;
    private String createdAt;
}