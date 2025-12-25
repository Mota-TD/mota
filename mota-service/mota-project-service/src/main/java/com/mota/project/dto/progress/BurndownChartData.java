package com.mota.project.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 燃尽图数据 DTO
 * Sprint级别燃尽图展示
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BurndownChartData {
    
    /**
     * 项目ID
     */
    private Long projectId;
    
    /**
     * 项目名称
     */
    private String projectName;
    
    /**
     * Sprint ID (可选)
     */
    private Long sprintId;
    
    /**
     * Sprint名称 (可选)
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
     * 总任务数/故事点
     */
    private Integer totalPoints;
    
    /**
     * 理想燃尽线数据点
     */
    private List<DataPoint> idealLine;
    
    /**
     * 实际燃尽线数据点
     */
    private List<DataPoint> actualLine;
    
    /**
     * 预测燃尽线数据点
     */
    private List<DataPoint> predictedLine;
    
    /**
     * 当前剩余工作量
     */
    private Integer remainingPoints;
    
    /**
     * 完成百分比
     */
    private Double completionPercentage;
    
    /**
     * 是否按计划进行
     */
    private Boolean onTrack;
    
    /**
     * 偏差天数（正数表示落后，负数表示提前）
     */
    private Integer deviationDays;
    
    /**
     * 数据点
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        /**
         * 日期
         */
        private String date;
        
        /**
         * 剩余工作量
         */
        private Integer value;
        
        /**
         * 当日完成量
         */
        private Integer completed;
    }
}