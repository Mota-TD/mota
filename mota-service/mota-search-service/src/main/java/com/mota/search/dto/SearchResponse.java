package com.mota.search.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 搜索响应DTO
 * 
 * @author mota
 */
@Data
public class SearchResponse {

    /**
     * 搜索结果列表
     */
    private List<SearchHit> hits;

    /**
     * 总命中数
     */
    private Long total;

    /**
     * 当前页码
     */
    private Integer page;

    /**
     * 每页大小
     */
    private Integer size;

    /**
     * 总页数
     */
    private Integer totalPages;

    /**
     * 搜索耗时（毫秒）
     */
    private Long took;

    /**
     * 聚合结果
     */
    private Map<String, List<AggregationBucket>> aggregations;

    /**
     * 搜索建议（拼写纠正等）
     */
    private List<String> suggestions;

    /**
     * 是否有更多结果
     */
    private Boolean hasMore;

    /**
     * 搜索结果项
     */
    @Data
    public static class SearchHit {
        /**
         * 文档ID
         */
        private String id;

        /**
         * 文档类型
         */
        private String type;

        /**
         * 业务ID
         */
        private Long businessId;

        /**
         * 标题
         */
        private String title;

        /**
         * 内容摘要
         */
        private String summary;

        /**
         * 高亮标题
         */
        private String highlightTitle;

        /**
         * 高亮内容
         */
        private String highlightContent;

        /**
         * 相关度分数
         */
        private Float score;

        /**
         * 标签
         */
        private List<String> tags;

        /**
         * 创建者ID
         */
        private Long creatorId;

        /**
         * 创建者名称
         */
        private String creatorName;

        /**
         * 创建时间
         */
        private String createTime;

        /**
         * 更新时间
         */
        private String updateTime;

        /**
         * 额外元数据
         */
        private Map<String, Object> metadata;
    }

    /**
     * 聚合桶
     */
    @Data
    public static class AggregationBucket {
        /**
         * 键值
         */
        private String key;

        /**
         * 文档数量
         */
        private Long docCount;
    }
}