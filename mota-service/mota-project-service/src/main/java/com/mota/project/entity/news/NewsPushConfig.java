package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 推送配置实体 (NW-007 推送优化)
 */
@Data
@TableName("news_push_config")
public class NewsPushConfig {
    
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
     * 是否开启推送
     */
    private Boolean pushEnabled;
    
    /**
     * 推送渠道(JSON)
     */
    private String pushChannels;
    
    /**
     * 推送频率(realtime/hourly/daily/weekly)
     */
    private String pushFrequency;
    
    /**
     * 推送时间(HH:mm)
     */
    private String pushTime;
    
    /**
     * 推送日期(JSON)
     */
    private String pushDays;
    
    /**
     * 时区
     */
    private String timezone;
    
    /**
     * 每次推送最大文章数
     */
    private Integer maxArticlesPerPush;
    
    /**
     * 最低匹配分数
     */
    private BigDecimal minMatchScore;
    
    /**
     * 是否包含摘要
     */
    private Boolean includeSummary;
    
    /**
     * 是否包含图片
     */
    private Boolean includeImage;
    
    /**
     * 免打扰开始时间
     */
    private String quietHoursStart;
    
    /**
     * 免打扰结束时间
     */
    private String quietHoursEnd;
    
    /**
     * 上次推送时间
     */
    private LocalDateTime lastPushAt;
    
    /**
     * 下次推送时间
     */
    private LocalDateTime nextPushAt;
    
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