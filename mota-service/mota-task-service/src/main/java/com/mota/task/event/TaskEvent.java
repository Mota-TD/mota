package com.mota.task.event;

import com.mota.common.kafka.event.BaseEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 任务事件
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TaskEvent extends BaseEvent {

    /**
     * 任务ID
     */
    private Long taskId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 任务编号
     */
    private String taskNo;

    /**
     * 任务标题
     */
    private String title;

    /**
     * 任务状态
     */
    private String status;

    /**
     * 负责人ID
     */
    private Long assigneeId;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 旧状态（状态变更时）
     */
    private String oldStatus;

    /**
     * 新状态（状态变更时）
     */
    private String newStatus;
}