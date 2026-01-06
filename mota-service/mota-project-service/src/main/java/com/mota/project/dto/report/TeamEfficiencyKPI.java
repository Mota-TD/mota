package com.mota.project.dto.report;

import lombok.Data;
import java.util.List;

/**
 * 团队效能KPI数据
 */
@Data
public class TeamEfficiencyKPI {
    private Long teamId;
    private String teamName;
    private String period;
    
    // 核心指标
    private Integer totalTasks;
    private Integer completedTasks;
    private Double completionRate;
    private Double onTimeCompletionRate;
    private Double avgCompletionDays;
    private Double velocity; // 速度（每周完成任务数）
    
    // 质量指标
    private Double bugRate;
    private Double reworkRate;
    private Double firstTimePassRate;
    
    // 效率指标
    private Double utilizationRate;
    private Double focusTime; // 专注时间（小时）
    private Double meetingTime; // 会议时间（小时）
    
    // 趋势数据
    private List<EfficiencyTrend> trends;
    
    // 与上期对比
    private Double completionRateChange;
    private Double onTimeRateChange;
    private Double velocityChange;
    
    @Data
    public static class EfficiencyTrend {
        private String period;
        private Double completionRate;
        private Double onTimeRate;
        private Double avgCompletionDays;
        private Double velocity;
    }
}