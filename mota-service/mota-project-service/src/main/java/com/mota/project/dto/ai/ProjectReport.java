package com.mota.project.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 项目报告 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectReport {
    private String id;
    private String projectId;
    private String projectName;
    private String reportType;  // daily, weekly, monthly
    private String summary;
    private List<String> highlights;
    private List<String> issues;
    private List<String> nextSteps;
    private ReportStatistics statistics;
    private String generatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportStatistics {
        private Integer totalTasks;
        private Integer completedTasks;
        private Integer inProgressTasks;
        private Integer overdueTasks;
        private Integer progressChange;
    }
}