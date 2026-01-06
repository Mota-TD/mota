package com.mota.project.dto.progress;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 燃起图数据 DTO
 * 项目整体燃起图展示
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BurnupChartData {
    
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
     * 开始日期
     */
    private String startDate;
    
    /**
     * 结束日期
     */
    private String endDate;
    
    /**
     * 总范围（任务数/故事点）
     */
    private Integer totalScope;
    
    /**
     * 范围变化线数据点（显示范围蔓延）
     */
    private List<ScopeDataPoint> scopeLine;
    
    /**
     * 已完成工作线数据点
     */
    private List<DataPoint> completedLine;
    
    /**
     * 理想完成线数据点
     */
    private List<DataPoint> idealLine;
    
    /**
     * 预测完成线数据点
     */
    private List<DataPoint> predictedLine;
    
    /**
     * 当前已完成工作量
     */
    private Integer completedPoints;
    
    /**
     * 完成百分比
     */
    private Double completionPercentage;
    
    /**
     * 范围变化量（正数表示增加，负数表示减少）
     */
    private Integer scopeChange;
    
    /**
     * 范围变化百分比
     */
    private Double scopeChangePercentage;
    
    /**
     * 预计完成日期
     */
    private String predictedCompletionDate;
    
    /**
     * 是否按计划进行
     */
    private Boolean onTrack;
    
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
         * 累计完成量
         */
        private Integer value;
        
        /**
         * 当日完成量
         */
        private Integer dailyCompleted;
    }
    
    /**
     * 范围数据点
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScopeDataPoint {
        /**
         * 日期
         */
        private String date;
        
        /**
         * 总范围
         */
        private Integer totalScope;
        
        /**
         * 范围变化量
         */
        private Integer scopeChange;
        
        /**
         * 变化原因
         */
        private String changeReason;
    }
}