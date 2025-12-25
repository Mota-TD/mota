package com.mota.project.dto.resource;

import lombok.Data;
import java.util.List;

/**
 * 工作量统计数据 DTO
 * RM-001: 个人任务负载可视化
 */
@Data
public class WorkloadStatsData {
    
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
     * 总任务数
     */
    private Integer totalTasks;
    
    /**
     * 进行中任务数
     */
    private Integer inProgressTasks;
    
    /**
     * 已完成任务数
     */
    private Integer completedTasks;
    
    /**
     * 逾期任务数
     */
    private Integer overdueTasks;
    
    /**
     * 总工时（小时）
     */
    private Double totalHours;
    
    /**
     * 已用工时（小时）
     */
    private Double usedHours;
    
    /**
     * 剩余工时（小时）
     */
    private Double remainingHours;
    
    /**
     * 工作负载百分比（0-100）
     */
    private Double workloadPercentage;
    
    /**
     * 负载状态：LIGHT(轻松), NORMAL(正常), HEAVY(繁忙), OVERLOAD(过载)
     */
    private String workloadStatus;
    
    /**
     * 每日工作量分布
     */
    private List<DailyWorkload> dailyWorkloads;
    
    /**
     * 按项目分组的工作量
     */
    private List<ProjectWorkload> projectWorkloads;
    
    /**
     * 每日工作量
     */
    @Data
    public static class DailyWorkload {
        /**
         * 日期 (yyyy-MM-dd)
         */
        private String date;
        
        /**
         * 计划工时
         */
        private Double plannedHours;
        
        /**
         * 实际工时
         */
        private Double actualHours;
        
        /**
         * 任务数量
         */
        private Integer taskCount;
    }
    
    /**
     * 项目工作量
     */
    @Data
    public static class ProjectWorkload {
        /**
         * 项目ID
         */
        private Long projectId;
        
        /**
         * 项目名称
         */
        private String projectName;
        
        /**
         * 任务数量
         */
        private Integer taskCount;
        
        /**
         * 工时占比
         */
        private Double hoursPercentage;
        
        /**
         * 总工时
         */
        private Double totalHours;
    }
}