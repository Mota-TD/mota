package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 项目里程碑实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("milestone")
public class Milestone extends BaseEntityDO {

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 里程碑名称
     */
    private String name;

    /**
     * 里程碑描述
     */
    private String description;

    /**
     * 目标日期
     */
    private LocalDate targetDate;

    /**
     * 状态(pending/in_progress/completed/delayed)
     */
    private String status;

    /**
     * 完成进度(0-100)
     */
    private Integer progress;

    /**
     * 任务总数
     */
    private Integer taskCount;

    /**
     * 已完成任务数
     */
    private Integer completedTaskCount;

    /**
     * 关联部门任务数
     */
    private Integer departmentTaskCount;

    /**
     * 已完成部门任务数
     */
    private Integer completedDepartmentTaskCount;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 负责人列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<MilestoneAssignee> assignees;

    /**
     * 任务列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<MilestoneTask> tasks;

    /**
     * 关联的部门任务列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<DepartmentTask> departmentTasks;

    /**
     * 里程碑状态枚举
     */
    public static class Status {
        public static final String PENDING = "pending";
        public static final String IN_PROGRESS = "in_progress";
        public static final String COMPLETED = "completed";
        public static final String DELAYED = "delayed";
    }
}