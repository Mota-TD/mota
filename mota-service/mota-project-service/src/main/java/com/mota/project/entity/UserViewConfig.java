package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 用户视图配置实体
 */
@Data
@TableName(value = "user_view_config", autoResultMap = true)
public class UserViewConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 视图类型: project, task, calendar, kanban, gantt
     */
    private String viewType;

    /**
     * 视图名称
     */
    private String name;

    /**
     * 视图描述
     */
    private String description;

    /**
     * 视图配置（JSON格式）
     * 包含：筛选条件、排序、列配置等
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> config;

    /**
     * 是否为默认视图
     */
    private Boolean isDefault;

    /**
     * 是否共享给团队
     */
    private Boolean isShared;

    /**
     * 关联项目ID
     */
    private Long projectId;

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
     * 视图类型枚举
     */
    public static class ViewType {
        public static final String PROJECT = "project";
        public static final String TASK = "task";
        public static final String CALENDAR = "calendar";
        public static final String KANBAN = "kanban";
        public static final String GANTT = "gantt";
    }
}