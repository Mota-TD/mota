package com.mota.task.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 任务创建请求DTO
 */
@Data
public class TaskCreateRequest {

    /**
     * 项目ID
     */
    @NotNull(message = "项目ID不能为空")
    private Long projectId;

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
    @NotBlank(message = "任务标题不能为空")
    private String title;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 任务类型：task/bug/story/epic/feature/subtask
     */
    private String taskType = "task";

    /**
     * 优先级：low/medium/high/urgent
     */
    private String priority = "medium";

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
     * 预估工时（小时）
     */
    private BigDecimal estimatedHours;

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