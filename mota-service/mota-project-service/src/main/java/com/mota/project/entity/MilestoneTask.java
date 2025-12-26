package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 里程碑任务实体（里程碑拆解的子任务）
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("milestone_task")
public class MilestoneTask extends BaseEntityDO {

    /**
     * 所属里程碑ID
     */
    private Long milestoneId;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 父任务ID（用于子任务层级）
     */
    private Long parentTaskId;

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
     * 分配人ID
     */
    private Long assignedBy;

    /**
     * 状态(pending/in_progress/completed/cancelled)
     */
    private String status;

    /**
     * 优先级(low/medium/high/urgent)
     */
    private String priority;

    /**
     * 完成进度(0-100)
     */
    private Integer progress;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 截止日期
     */
    private LocalDate dueDate;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 执行人名称（非数据库字段）
     */
    @TableField(exist = false)
    private String assigneeName;

    /**
     * 执行人头像（非数据库字段）
     */
    @TableField(exist = false)
    private String assigneeAvatar;

    /**
     * 里程碑名称（非数据库字段）
     */
    @TableField(exist = false)
    private String milestoneName;

    /**
     * 子任务列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<MilestoneTask> subTasks;

    /**
     * 附件列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<MilestoneTaskAttachment> attachments;

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