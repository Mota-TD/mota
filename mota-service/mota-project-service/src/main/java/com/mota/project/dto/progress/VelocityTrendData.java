package com.mota.project.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 速度趋势数据 DTO
 * 团队速度趋势分析
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VelocityTrendData {
    
    /**
     * 项目ID
     */
    private Long projectId;
    
    /**
     * 项目名称
     */
    private String projectName;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 团队名称
     */
    private String teamName;
    
    /**
     * Sprint速度数据列表
     */
    private List<SprintVelocity> sprintVelocities;
    
    /**
     * 平均速度
     */
    private Double averageVelocity;
    
    /**
     * 速度趋势（increasing/decreasing/stable）
     */
    private String velocityTrend;
    
    /**
     * 速度变化百分比
     */
    private Double velocityChangePercentage;
    
    /**
     * 最高速度
     */
    private Integer maxVelocity;
    
    /**
     * 最低速度
     */
    private Integer minVelocity;
    
    /**
     * 速度标准差
     */
    private Double velocityStdDev;
    
    /**
     * 预测下一Sprint速度
     */
    private Integer predictedNextVelocity;
    
    /**
     * 预测置信度
     */
    private Double predictionConfidence;
    
    /**
     * 团队成员数量
     */
    private Integer teamSize;
    
    /**
     * 人均速度
     */
    private Double velocityPerMember;
    
    /**
     * Sprint速度数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SprintVelocity {
        /**
         * Sprint ID
         */
        private Long sprintId;
        
        /**
         * Sprint名称
         */
        private String sprintName;
        
        /**
         * 开始日期
         */
        private String startDate;
        
        /**
         * 结束日期
         */
        private String endDate;
        
        /**
         * 计划故事点
         */
        private Integer plannedPoints;
        
        /**
         * 完成故事点
         */
        private Integer completedPoints;
        
        /**
         * 完成率
         */
        private Double completionRate;
        
        /**
         * 承诺任务数
         */
        private Integer committedTasks;
        
        /**
         * 完成任务数
         */
        private Integer completedTasks;
        
        /**
         * 新增任务数（Sprint期间）
         */
        private Integer addedTasks;
        
        /**
         * 移除任务数（Sprint期间）
         */
        private Integer removedTasks;
        
        /**
         * 团队成员数
         */
        private Integer teamSize;
        
        /**
         * 人均完成点数
         */
        private Double pointsPerMember;
    }
    
    /**
     * 速度分析摘要
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VelocityAnalysis {
        /**
         * 分析周期
         */
        private String period;
        
        /**
         * 分析结论
         */
        private String conclusion;
        
        /**
         * 影响因素
         */
        private List<String> factors;
        
        /**
         * 改进建议
         */
        private List<String> suggestions;
    }
    
    /**
     * 速度分析
     */
    private VelocityAnalysis analysis;
}