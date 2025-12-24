package com.mota.project.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 项目详情响应DTO
 */
@Data
public class ProjectDetailResponse {

    /**
     * 项目ID
     */
    private Long id;

    /**
     * 组织ID
     */
    private String orgId;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目标识
     */
    private String key;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 状态
     */
    private String status;

    /**
     * 负责人ID
     */
    private Long ownerId;

    /**
     * 负责人名称
     */
    private String ownerName;

    /**
     * 负责人头像
     */
    private String ownerAvatar;

    /**
     * 颜色
     */
    private String color;

    /**
     * 是否收藏
     */
    private Integer starred;

    /**
     * 进度
     */
    private Integer progress;

    /**
     * 成员数量
     */
    private Integer memberCount;

    /**
     * 任务数量
     */
    private Integer issueCount;

    /**
     * 项目开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    /**
     * 项目结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    /**
     * 优先级
     */
    private String priority;

    /**
     * 可见性
     */
    private String visibility;

    /**
     * 归档时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime archivedAt;

    /**
     * 归档人ID
     */
    private Long archivedBy;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 项目成员列表
     */
    private List<ProjectMemberInfo> members;

    /**
     * 里程碑列表
     */
    private List<MilestoneInfo> milestones;

    /**
     * 参与部门列表
     */
    private List<DepartmentInfo> departments;

    /**
     * 统计信息
     */
    private ProjectStatistics statistics;

    /**
     * 项目成员信息
     */
    @Data
    public static class ProjectMemberInfo {
        private Long id;
        private Long userId;
        private String userName;
        private String userAvatar;
        private String role;
        private Long departmentId;
        private String departmentName;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime joinedAt;
    }

    /**
     * 里程碑信息
     */
    @Data
    public static class MilestoneInfo {
        private Long id;
        private String name;
        private String description;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate targetDate;
        private String status;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime completedAt;
        private Integer sortOrder;
    }

    /**
     * 部门信息
     */
    @Data
    public static class DepartmentInfo {
        private Long id;
        private String name;
        private Long managerId;
        private String managerName;
        private Integer memberCount;
    }

    /**
     * 项目统计信息
     */
    @Data
    public static class ProjectStatistics {
        /**
         * 总任务数
         */
        private Integer totalTasks;

        /**
         * 已完成任务数
         */
        private Integer completedTasks;

        /**
         * 进行中任务数
         */
        private Integer inProgressTasks;

        /**
         * 待开始任务数
         */
        private Integer pendingTasks;

        /**
         * 已逾期任务数
         */
        private Integer overdueTasks;

        /**
         * 部门任务数
         */
        private Integer departmentTaskCount;

        /**
         * 已完成里程碑数
         */
        private Integer completedMilestones;

        /**
         * 总里程碑数
         */
        private Integer totalMilestones;

        /**
         * 完成率
         */
        private Double completionRate;
    }
}