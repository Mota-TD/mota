package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.dto.progress.AIProgressPredictionData;
import com.mota.project.dto.progress.BurndownChartData;
import com.mota.project.dto.progress.BurnupChartData;
import com.mota.project.dto.progress.VelocityTrendData;
import com.mota.project.service.ProgressTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 进度跟踪控制器
 * 提供燃尽图、燃起图、速度趋势和AI进度预测功能
 */
@Tag(name = "进度跟踪", description = "燃尽图、燃起图、速度趋势和AI进度预测")
@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressTrackingController {
    
    private final ProgressTrackingService progressTrackingService;
    
    /**
     * 获取燃尽图数据
     */
    @Operation(summary = "获取燃尽图数据", description = "获取项目或Sprint的燃尽图数据")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/burndown/{projectId}")
    public Result<BurndownChartData> getBurndownChart(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @Parameter(description = "Sprint ID（可选）") @RequestParam(required = false) Long sprintId) {
        BurndownChartData data = progressTrackingService.getBurndownChartData(projectId, sprintId);
        if (data == null) {
            return Result.fail("项目不存在");
        }
        return Result.success(data);
    }
    
    /**
     * 获取燃起图数据
     */
    @Operation(summary = "获取燃起图数据", description = "获取项目整体燃起图数据")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/burnup/{projectId}")
    public Result<BurnupChartData> getBurnupChart(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        BurnupChartData data = progressTrackingService.getBurnupChartData(projectId);
        if (data == null) {
            return Result.fail("项目不存在");
        }
        return Result.success(data);
    }
    
    /**
     * 获取速度趋势数据
     */
    @Operation(summary = "获取速度趋势数据", description = "获取团队速度趋势分析数据")
    @ApiResponse(responseCode = "200", description = "查询成功")
    @GetMapping("/velocity/{projectId}")
    public Result<VelocityTrendData> getVelocityTrend(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId,
            @Parameter(description = "要分析的Sprint数量") @RequestParam(required = false, defaultValue = "6") Integer sprintCount) {
        VelocityTrendData data = progressTrackingService.getVelocityTrendData(projectId, sprintCount);
        if (data == null) {
            return Result.fail("项目不存在");
        }
        return Result.success(data);
    }
    
    /**
     * 获取AI进度预测数据
     */
    @Operation(summary = "获取AI进度预测", description = "使用AI预测项目完成时间")
    @ApiResponse(responseCode = "200", description = "预测成功")
    @GetMapping("/ai-prediction/{projectId}")
    public Result<AIProgressPredictionData> getAIProgressPrediction(
            @Parameter(description = "项目ID", required = true) @PathVariable Long projectId) {
        AIProgressPredictionData data = progressTrackingService.getAIProgressPrediction(projectId);
        if (data == null) {
            return Result.fail("项目不存在");
        }
        return Result.success(data);
    }
}