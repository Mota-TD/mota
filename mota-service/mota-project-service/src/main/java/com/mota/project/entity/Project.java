package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 项目实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("project")
public class Project extends BaseEntityDO {

    /**
     * 组织ID
     */
    @TableField(value = "org_id", insertStrategy = FieldStrategy.NOT_NULL)
    private String orgId;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目标识
     */
    @TableField("`key`")
    private String key;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 状态(planning/active/completed/suspended/cancelled/archived)
     */
    private String status;

    /**
     * 负责人ID
     */
    @TableField(value = "owner_id", insertStrategy = FieldStrategy.NOT_NULL)
    private Long ownerId;

    /**
     * 颜色
     */
    private String color;

    /**
     * 是否收藏
     */
    private Integer starred;

    /**
     * 进度
     */
    private Integer progress;

    /**
     * 成员数量
     */
    private Integer memberCount;

    /**
     * 任务数量
     */
    private Integer issueCount;

    /**
     * 项目开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    /**
     * 项目结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    /**
     * 优先级(low/medium/high/urgent)
     */
    private String priority;

    /**
     * 归档时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime archivedAt;

    /**
     * 归档人ID
     */
    private Long archivedBy;

    /**
     * 可见性(private/internal/public)
     */
    private String visibility;

    /**
     * 项目状态枚举
     */
    public static class Status {
        public static final String PLANNING = "planning";
        public static final String ACTIVE = "active";
        public static final String COMPLETED = "completed";
        public static final String SUSPENDED = "suspended";
        public static final String CANCELLED = "cancelled";
        public static final String ARCHIVED = "archived";
    }

    /**
     * 优先级枚举
     */
    public static class Priority {
        public static final String LOW = "low";
        public static final String MEDIUM = "medium";
        public static final String HIGH = "high";
        public static final String URGENT = "urgent";
    }

    /**
     * 可见性枚举
     */
    public static class Visibility {
        public static final String PRIVATE = "private";
        public static final String INTERNAL = "internal";
        public static final String PUBLIC = "public";
    }
}