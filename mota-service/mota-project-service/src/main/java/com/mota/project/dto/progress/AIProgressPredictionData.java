package com.mota.project.dto.progress;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI进度预测数据 DTO
 * AI预测项目完成时间
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIProgressPredictionData {
    
    /**
     * 项目ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long projectId;
    
    /**
     * 项目名称
     */
    private String projectName;
    
    /**
     * 当前进度百分比
     */
    private Integer currentProgress;
    
    /**
     * 计划完成日期
     */
    private String plannedCompletionDate;
    
    /**
     * 预测完成日期
     */
    private String predictedCompletionDate;
    
    /**
     * 预测置信度（0-1）
     */
    private Double confidence;
    
    /**
     * 预测状态（on_track/at_risk/delayed/ahead）
     */
    private String predictionStatus;
    
    /**
     * 预测偏差天数（正数表示延迟，负数表示提前）
     */
    private Integer deviationDays;
    
    /**
     * 完成概率分布
     */
    private List<CompletionProbability> completionProbabilities;
    
    /**
     * 风险因素
     */
    private List<RiskFactor> riskFactors;
    
    /**
     * 加速建议
     */
    private List<AccelerationSuggestion> accelerationSuggestions;
    
    /**
     * 历史预测准确度
     */
    private Double historicalAccuracy;
    
    /**
     * 预测模型版本
     */
    private String modelVersion;
    
    /**
     * 预测时间
     */
    private String predictionTime;
    
    /**
     * 进度预测趋势数据
     */
    private List<ProgressTrendPoint> progressTrend;
    
    /**
     * 里程碑预测
     */
    private List<MilestonePrediction> milestonePredictions;
    
    /**
     * 完成概率分布
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletionProbability {
        /**
         * 日期
         */
        private String date;
        
        /**
         * 完成概率
         */
        private Double probability;
        
        /**
         * 累计概率
         */
        private Double cumulativeProbability;
    }
    
    /**
     * 风险因素
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactor {
        /**
         * 风险ID
         */
        private String id;
        
        /**
         * 风险名称
         */
        private String name;
        
        /**
         * 风险类型（resource/scope/technical/external）
         */
        private String type;
        
        /**
         * 风险等级（low/medium/high/critical）
         */
        private String severity;
        
        /**
         * 影响天数
         */
        private Integer impactDays;
        
        /**
         * 发生概率
         */
        private Double probability;
        
        /**
         * 风险描述
         */
        private String description;
        
        /**
         * 缓解措施
         */
        private String mitigation;
    }
    
    /**
     * 加速建议
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccelerationSuggestion {
        /**
         * 建议ID
         */
        private String id;
        
        /**
         * 建议标题
         */
        private String title;
        
        /**
         * 建议描述
         */
        private String description;
        
        /**
         * 预计节省天数
         */
        private Integer savedDays;
        
        /**
         * 实施难度（easy/medium/hard）
         */
        private String difficulty;
        
        /**
         * 资源需求
         */
        private String resourceRequirement;
        
        /**
         * 优先级
         */
        private Integer priority;
    }
    
    /**
     * 进度趋势点
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressTrendPoint {
        /**
         * 日期
         */
        private String date;
        
        /**
         * 实际进度
         */
        private Integer actualProgress;
        
        /**
         * 计划进度
         */
        private Integer plannedProgress;
        
        /**
         * 预测进度
         */
        private Integer predictedProgress;
        
        /**
         * 是否为预测数据
         */
        private Boolean isPredicted;
    }
    
    /**
     * 里程碑预测
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestonePrediction {
        /**
         * 里程碑ID
         */
        @JsonSerialize(using = ToStringSerializer.class)
        private Long milestoneId;
        
        /**
         * 里程碑名称
         */
        private String milestoneName;
        
        /**
         * 计划日期
         */
        private String plannedDate;
        
        /**
         * 预测日期
         */
        private String predictedDate;
        
        /**
         * 完成概率
         */
        private Double completionProbability;
        
        /**
         * 状态（on_track/at_risk/delayed/completed）
         */
        private String status;
        
        /**
         * 偏差天数
         */
        private Integer deviationDays;
    }
}