package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 知识图谱边（关系）实体
 */
@Data
@TableName("knowledge_edge")
public class KnowledgeEdge {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 源节点ID
     */
    private Long sourceNodeId;

    /**
     * 目标节点ID
     */
    private Long targetNodeId;

    /**
     * 关系类型: related_to, belongs_to, depends_on, references, similar_to
     */
    private String relationType;

    /**
     * 关系权重
     */
    private BigDecimal weight;

    /**
     * 关系属性（JSON格式）
     */
    private String properties;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    // ========== 非数据库字段 ==========

    /**
     * 源节点
     */
    @TableField(exist = false)
    private KnowledgeNode sourceNode;

    /**
     * 目标节点
     */
    @TableField(exist = false)
    private KnowledgeNode targetNode;
}