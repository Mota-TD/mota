package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 新闻匹配记录实体 (NW-005 智能匹配)
 */
@Data
@TableName("news_match_record")
public class NewsMatchRecord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 文章ID
     */
    private Long articleId;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 匹配类型(industry/keyword/semantic/policy)
     */
    private String matchType;
    
    /**
     * 匹配分数(0-100)
     */
    private BigDecimal matchScore;
    
    /**
     * 匹配的关键词(JSON)
     */
    private String matchedKeywords;
    
    /**
     * 匹配的行业(JSON)
     */
    private String matchedIndustries;
    
    /**
     * 匹配的业务领域(JSON)
     */
    private String matchedDomains;
    
    /**
     * 语义相似度
     */
    private BigDecimal semanticSimilarity;
    
    /**
     * 相关性原因
     */
    private String relevanceReason;
    
    /**
     * 是否推荐
     */
    private Boolean isRecommended;
    
    /**
     * 推荐排名
     */
    private Integer recommendationRank;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}