package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI文档向量实体
 */
@Data
@TableName("ai_document_vector")
public class AIDocumentVector {

    @TableId(type = IdType.AUTO)
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
     * 文本内容
     */
    private String content;

    /**
     * 向量数据（JSON格式）
     */
    private String vector;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}