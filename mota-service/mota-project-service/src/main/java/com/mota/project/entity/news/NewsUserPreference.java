package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户新闻偏好实体 (NW-006 个性化推送)
 */
@Data
@TableName("news_user_preference")
public class NewsUserPreference {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 用户角色
     */
    private String role;
    
    /**
     * 偏好分类(JSON)
     */
    private String preferredCategories;
    
    /**
     * 偏好来源(JSON)
     */
    private String preferredSources;
    
    /**
     * 偏好关键词(JSON)
     */
    private String preferredKeywords;
    
    /**
     * 屏蔽关键词(JSON)
     */
    private String blockedKeywords;
    
    /**
     * 屏蔽来源(JSON)
     */
    private String blockedSources;
    
    /**
     * 感兴趣的行业(JSON)
     */
    private String interestIndustries;
    
    /**
     * 感兴趣的话题(JSON)
     */
    private String interestTopics;
    
    /**
     * 阅读深度(brief/normal/detailed)
     */
    private String readingLevel;
    
    /**
     * 内容语言偏好
     */
    private String contentLanguage;
    
    /**
     * 最低质量分数
     */
    private BigDecimal minQualityScore;
    
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