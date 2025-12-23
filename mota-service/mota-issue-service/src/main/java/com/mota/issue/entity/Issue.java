package com.mota.issue.entity;

import com.baomidou.mybatisplus.annotation.TableName;
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
@TableName("issue")
public class Issue extends BaseEntityDO {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 任务标识
     */
    private String issueKey;

    /**
     * 任务类型
     */
    private String type;

    /**
     * 标题
     */
    private String title;

    /**
     * 描述
     */
    private String description;

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
     * 父任务ID
     */
    private Long parentId;

    /**
     * 迭代ID
     */
    private Long sprintId;

    /**
     * 故事点数
     */
    private Integer storyPoints;

    /**
     * 预估工时
     */
    private BigDecimal estimatedHours;

    /**
     * 实际工时
     */
    private BigDecimal actualHours;

    /**
     * 截止日期
     */
    private LocalDate dueDate;

    /**
     * 解决时间
     */
    private LocalDateTime resolvedAt;
}