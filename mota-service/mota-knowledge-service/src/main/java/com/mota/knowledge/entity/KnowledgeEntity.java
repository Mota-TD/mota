package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识图谱实体（节点）
 */
@Data
@TableName("knowledge_entity")
public class KnowledgeEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 实体名称
     */
    private String name;

    /**
     * 实体类型：person/organization/concept/technology/product/event/location
     */
    private String entityType;

    /**
     * 实体描述
     */
    private String description;

    /**
     * 实体属性（JSON格式）
     */
    private String properties;

    /**
     * 来源文件ID
     */
    private Long sourceFileId;

    /**
     * 来源文本
     */
    private String sourceText;

    /**
     * 置信度（0-1）
     */
    private Double confidence;

    /**
     * 是否已验证
     */
    private Boolean isVerified;

    /**
     * 验证人
     */
    private Long verifiedBy;

    /**
     * 验证时间
     */
    private LocalDateTime verifiedAt;

    /**
     * 引用次数
     */
    private Integer referenceCount;

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
}