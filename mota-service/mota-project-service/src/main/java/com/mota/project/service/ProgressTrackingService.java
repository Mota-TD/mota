package com.mota.project.service;

import com.mota.project.dto.progress.AIProgressPredictionData;
import com.mota.project.dto.progress.BurndownChartData;
import com.mota.project.dto.progress.BurnupChartData;
import com.mota.project.dto.progress.VelocityTrendData;

/**
 * 进度跟踪服务接口
 */
public interface ProgressTrackingService {
    
    /**
     * 获取燃尽图数据
     * @param projectId 项目ID
     * @param sprintId Sprint ID（可选）
     * @return 燃尽图数据
     */
    BurndownChartData getBurndownChartData(Long projectId, Long sprintId);
    
    /**
     * 获取燃起图数据
     * @param projectId 项目ID
     * @return 燃起图数据
     */
    BurnupChartData getBurnupChartData(Long projectId);
    
    /**
     * 获取速度趋势数据
     * @param projectId 项目ID
     * @param sprintCount 要分析的Sprint数量
     * @return 速度趋势数据
     */
    VelocityTrendData getVelocityTrendData(Long projectId, Integer sprintCount);
    
    /**
     * 获取AI进度预测数据
     * @param projectId 项目ID
     * @return AI进度预测数据
     */
    AIProgressPredictionData getAIProgressPrediction(Long projectId);
}