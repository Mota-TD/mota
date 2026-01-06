package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.dto.report.*;
import com.mota.project.service.ReportAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * 报表分析控制器
 * 提供报表分析相关API：团队效能指标、平均完成时间、逾期率统计、成员贡献度
 */
@Tag(name = "报表分析", description = "报表分析相关接口")
@RestController
@RequestMapping("/api/report-analytics")
@RequiredArgsConstructor
public class ReportAnalyticsController {
    
    private final ReportAnalyticsService reportAnalyticsService;
    
    /**
     * 获取团队效能指标
     * RP-004: 团队效能KPI展示
     */
    @Operation(summary = "获取团队效能指标", description = "获取团队效能KPI数据，包括完成率、准时率、速度等")
    @GetMapping("/team-efficiency")
    public Result<TeamEfficiencyKPI> getTeamEfficiency(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "统计周期：WEEKLY, MONTHLY, QUARTERLY") @RequestParam(defaultValue = "MONTHLY") String period,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(reportAnalyticsService.getTeamEfficiency(teamId, period, startDate, endDate));
    }
    
    /**
     * 获取平均完成时间
     * RP-006: 任务平均完成时间
     */
    @Operation(summary = "获取平均完成时间", description = "获取任务平均完成时间数据，包括分布、按优先级、按类型等")
    @GetMapping("/avg-completion-time")
    public Result<AvgCompletionTimeData> getAvgCompletionTime(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(reportAnalyticsService.getAvgCompletionTime(teamId, projectId, startDate, endDate));
    }
    
    /**
     * 获取逾期率统计
     * RP-007: 任务逾期率分析
     */
    @Operation(summary = "获取逾期率统计", description = "获取任务逾期率数据，包括逾期任务列表、原因分析、趋势等")
    @GetMapping("/overdue-rate")
    public Result<OverdueRateData> getOverdueRate(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "项目ID") @RequestParam(required = false) Long projectId,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(reportAnalyticsService.getOverdueRate(teamId, projectId, startDate, endDate));
    }
    
    /**
     * 获取成员贡献度
     * RP-008: 成员贡献度排行
     */
    @Operation(summary = "获取成员贡献度", description = "获取成员贡献度数据，包括任务贡献、工时贡献、协作指标等")
    @GetMapping("/member-contribution")
    public Result<MemberContributionData> getMemberContribution(
            @Parameter(description = "团队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "统计周期：WEEKLY, MONTHLY, QUARTERLY") @RequestParam(defaultValue = "MONTHLY") String period,
            @Parameter(description = "开始日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(reportAnalyticsService.getMemberContribution(teamId, period, startDate, endDate));
    }
}