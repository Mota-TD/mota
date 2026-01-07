package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 混合搜索请求DTO
 */
@Data
public class HybridSearchDTO implements Serializable {
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
     * 过滤条件
     */
    private Map<String, Object> filters;
    
    /**
     * 返回数量
     */
    private Integer limit;
    
    /**
     * 语义搜索权重
     */
    private Double semanticWeight;
    
    /**
     * 关键词搜索权重
     */
    private Double keywordWeight;
}