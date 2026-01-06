package com.mota.project.dto.resource;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 工作量预警数据 DTO
 * RM-003: 过载/空闲预警提示
 */
@Data
public class WorkloadAlertData {
    
    /**
     * 预警总数
     */
    private Integer totalAlerts;
    
    /**
     * 过载预警数
     */
    private Integer overloadAlerts;
    
    /**
     * 空闲预警数
     */
    private Integer idleAlerts;
    
    /**
     * 即将过载预警数
     */
    private Integer nearOverloadAlerts;
    
    /**
     * 预警列表
     */
    private List<Alert> alerts;
    
    /**
     * 预警详情
     */
    @Data
    public static class Alert {
        /**
         * 预警ID
         */
        @JsonSerialize(using = ToStringSerializer.class)
        private Long alertId;
        
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
         * 预警类型：OVERLOAD(过载), IDLE(空闲), NEAR_OVERLOAD(即将过载), DEADLINE_RISK(截止日期风险)
         */
        private String alertType;
        
        /**
         * 预警级别：HIGH(高), MEDIUM(中), LOW(低)
         */
        private String alertLevel;
        
        /**
         * 预警标题
         */
        private String title;
        
        /**
         * 预警描述
         */
        private String description;
        
        /**
         * 当前工作负载百分比
         */
        private Double currentWorkload;
        
        /**
         * 建议工作负载
         */
        private Double suggestedWorkload;
        
        /**
         * 受影响的任务数
         */
        private Integer affectedTasks;
        
        /**
         * 受影响的项目列表
         */
        private List<String> affectedProjects;
        
        /**
         * 建议操作
         */
        private List<String> suggestions;
        
        /**
         * 预警时间
         */
        private LocalDateTime alertTime;
        
        /**
         * 是否已处理
         */
        private Boolean resolved;
        
        /**
         * 处理时间
         */
        private LocalDateTime resolvedTime;
    }
    
    /**
     * 预警统计
     */
    @Data
    public static class AlertSummary {
        /**
         * 日期
         */
        private String date;
        
        /**
         * 过载人数
         */
        private Integer overloadCount;
        
        /**
         * 空闲人数
         */
        private Integer idleCount;
        
        /**
         * 正常人数
         */
        private Integer normalCount;
    }
    
    /**
     * 预警趋势
     */
    private List<AlertSummary> alertTrend;
}