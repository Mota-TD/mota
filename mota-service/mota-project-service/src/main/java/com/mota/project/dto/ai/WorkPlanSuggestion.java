package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 工作计划建议 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkPlanSuggestion {
    private String summary;
    private List<MilestoneSuggestion> milestones;
    private String resourceRequirements;
    private List<String> risks;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestoneSuggestion {
        private String name;
        private String targetDate;
        private List<String> deliverables;
    }
}