package com.mota.project.dto.resource;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 资源日历数据 DTO
 * RM-004: 资源日历视图
 */
@Data
public class ResourceCalendarData {
    
    /**
     * 开始日期
     */
    private LocalDate startDate;
    
    /**
     * 结束日期
     */
    private LocalDate endDate;
    
    /**
     * 资源列表
     */
    private List<ResourceRow> resources;
    
    /**
     * 日期列表
     */
    private List<DateColumn> dates;
    
    /**
     * 资源行
     */
    @Data
    public static class ResourceRow {
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
         * 职位
         */
        private String position;
        
        /**
         * 每日分配
         */
        private List<DayAllocation> allocations;
    }
    
    /**
     * 日期列
     */
    @Data
    public static class DateColumn {
        /**
         * 日期
         */
        private LocalDate date;
        
        /**
         * 星期几
         */
        private String dayOfWeek;
        
        /**
         * 是否工作日
         */
        private Boolean isWorkday;
        
        /**
         * 是否节假日
         */
        private Boolean isHoliday;
        
        /**
         * 节假日名称
         */
        private String holidayName;
    }
    
    /**
     * 每日分配
     */
    @Data
    public static class DayAllocation {
        /**
         * 日期
         */
        private LocalDate date;
        
        /**
         * 可用工时
         */
        private Double availableHours;
        
        /**
         * 已分配工时
         */
        private Double allocatedHours;
        
        /**
         * 利用率百分比
         */
        private Double utilizationPercentage;
        
        /**
         * 状态：AVAILABLE(可用), PARTIAL(部分占用), FULL(满载), OVERLOAD(过载), OFF(休息)
         */
        private String status;
        
        /**
         * 任务列表
         */
        private List<TaskAllocation> tasks;
    }
    
    /**
     * 任务分配
     */
    @Data
    public static class TaskAllocation {
        /**
         * 任务ID
         */
        private Long taskId;
        
        /**
         * 任务名称
         */
        private String taskName;
        
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
        private Double hours;
        
        /**
         * 优先级
         */
        private String priority;
        
        /**
         * 开始时间
         */
        private LocalDateTime startTime;
        
        /**
         * 结束时间
         */
        private LocalDateTime endTime;
    }
}