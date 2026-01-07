package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 新闻数据源实体 (NW-003 新闻采集)
 */
@Data
@TableName("news_data_source")
public class NewsDataSource {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 数据源名称
     */
    private String sourceName;
    
    /**
     * 数据源类型(rss/api/crawler/manual)
     */
    private String sourceType;
    
    /**
     * 数据源URL
     */
    private String sourceUrl;
    
    /**
     * API端点
     */
    private String apiEndpoint;
    
    /**
     * 加密的API密钥
     */
    private String apiKeyEncrypted;
    
    /**
     * 爬虫配置(JSON)
     */
    private String crawlConfig;
    
    /**
     * 新闻分类
     */
    private String category;
    
    /**
     * 语言
     */
    private String language;
    
    /**
     * 国家/地区
     */
    private String country;
    
    /**
     * 更新频率(分钟)
     */
    private Integer updateFrequency;
    
    /**
     * 上次采集时间
     */
    private LocalDateTime lastCrawlAt;
    
    /**
     * 下次采集时间
     */
    private LocalDateTime nextCrawlAt;
    
    /**
     * 是否启用
     */
    private Boolean isEnabled;
    
    /**
     * 优先级(1-10)
     */
    private Integer priority;
    
    /**
     * 可靠性评分
     */
    private BigDecimal reliabilityScore;
    
    /**
     * 总文章数
     */
    private Integer totalArticles;
    
    /**
     * 上次采集状态(success/failed)
     */
    private String lastCrawlStatus;
    
    /**
     * 上次错误信息
     */
    private String lastErrorMessage;
    
    /**
     * 创建者ID
     */
    private Long creatorId;
    
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