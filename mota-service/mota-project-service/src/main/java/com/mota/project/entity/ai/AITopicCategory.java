package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 主题分类实体
 * 对应功能: AI-007 主题分类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_topic_category")
public class AITopicCategory implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 分类名称
     */
    private String name;

    /**
     * 分类编码
     */
    private String code;

    /**
     * 父分类ID
     */
    private Long parentId;

    /**
     * 层级
     */
    private Integer level;

    /**
     * 分类路径
     */
    private String path;

    /**
     * 分类描述
     */
    private String description;

    /**
     * 分类关键词 JSON
     */
    private String keywords;

    /**
     * 分类图标
     */
    private String icon;

    /**
     * 分类颜色
     */
    private String color;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 是否系统分类
     */
    private Boolean isSystem;

    /**
     * 团队ID(null表示全局)
     */
    private Long teamId;

    /**
     * 创建者ID
     */
    private Long creatorId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}