package com.mota.project.dto.resource;

import lombok.Data;
import java.util.List;

/**
 * 资源利用率数据 DTO
 * RM-005: 资源利用率图表
 */
@Data
public class ResourceUtilizationData {
    
    /**
     * 统计周期：DAILY(日), WEEKLY(周), MONTHLY(月)
     */
    private String period;
    
    /**
     * 开始日期
     */
    private String startDate;
    
    /**
     * 结束日期
     */
    private String endDate;
    
    /**
     * 团队平均利用率
     */
    private Double teamAverageUtilization;
    
    /**
     * 目标利用率
     */
    private Double targetUtilization;
    
    /**
     * 利用率趋势
     */
    private List<UtilizationTrend> utilizationTrends;
    
    /**
     * 成员利用率列表
     */
    private List<MemberUtilization> memberUtilizations;
    
    /**
     * 项目利用率分布
     */
    private List<ProjectUtilization> projectUtilizations;
    
    /**
     * 利用率趋势
     */
    @Data
    public static class UtilizationTrend {
        /**
         * 日期/周/月
         */
        private String period;
        
        /**
         * 可用工时
         */
        private Double availableHours;
        
        /**
         * 实际工时
         */
        private Double actualHours;
        
        /**
         * 利用率百分比
         */
        private Double utilizationPercentage;
        
        /**
         * 计费工时
         */
        private Double billableHours;
        
        /**
         * 计费率
         */
        private Double billableRate;
    }
    
    /**
     * 成员利用率
     */
    @Data
    public static class MemberUtilization {
        /**
         * 用户ID
         */
        private Long userId;
        
        /**
         * 用户名
         */
        private String userName;
        
        /**
         * 用户头像
         */
        private String avatar;
        
        /**
         * 部门
         */
        private String department;
        
        /**
         * 可用工时
         */
        private Double availableHours;
        
        /**
         * 已分配工时
         */
        private Double allocatedHours;
        
        /**
         * 实际工时
         */
        private Double actualHours;
        
        /**
         * 利用率百分比
         */
        private Double utilizationPercentage;
        
        /**
         * 效率指数（实际/预估）
         */
        private Double efficiencyIndex;
        
        /**
         * 利用率状态：LOW(低), OPTIMAL(最佳), HIGH(高), OVERUTILIZED(过度)
         */
        private String utilizationStatus;
        
        /**
         * 趋势：UP(上升), DOWN(下降), STABLE(稳定)
         */
        private String trend;
    }
    
    /**
     * 项目利用率
     */
    @Data
    public static class ProjectUtilization {
        /**
         * 项目ID
         */
        private Long projectId;
        
        /**
         * 项目名称
         */
        private String projectName;
        
        /**
         * 分配工时
         */
        private Double allocatedHours;
        
        /**
         * 实际工时
         */
        private Double actualHours;
        
        /**
         * 工时占比
         */
        private Double hoursPercentage;
        
        /**
         * 参与人数
         */
        private Integer memberCount;
    }
    
    /**
     * 利用率分布统计
     */
    @Data
    public static class UtilizationDistribution {
        /**
         * 低利用率人数（<50%）
         */
        private Integer lowCount;
        
        /**
         * 最佳利用率人数（50%-80%）
         */
        private Integer optimalCount;
        
        /**
         * 高利用率人数（80%-100%）
         */
        private Integer highCount;
        
        /**
         * 过度利用人数（>100%）
         */
        private Integer overutilizedCount;
    }
    
    /**
     * 利用率分布
     */
    private UtilizationDistribution distribution;
}