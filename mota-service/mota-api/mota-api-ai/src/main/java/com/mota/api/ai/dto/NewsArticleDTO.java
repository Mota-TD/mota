package com.mota.api.ai.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 新闻文章DTO
 */
@Data
public class NewsArticleDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    /**
     * 新闻ID
     */
    private Long id;
    
    /**
     * 标题
     */
    private String title;
    
    /**
     * 摘要
     */
    private String summary;
    
    /**
     * 内容
     */
    private String content;
    
    /**
     * 来源
     */
    private String source;
    
    /**
     * 来源URL
     */
    private String sourceUrl;
    
    /**
     * 封面图片
     */
    private String coverImage;
    
    /**
     * 分类
     */
    private String category;
    
    /**
     * 标签
     */
    private List<String> tags;
    
    /**
     * 发布时间
     */
    private LocalDateTime publishedAt;
    
    /**
     * 相关度分数
     */
    private Double relevanceScore;
}