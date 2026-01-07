package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

/**
 * 搜索结果DTO
 */
@Data
public class SearchResultDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 搜索结果列表
     */
    private List<SearchItemDTO> items;
    
    /**
     * 总数
     */
    private Long total;
    
    /**
     * 搜索耗时(毫秒)
     */
    private Long took;
    
    /**
     * 相关搜索建议
     */
    private List<String> suggestions;
    
    @Data
    public static class SearchItemDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        
        /**
         * 文档ID
         */
        private Long id;
        
        /**
         * 文档类型
         */
        private String type;
        
        /**
         * 标题
         */
        private String title;
        
        /**
         * 内容摘要
         */
        private String snippet;
        
        /**
         * 相似度分数
         */
        private Double score;
        
        /**
         * 高亮内容
         */
        private String highlight;
    }
}