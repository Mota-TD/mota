package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 部门任务实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("department_task")
public class DepartmentTask extends BaseEntityDO {

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 关联里程碑ID（可选）
     */
    private Long milestoneId;

    /**
     * 负责部门ID
     */
    private Long departmentId;

    /**
     * 部门负责人ID
     */
    private Long managerId;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 任务状态(pending/plan_submitted/plan_approved/in_progress/completed/cancelled)
     */
    private String status;

    /**
     * 优先级(low/medium/high/urgent)
     */
    private String priority;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 截止日期
     */
    private LocalDate endDate;

    /**
     * 任务进度(0-100)
     */
    private Integer progress;

    /**
     * 是否需要提交工作计划(0-否,1-是)
     */
    private Integer requirePlan;

    /**
     * 工作计划是否需要审批(0-否,1-是)
     */
    private Integer requireApproval;

    /**
     * 关联的日历事件ID
     */
    private Long calendarEventId;

    /**
     * 部门任务状态枚举
     */
    public static class Status {
        public static final String PENDING = "pending";
        public static final String PLAN_SUBMITTED = "plan_submitted";
        public static final String PLAN_APPROVED = "plan_approved";
        public static final String IN_PROGRESS = "in_progress";
        public static final String COMPLETED = "completed";
        public static final String CANCELLED = "cancelled";
    }

    /**
     * 优先级枚举
     */
    public static class Priority {
        public static final String LOW = "low";
        public static final String MEDIUM = "medium";
        public static final String HIGH = "high";
        public static final String URGENT = "urgent";
    }
}