package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 子任务实体
 * 支持多级子任务结构
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("subtask")
public class Subtask extends BaseEntityDO {

    /**
     * 父任务ID（关联到task表）
     */
    private Long parentTaskId;

    /**
     * 父子任务ID（用于多级子任务，关联到subtask表）
     */
    private Long parentSubtaskId;

    /**
     * 层级深度（0表示一级子任务，1表示二级子任务，以此类推）
     */
    private Integer level;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 子任务名称
     */
    private String name;

    /**
     * 子任务描述
     */
    private String description;

    /**
     * 执行人ID
     */
    private Long assigneeId;

    /**
     * 状态(pending/in_progress/completed/cancelled)
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
     * 进度(0-100)
     */
    private Integer progress;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 子子任务列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<Subtask> children;

    /**
     * 子任务数量（非数据库字段）
     */
    @TableField(exist = false)
    private Integer childrenCount;

    /**
     * 已完成子任务数量（非数据库字段）
     */
    @TableField(exist = false)
    private Integer completedChildrenCount;

    /**
     * 状态枚举
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