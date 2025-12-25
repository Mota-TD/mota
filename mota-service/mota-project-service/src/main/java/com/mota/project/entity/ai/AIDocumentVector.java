package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 文档向量存储实体
 * 对应功能: AI-009 向量化存储
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_document_vector")
public class AIDocumentVector implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 分块索引
     */
    private Integer chunkIndex;

    /**
     * 分块文本
     */
    private String chunkText;

    /**
     * 分块起始位置
     */
    private Integer chunkStart;

    /**
     * 分块结束位置
     */
    private Integer chunkEnd;

    /**
     * Token数量
     */
    private Integer tokenCount;

    /**
     * 向量模型
     */
    private String embeddingModel;

    /**
     * 向量维度
     */
    private Integer embeddingDimension;

    /**
     * 向量数据(二进制存储)
     */
    private byte[] embedding;

    /**
     * 向量数据(JSON存储,用于调试)
     */
    private String embeddingJson;

    /**
     * 向量数据库中的ID(如Milvus/Pinecone)
     */
    private String vectorId;

    /**
     * 向量集合名称
     */
    private String collectionName;

    /**
     * 元数据 JSON
     */
    private String metadata;

    /**
     * 向量化状态(pending/processing/completed/failed)
     */
    private String vectorizeStatus;

    /**
     * 向量化错误信息
     */
    private String vectorizeError;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_PROCESSING = "processing";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_FAILED = "failed";

    public static final String DEFAULT_MODEL = "text-embedding-ada-002";
    public static final int DEFAULT_DIMENSION = 1536;
}