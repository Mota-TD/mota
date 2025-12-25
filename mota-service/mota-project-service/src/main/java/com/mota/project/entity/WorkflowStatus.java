package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 工作流状态实体
 */
@Data
@TableName("workflow_status")
public class WorkflowStatus implements Serializable {

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
     * 状态名称
     */
    private String name;

    /**
     * 状态描述
     */
    private String description;

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
     * 是否为终态
     */
    private Boolean isFinal;

    /**
     * 状态类型：todo, in_progress, done, cancelled
     */
    private String statusType;

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
     * 状态类型枚举
     */
    public static class StatusType {
        public static final String TODO = "todo";
        public static final String IN_PROGRESS = "in_progress";
        public static final String DONE = "done";
        public static final String CANCELLED = "cancelled";
    }
}