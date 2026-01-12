package com.mota.task.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 任务更新请求DTO
 */
@Data
public class TaskUpdateRequest {

    /**
     * 任务ID
     */
    @NotNull(message = "任务ID不能为空")
    private Long id;

    /**
     * 里程碑ID
     */
    private Long milestoneId;

    /**
     * 父任务ID
     */
    private Long parentId;

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
     * 优先级
     */
    private String priority;

    /**
     * 负责人ID
     */
    private Long assigneeId;

    /**
     * 报告人ID
     */
    private Long reporterId;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 截止日期
     */
    private LocalDate dueDate;

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
     * 标签列表
     */
    private List<String> tags;

    /**
     * 自定义字段
     */
    private String customFields;
}