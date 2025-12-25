package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 文档摘要实体
 * 对应功能: AI-006 自动摘要
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_document_summary")
public class AIDocumentSummary implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联文档ID
     */
    private Long documentId;

    /**
     * 摘要类型(extractive/abstractive/hybrid)
     */
    private String summaryType;

    /**
     * 摘要长度(short/medium/long)
     */
    private String summaryLength;

    /**
     * 摘要文本
     */
    private String summaryText;

    /**
     * 关键要点列表 JSON
     */
    private String keyPoints;

    /**
     * 关键词列表 JSON
     */
    private String keywords;

    /**
     * 摘要字数
     */
    private Integer wordCount;

    /**
     * 压缩比例
     */
    private BigDecimal compressionRatio;

    /**
     * 使用的模型
     */
    private String modelUsed;

    /**
     * 生成状态
     */
    private String generationStatus;

    /**
     * 生成错误信息
     */
    private String generationError;

    /**
     * 创建者ID
     */
    private Long creatorId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 摘要类型常量
    public static final String TYPE_EXTRACTIVE = "extractive";
    public static final String TYPE_ABSTRACTIVE = "abstractive";
    public static final String TYPE_HYBRID = "hybrid";

    // 摘要长度常量
    public static final String LENGTH_SHORT = "short";
    public static final String LENGTH_MEDIUM = "medium";
    public static final String LENGTH_LONG = "long";

    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_FAILED = "failed";
}