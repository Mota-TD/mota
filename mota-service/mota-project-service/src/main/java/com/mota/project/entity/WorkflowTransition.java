package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 工作流流转规则实体
 */
@Data
@TableName("workflow_transition")
public class WorkflowTransition implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 所属工作流ID
     */
    private Long workflowId;

    /**
     * 源状态ID
     */
    private Long fromStatusId;

    /**
     * 目标状态ID
     */
    private Long toStatusId;

    /**
     * 流转名称
     */
    private String name;

    /**
     * 流转描述
     */
    private String description;

    /**
     * 流转条件（JSON格式）
     */
    private String conditions;

    /**
     * 流转时执行的动作（JSON格式）
     */
    private String actions;

    /**
     * 允许执行此流转的角色（JSON数组）
     */
    private String allowedRoles;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 源状态（非数据库字段）
     */
    @TableField(exist = false)
    private WorkflowStatus fromStatus;

    /**
     * 目标状态（非数据库字段）
     */
    @TableField(exist = false)
    private WorkflowStatus toStatus;
}