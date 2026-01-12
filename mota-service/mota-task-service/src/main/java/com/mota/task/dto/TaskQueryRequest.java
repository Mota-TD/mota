package com.mota.task.dto;

import com.mota.common.core.base.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;

/**
 * 任务查询请求DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TaskQueryRequest extends PageQuery {

    /**
     * 项目ID
     */
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
     * 任务类型列表
     */
    private List<String> taskTypes;

    /**
     * 状态列表
     */
    private List<String> statuses;

    /**
     * 优先级列表
     */
    private List<String> priorities;

    /**
     * 负责人ID列表
     */
    private List<Long> assigneeIds;

    /**
     * 报告人ID
     */
    private Long reporterId;

    /**
     * Sprint ID
     */
    private Long sprintId;

    /**
     * 关键词搜索
     */
    private String keyword;

    /**
     * 标签
     */
    private List<String> tags;

    /**
     * 开始日期范围-起始
     */
    private LocalDate startDateFrom;

    /**
     * 开始日期范围-结束
     */
    private LocalDate startDateTo;

    /**
     * 截止日期范围-起始
     */
    private LocalDate dueDateFrom;

    /**
     * 截止日期范围-结束
     */
    private LocalDate dueDateTo;

    /**
     * 是否已逾期
     */
    private Boolean overdue;

    /**
     * 是否包含子任务
     */
    private Boolean includeSubtasks;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序方向：asc/desc
     */
    private String sortOrder;
}