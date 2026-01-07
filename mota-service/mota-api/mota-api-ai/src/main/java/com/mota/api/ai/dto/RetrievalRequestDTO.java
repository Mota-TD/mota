package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 知识检索请求DTO
 */
@Data
public class RetrievalRequestDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 查询内容
     */
    private String query;
    
    /**
     * 企业ID
     */
    private Long enterpriseId;
    
    /**
     * 文档类型过滤
     */
    private List<String> documentTypes;
    
    /**
     * 返回数量
     */
    private Integer topK;
    
    /**
     * 最小相似度阈值
     */
    private Double minScore;
}