package com.mota.search.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 搜索请求DTO
 * 
 * @author mota
 */
@Data
public class SearchRequest {

    /**
     * 搜索关键词
     */
    private String keyword;

    /**
     * 搜索模式：fulltext-全文搜索, semantic-语义搜索, vector-向量搜索, hybrid-混合搜索
     */
    private String mode = "fulltext";

    /**
     * 文档类型过滤：project, task, document, knowledge, user, news
     */
    private List<String> types;

    /**
     * 标签过滤
     */
    private List<String> tags;

    /**
     * 创建者ID过滤
     */
    private Long creatorId;

    /**
     * 时间范围-开始时间（ISO 8601格式）
     */
    private String startTime;

    /**
     * 时间范围-结束时间（ISO 8601格式）
     */
    private String endTime;

    /**
     * 排序字段：_score-相关度, createTime-创建时间, updateTime-更新时间
     */
    private String sortBy = "_score";

    /**
     * 排序方向：asc-升序, desc-降序
     */
    private String sortOrder = "desc";

    /**
     * 页码（从1开始）
     */
    private Integer page = 1;

    /**
     * 每页大小
     */
    private Integer size = 20;

    /**
     * 是否高亮显示
     */
    private Boolean highlight = true;

    /**
     * 高亮前缀标签
     */
    private String highlightPreTag = "<em>";

    /**
     * 高亮后缀标签
     */
    private String highlightPostTag = "</em>";

    /**
     * 最小匹配度（0-1之间，用于向量搜索）
     */
    private Float minScore;

    /**
     * 是否启用同义词扩展
     */
    private Boolean enableSynonym = true;

    /**
     * 是否记录搜索历史
     */
    private Boolean recordHistory = true;

    /**
     * 额外过滤条件
     */
    private Map<String, Object> filters;

    /**
     * 聚合字段（用于分面搜索）
     */
    private List<String> aggregations;

    /**
     * 向量搜索时的查询向量（可选，如果不提供则自动生成）
     */
    private List<Float> queryVector;
}