package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 知识图谱节点实体
 */
@Data
@TableName("knowledge_node")
public class KnowledgeNode {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 节点名称
     */
    private String name;

    /**
     * 节点类型: concept, entity, document, task, project
     */
    private String nodeType;

    /**
     * 节点描述
     */
    private String description;

    /**
     * 关联对象ID
     */
    private Long relatedId;

    /**
     * 关联对象类型
     */
    private String relatedType;

    /**
     * 节点属性（JSON格式）
     */
    private String properties;

    /**
     * 向量嵌入（JSON数组，用于语义搜索）
     */
    private String embeddingVector;

    /**
     * 引用次数
     */
    private Integer referenceCount;

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

    // ========== 非数据库字段 ==========

    /**
     * 出边列表（该节点指向的关系）
     */
    @TableField(exist = false)
    private List<KnowledgeEdge> outEdges;

    /**
     * 入边列表（指向该节点的关系）
     */
    @TableField(exist = false)
    private List<KnowledgeEdge> inEdges;

    /**
     * 相关节点列表
     */
    @TableField(exist = false)
    private List<KnowledgeNode> relatedNodes;
}