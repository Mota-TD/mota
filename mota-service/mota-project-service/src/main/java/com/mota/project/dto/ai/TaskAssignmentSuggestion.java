package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 任务分配建议 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentSuggestion {
    private List<SuggestedAssignee> suggestedAssignees;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SuggestedAssignee {
        private Long userId;
        private String userName;
        private Double matchScore;
        private Integer currentWorkload;
        private String reason;
    }
}