package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 工作流模板实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("workflow_template")
public class WorkflowTemplate extends BaseEntityDO {

    /**
     * 工作流名称
     */
    private String name;

    /**
     * 工作流描述
     */
    private String description;

    /**
     * 所属项目ID（NULL表示全局模板）
     */
    private Long projectId;

    /**
     * 是否为默认工作流
     */
    private Boolean isDefault;

    /**
     * 是否为系统预设工作流
     */
    private Boolean isSystem;

    /**
     * 工作流状态列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<WorkflowStatus> statuses;

    /**
     * 工作流流转规则列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<WorkflowTransition> transitions;
}