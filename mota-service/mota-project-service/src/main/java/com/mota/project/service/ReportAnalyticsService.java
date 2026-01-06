package com.mota.project.service;

import com.mota.project.dto.report.*;

import java.time.LocalDate;

/**
 * 报表分析服务接口
 */
public interface ReportAnalyticsService {
    
    /**
     * 获取团队效能指标
     */
    TeamEfficiencyKPI getTeamEfficiency(Long teamId, String period, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取平均完成时间
     */
    AvgCompletionTimeData getAvgCompletionTime(Long teamId, Long projectId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取逾期率统计
     */
    OverdueRateData getOverdueRate(Long teamId, Long projectId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取成员贡献度
     */
    MemberContributionData getMemberContribution(Long teamId, String period, LocalDate startDate, LocalDate endDate);
}