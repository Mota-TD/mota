package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 执行任务实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task")
public class Task extends BaseEntityDO {

    /**
     * 所属部门任务ID
     */
    private Long departmentTaskId;

    /**
     * 所属项目ID(冗余字段,便于查询)
     */
    private Long projectId;

    /**
     * 关联里程碑ID（可选，冗余字段便于查询）
     */
    private Long milestoneId;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 执行人ID
     */
    private Long assigneeId;

    /**
     * 任务状态(pending/in_progress/completed/cancelled)
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
     * 进度说明
     */
    private String progressNote;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 任务状态枚举
     */
    public static class Status {
        public static final String PENDING = "pending";
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