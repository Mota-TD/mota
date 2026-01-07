package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 知识检索结果DTO
 */
@Data
public class RetrievalResultDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 文档ID
     */
    private Long documentId;
    
    /**
     * 文档标题
     */
    private String title;
    
    /**
     * 匹配内容
     */
    private String content;
    
    /**
     * 相似度分数
     */
    private Double score;
    
    /**
     * 文档类型
     */
    private String documentType;
    
    /**
     * 分块索引
     */
    private Integer chunkIndex;
}