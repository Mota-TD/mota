package com.mota.task.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工作流状态实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("workflow_status")
public class WorkflowStatus extends BaseEntityDO {

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
     * 工作流模板ID
     */
    @JsonSerialize(using = ToStringSerializer.class)
    private Long workflowTemplateId;

    /**
     * 状态名称
     */
    private String name;

    /**
     * 状态编码
     */
    private String code;

    /**
     * 状态类型(todo/in_progress/done)
     */
    private String statusType;

    /**
     * 状态分类（别名）
     */
    private String category;

    /**
     * 是否为默认状态
     */
    private Boolean isDefault;

    /**
     * 状态颜色
     */
    private String color;

    /**
     * 状态图标
     */
    private String icon;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 是否为初始状态
     */
    private Boolean isInitial;

    /**
     * 是否为最终状态
     */
    private Boolean isFinal;

    /**
     * 状态类型枚举
     */
    public static class StatusType {
        public static final String TODO = "todo";
        public static final String IN_PROGRESS = "in_progress";
        public static final String DONE = "done";
    }
}