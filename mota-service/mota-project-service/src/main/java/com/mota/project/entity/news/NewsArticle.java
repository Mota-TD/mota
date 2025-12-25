package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 新闻文章实体 (NW-003 新闻采集)
 */
@Data
@TableName("news_article")
public class NewsArticle {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 数据源ID
     */
    private Long sourceId;
    
    /**
     * 外部ID(用于去重)
     */
    private String externalId;
    
    /**
     * 新闻标题
     */
    private String title;
    
    /**
     * 新闻内容
     */
    private String content;
    
    /**
     * 新闻摘要
     */
    private String summary;
    
    /**
     * 作者
     */
    private String author;
    
    /**
     * 来源名称
     */
    private String sourceName;
    
    /**
     * 原文链接
     */
    private String sourceUrl;
    
    /**
     * 封面图片
     */
    private String imageUrl;
    
    /**
     * 图片列表(JSON)
     */
    private String images;
    
    /**
     * 分类
     */
    private String category;
    
    /**
     * 标签(JSON)
     */
    private String tags;
    
    /**
     * 关键词(AI提取)(JSON)
     */
    private String keywords;
    
    /**
     * 实体(AI提取)(JSON)
     */
    private String entities;
    
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    
    /**
     * 采集时间
     */
    private LocalDateTime crawlTime;
    
    /**
     * 语言
     */
    private String language;
    
    /**
     * 字数
     */
    private Integer wordCount;
    
    /**
     * 预计阅读时间(秒)
     */
    private Integer readTime;
    
    /**
     * 情感倾向(positive/negative/neutral)
     */
    private String sentiment;
    
    /**
     * 情感分数
     */
    private BigDecimal sentimentScore;
    
    /**
     * 重要性评分
     */
    private BigDecimal importanceScore;
    
    /**
     * 质量评分
     */
    private BigDecimal qualityScore;
    
    /**
     * 是否政策文件
     */
    private Boolean isPolicy;
    
    /**
     * 政策级别(national/provincial/municipal)
     */
    private String policyLevel;
    
    /**
     * 政策类型
     */
    private String policyType;
    
    /**
     * 浏览次数
     */
    private Integer viewCount;
    
    /**
     * 分享次数
     */
    private Integer shareCount;
    
    /**
     * 收藏次数
     */
    private Integer favoriteCount;
    
    /**
     * 状态(active/archived/deleted)
     */
    private String status;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}