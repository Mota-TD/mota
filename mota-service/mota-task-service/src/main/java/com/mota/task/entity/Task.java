package com.mota.task.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 任务实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("task")
public class Task extends BaseEntityDO {

    /**
     * 租户ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long tenantId;

    /**
     * 项目ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long projectId;

    /**
     * 里程碑ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long milestoneId;

    /**
     * 父任务ID（用于子任务）
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long parentId;

    /**
     * 任务编号
     */
    private String taskNo;

    /**
     * 任务标题
     */
    private String title;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 任务类型(task/bug/story/epic/feature)
     */
    private String taskType;

    /**
     * 任务状态
     */
    private String status;

    /**
     * 工作流状态ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long workflowStatusId;

    /**
     * 优先级(low/medium/high/urgent)
     */
    private String priority;

    /**
     * 负责人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long assigneeId;

    /**
     * 报告人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long reporterId;

    /**
     * 开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    /**
     * 截止日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    /**
     * 完成日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate completedDate;

    /**
     * 预估工时（小时）
     */
    private BigDecimal estimatedHours;

    /**
     * 实际工时（小时）
     */
    private BigDecimal actualHours;

    /**
     * 剩余工时（小时）
     */
    private BigDecimal remainingHours;

    /**
     * 进度百分比(0-100)
     */
    private Integer progress;

    /**
     * 故事点数（敏捷开发）
     */
    private Integer storyPoints;

    /**
     * 任务标签（JSON数组）
     */
    private String tags;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 层级深度（用于子任务）
     */
    private Integer level;

    /**
     * 子任务数量
     */
    private Integer subtaskCount;

    /**
     * 已完成子任务数量
     */
    private Integer completedSubtaskCount;

    /**
     * 评论数量
     */
    private Integer commentCount;

    /**
     * 附件数量
     */
    private Integer attachmentCount;

    /**
     * 检查项数量
     */
    private Integer checklistCount;

    /**
     * 已完成检查项数量
     */
    private Integer completedChecklistCount;

    /**
     * Sprint ID（敏捷开发）
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long sprintId;

    /**
     * 版本ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long versionId;

    /**
     * 自定义字段（JSON格式）
     */
    private String customFields;

    /**
     * 任务类型枚举
     */
    public static class TaskType {
        public static final String TASK = "task";
        public static final String BUG = "bug";
        public static final String STORY = "story";
        public static final String EPIC = "epic";
        public static final String FEATURE = "feature";
        public static final String SUBTASK = "subtask";
    }

    /**
     * 任务状态枚举
     */
    public static class Status {
        public static final String TODO = "todo";
        public static final String IN_PROGRESS = "in_progress";
        public static final String IN_REVIEW = "in_review";
        public static final String TESTING = "testing";
        public static final String DONE = "done";
        public static final String CLOSED = "closed";
        public static final String BLOCKED = "blocked";
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