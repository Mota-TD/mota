package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识图谱关系（边）
 */
@Data
@TableName("knowledge_relation")
public class KnowledgeRelation {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 源实体ID
     */
    private Long sourceEntityId;

    /**
     * 目标实体ID
     */
    private Long targetEntityId;

    /**
     * 关系类型：belongs_to/related_to/depends_on/created_by/part_of/uses/implements
     */
    private String relationType;

    /**
     * 关系名称（自定义）
     */
    private String relationName;

    /**
     * 关系描述
     */
    private String description;

    /**
     * 关系属性（JSON格式）
     */
    private String properties;

    /**
     * 关系权重（0-1）
     */
    private Double weight;

    /**
     * 置信度（0-1）
     */
    private Double confidence;

    /**
     * 来源文件ID
     */
    private Long sourceFileId;

    /**
     * 是否已验证
     */
    private Boolean isVerified;

    /**
     * 是否双向关系
     */
    private Boolean isBidirectional;

    /**
     * 创建人
     */
    private Long createdBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 是否删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 源实体名称（非数据库字段）
     */
    @TableField(exist = false)
    private String sourceEntityName;

    /**
     * 目标实体名称（非数据库字段）
     */
    @TableField(exist = false)
    private String targetEntityName;
}