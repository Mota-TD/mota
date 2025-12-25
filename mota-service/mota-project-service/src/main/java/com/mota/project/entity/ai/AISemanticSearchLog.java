package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 语义检索日志实体
 * 对应功能: AI-010 语义检索
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_semantic_search_log")
public class AISemanticSearchLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 查询文本
     */
    private String queryText;

    /**
     * 查询向量
     */
    private byte[] queryVector;

    /**
     * 检索类型(semantic/keyword/hybrid)
     */
    private String searchType;

    /**
     * 返回结果数
     */
    private Integer topK;

    /**
     * 相似度阈值
     */
    private BigDecimal similarityThreshold;

    /**
     * 实际返回结果数
     */
    private Integer resultCount;

    /**
     * 返回的文档ID列表 JSON
     */
    private String resultIds;

    /**
     * 返回的相似度分数列表 JSON
     */
    private String resultScores;

    /**
     * 检索耗时(毫秒)
     */
    private Integer searchTime;

    /**
     * 过滤条件 JSON
     */
    private String filters;

    /**
     * 团队ID
     */
    private Long teamId;

    /**
     * 用户ID
     */
    private Long userId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    // 检索类型常量
    public static final String TYPE_SEMANTIC = "semantic";
    public static final String TYPE_KEYWORD = "keyword";
    public static final String TYPE_HYBRID = "hybrid";

    public static final int DEFAULT_TOP_K = 10;
    public static final BigDecimal DEFAULT_THRESHOLD = new BigDecimal("0.7");
}