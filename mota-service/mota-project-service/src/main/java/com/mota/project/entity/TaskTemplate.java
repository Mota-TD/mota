package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务模板实体
 */
@Data
@TableName("task_template")
public class TaskTemplate {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 模板名称
     */
    private String name;

    /**
     * 模板描述
     */
    private String description;

    /**
     * 模板分类
     */
    private String category;

    /**
     * 模板数据（JSON格式，包含任务结构、子任务、检查清单等）
     */
    private String templateData;

    /**
     * 使用次数
     */
    private Integer useCount;

    /**
     * 是否公开
     */
    private Boolean isPublic;

    /**
     * 创建者ID
     */
    private Long creatorId;

    /**
     * 所属项目ID（项目级模板）
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
}