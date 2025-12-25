package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 自动标签实体
 * 对应功能: AI-008 自动标签
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_tag")
public class AITag implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 标签名称
     */
    private String name;

    /**
     * 标签类型(keyword/entity/topic/custom)
     */
    private String type;

    /**
     * 标签颜色
     */
    private String color;

    /**
     * 标签描述
     */
    private String description;

    /**
     * 使用次数
     */
    private Integer usageCount;

    /**
     * 是否系统标签
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

    // 标签类型常量
    public static final String TYPE_KEYWORD = "keyword";
    public static final String TYPE_ENTITY = "entity";
    public static final String TYPE_TOPIC = "topic";
    public static final String TYPE_CUSTOM = "custom";
}