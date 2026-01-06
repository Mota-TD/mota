package com.mota.project.dto.report;

import lombok.Data;
import java.util.List;

/**
 * 逾期率统计数据
 */
@Data
public class OverdueRateData {
    private Long teamId;
    private String teamName;
    private String period;
    
    // 总体统计
    private Integer totalTasks;
    private Integer overdueTasks;
    private Double overdueRate;
    private Double avgOverdueDays;
    
    // 严重程度分布
    private Integer slightlyOverdue; // 1-3天
    private Integer moderatelyOverdue; // 3-7天
    private Integer severelyOverdue; // >7天
    
    // 逾期任务列表
    private List<OverdueTask> overdueTasks_list;
    
    // 原因分析
    private List<OverdueReason> reasons;
    
    // 趋势
    private List<OverdueTrend> trends;
    
    // 按成员
    private List<OverdueByMember> byMember;
    
    // 与上期对比
    private Double overdueRateChange;
    
    @Data
    public static class OverdueTask {
        private Long taskId;
        private String taskName;
        private Long projectId;
        private String projectName;
        private Long assigneeId;
        private String assigneeName;
        private String assigneeAvatar;
        private String dueDate;
        private Integer overdueDays;
        private String priority;
        private String status;
    }
    
    @Data
    public static class OverdueReason {
        private String reason;
        private Integer count;
        private Double percentage;
    }
    
    @Data
    public static class OverdueTrend {
        private String period;
        private Integer totalTasks;
        private Integer overdueTasks;
        private Double overdueRate;
    }
    
    @Data
    public static class OverdueByMember {
        private Long userId;
        private String userName;
        private String avatar;
        private Integer totalTasks;
        private Integer overdueTasks;
        private Double overdueRate;
    }
}