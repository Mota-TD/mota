package com.mota.search.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 索引请求DTO
 * 
 * @author mota
 */
@Data
public class IndexRequest {

    /**
     * 文档类型：project, task, document, knowledge, user, news
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
     * 内容
     */
    private String content;

    /**
     * 摘要
     */
    private String summary;

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
     * 创建时间（ISO 8601格式）
     */
    private String createTime;

    /**
     * 更新时间（ISO 8601格式）
     */
    private String updateTime;

    /**
     * 额外元数据
     */
    private Map<String, Object> metadata;

    /**
     * 是否生成向量嵌入
     */
    private Boolean generateEmbedding = true;

    /**
     * 预计算的向量嵌入（可选）
     */
    private List<Float> embedding;
}