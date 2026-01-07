package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 语义搜索请求DTO
 */
@Data
public class SemanticSearchDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 搜索查询
     */
    private String query;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 企业ID
     */
    private Long enterpriseId;
    
    /**
     * 搜索范围
     */
    private List<String> scopes;
    
    /**
     * 返回数量
     */
    private Integer limit;
    
    /**
     * 最小相似度
     */
    private Double minSimilarity;
}