package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 里程碑任务进度更新记录实体
 */
@Data
@TableName("milestone_task_progress_record")
public class MilestoneTaskProgressRecord {

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    /**
     * 任务ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long taskId;

    /**
     * 更新前进度
     */
    private Integer previousProgress;

    /**
     * 更新后进度
     */
    private Integer currentProgress;

    /**
     * 进度描述（富文本）
     */
    private String description;

    /**
     * 附件列表（JSON格式存储）
     */
    private String attachments;

    /**
     * 更新人ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long updatedBy;

    /**
     * 更新人姓名
     */
    private String updatedByName;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Boolean deleted;

    /**
     * 版本号
     */
    @Version
    private Integer version;
}