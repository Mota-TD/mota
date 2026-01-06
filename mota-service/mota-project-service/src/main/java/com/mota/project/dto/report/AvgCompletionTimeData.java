package com.mota.project.dto.report;

import lombok.Data;
import java.util.List;

/**
 * 平均完成时间数据
 */
@Data
public class AvgCompletionTimeData {
    private Long teamId;
    private String teamName;
    private String period;
    
    // 总体统计
    private Integer totalCompletedTasks;
    private Double avgCompletionDays;
    private Double medianCompletionDays;
    private Double minCompletionDays;
    private Double maxCompletionDays;
    
    // 分布数据
    private List<CompletionTimeDistribution> distribution;
    
    // 按优先级
    private List<CompletionTimeByPriority> byPriority;
    
    // 按类型
    private List<CompletionTimeByType> byType;
    
    // 趋势
    private List<CompletionTimeTrend> trends;
    
    // 与上期对比
    private Double avgDaysChange;
    
    @Data
    public static class CompletionTimeDistribution {
        private String range; // 如 "0-1天", "1-3天", "3-7天", "7-14天", ">14天"
        private Integer count;
        private Double percentage;
    }
    
    @Data
    public static class CompletionTimeByPriority {
        private String priority;
        private Double avgDays;
        private Double minDays;
        private Double maxDays;
        private Integer taskCount;
    }
    
    @Data
    public static class CompletionTimeByType {
        private String taskType;
        private Double avgDays;
        private Integer taskCount;
    }
    
    @Data
    public static class CompletionTimeTrend {
        private String period;
        private Double avgDays;
        private Double medianDays;
        private Integer taskCount;
    }
}