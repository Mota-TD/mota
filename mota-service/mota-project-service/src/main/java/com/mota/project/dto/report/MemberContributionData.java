package com.mota.project.dto.report;

import lombok.Data;
import java.util.List;

/**
 * 成员贡献度数据
 */
@Data
public class MemberContributionData {
    private Long teamId;
    private String teamName;
    private String period;
    
    // 总体统计
    private Integer totalMembers;
    private Double avgContributionScore;
    
    // 成员列表
    private List<MemberContribution> members;
    
    // 分布
    private List<ContributionDistribution> distribution;
    
    // 趋势
    private List<ContributionTrend> trends;
    
    // Top贡献者
    private List<MemberContribution> topContributors;
    
    @Data
    public static class MemberContribution {
        private Long userId;
        private String userName;
        private String avatar;
        private String department;
        private String position;
        
        // 任务贡献
        private Integer totalTasks;
        private Integer completedTasks;
        private Double completionRate;
        
        // 工时贡献
        private Double totalHours;
        private Double hoursPercentage;
        
        // 质量指标
        private Double onTimeRate;
        private Double avgCompletionDays;
        
        // 协作指标
        private Integer commentsCount;
        private Integer reviewsCount;
        private Integer helpedOthers;
        
        // 综合得分
        private Double contributionScore;
        private Integer rank;
        
        // 趋势
        private String trend; // UP, DOWN, STABLE
        private Double scoreChange;
    }
    
    @Data
    public static class ContributionDistribution {
        private String level; // 如 "核心贡献者", "活跃贡献者", "一般贡献者", "待提升"
        private Integer count;
        private Double percentage;
    }
    
    @Data
    public static class ContributionTrend {
        private String period;
        private Double avgScore;
        private Double topContributorScore;
        private Double bottomContributorScore;
    }
}