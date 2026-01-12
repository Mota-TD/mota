package com.mota.task.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务视图对象
 */
@Data
public class TaskVO {

    /**
     * 任务ID
     */
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 里程碑ID
     */
    private Long milestoneId;

    /**
     * 里程碑名称
     */
    private String milestoneName;

    /**
     * 父任务ID
     */
    private Long parentId;

    /**
     * 父任务标题
     */
    private String parentTitle;

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
     * 任务类型
     */
    private String taskType;

    /**
     * 状态
     */
    private String status;

    /**
     * 状态名称
     */
    private String statusName;

    /**
     * 优先级
     */
    private String priority;

    /**
     * 负责人ID
     */
    private Long assigneeId;

    /**
     * 负责人名称
     */
    private String assigneeName;

    /**
     * 负责人头像
     */
    private String assigneeAvatar;

    /**
     * 报告人ID
     */
    private Long reporterId;

    /**
     * 报告人名称
     */
    private String reporterName;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 截止日期
     */
    private LocalDate dueDate;

    /**
     * 完成日期
     */
    private LocalDate completedDate;

    /**
     * 预估工时
     */
    private BigDecimal estimatedHours;

    /**
     * 实际工时
     */
    private BigDecimal actualHours;

    /**
     * 完成百分比
     */
    private Integer progress;

    /**
     * 故事点数
     */
    private Integer storyPoints;

    /**
     * Sprint ID
     */
    private Long sprintId;

    /**
     * Sprint名称
     */
    private String sprintName;

    /**
     * 标签列表
     */
    private List<String> tags;

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
     * 是否已逾期
     */
    private Boolean overdue;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 创建人ID
     */
    private Long createBy;

    /**
     * 创建人名称
     */
    private String createByName;
}