package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户阅读记录实体
 */
@Data
@TableName("news_reading_record")
public class NewsReadingRecord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 文章ID
     */
    private Long articleId;
    
    /**
     * 阅读时长(秒)
     */
    private Integer readDuration;
    
    /**
     * 阅读进度(0-100)
     */
    private BigDecimal readProgress;
    
    /**
     * 是否读完
     */
    private Boolean isFinished;
    
    /**
     * 来源(push/search/recommend/browse)
     */
    private String source;
    
    /**
     * 设备类型
     */
    private String device;
    
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