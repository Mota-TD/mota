package com.mota.project.dto.resource;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.util.List;

/**
 * 团队工作量分布数据 DTO
 * RM-002: 团队工作量分布图
 */
@Data
public class TeamDistributionData {
    
    /**
     * 团队ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long teamId;
    
    /**
     * 团队名称
     */
    private String teamName;
    
    /**
     * 团队成员总数
     */
    private Integer totalMembers;
    
    /**
     * 活跃成员数
     */
    private Integer activeMembers;
    
    /**
     * 团队总任务数
     */
    private Integer totalTasks;
    
    /**
     * 团队总工时
     */
    private Double totalHours;
    
    /**
     * 平均工作负载
     */
    private Double averageWorkload;
    
    /**
     * 成员工作量分布
     */
    private List<MemberWorkload> memberWorkloads;
    
    /**
     * 按状态分布
     */
    private StatusDistribution statusDistribution;
    
    /**
     * 按优先级分布
     */
    private PriorityDistribution priorityDistribution;
    
    /**
     * 成员工作量
     */
    @Data
    public static class MemberWorkload {
        /**
         * 用户ID
         */
        @JsonSerialize(using = ToStringSerializer.class)
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
         * 任务数量
         */
        private Integer taskCount;
        
        /**
         * 工时
         */
        private Double hours;
        
        /**
         * 工作负载百分比
         */
        private Double workloadPercentage;
        
        /**
         * 负载状态
         */
        private String workloadStatus;
        
        /**
         * 完成率
         */
        private Double completionRate;
    }
    
    /**
     * 状态分布
     */
    @Data
    public static class StatusDistribution {
        /**
         * 待处理
         */
        private Integer pending;
        
        /**
         * 进行中
         */
        private Integer inProgress;
        
        /**
         * 已完成
         */
        private Integer completed;
        
        /**
         * 已取消
         */
        private Integer cancelled;
        
        /**
         * 逾期
         */
        private Integer overdue;
    }
    
    /**
     * 优先级分布
     */
    @Data
    public static class PriorityDistribution {
        /**
         * 紧急
         */
        private Integer urgent;
        
        /**
         * 高
         */
        private Integer high;
        
        /**
         * 中
         */
        private Integer medium;
        
        /**
         * 低
         */
        private Integer low;
    }
}