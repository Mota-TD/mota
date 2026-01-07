package com.mota.common.feign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * AI新闻数据传输对象
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AINewsDTO {
    
    /**
     * 新闻ID
     */
    private Long id;
    
    /**
     * 新闻标题
     */
    private String title;
    
    /**
     * 新闻摘要
     */
    private String summary;
    
    /**
     * 新闻内容
     */
    private String content;
    
    /**
     * 新闻分类
     */
    private String category;
    
    /**
     * 来源
     */
    private String source;
    
    /**
     * 来源URL
     */
    private String sourceUrl;
    
    /**
     * 封面图片URL
     */
    private String coverImage;
    
    /**
     * 阅读量
     */
    private Integer viewCount;
    
    /**
     * 点赞数
     */
    private Integer likeCount;
    
    /**
     * 发布时间
     */
    private LocalDateTime publishedAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}