package com.mota.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 检查项实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("checklist_item")
public class ChecklistItem extends BaseEntityDO {

    /**
     * 租户ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long tenantId;

    /**
     * 检查清单ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long checklistId;

    /**
     * 任务ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long taskId;

    /**
     * 检查项内容
     */
    private String content;

    /**
     * 是否已完成
     */
    private Boolean completed;

    /**
     * 完成时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;

    /**
     * 完成人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long completedBy;

    /**
     * 负责人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long assigneeId;

    /**
     * 截止日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    /**
     * 排序顺序
     */
    private Integer sortOrder;
}