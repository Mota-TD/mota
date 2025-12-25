package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 企业行业配置实体 (NW-001 行业识别)
 */
@Data
@TableName("news_enterprise_industry")
public class EnterpriseIndustry {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 行业代码
     */
    private String industryCode;
    
    /**
     * 行业名称
     */
    private String industryName;
    
    /**
     * 父行业代码
     */
    private String parentIndustryCode;
    
    /**
     * 识别置信度(0-100)
     */
    private BigDecimal confidence;
    
    /**
     * 是否主行业
     */
    private Boolean isPrimary;
    
    /**
     * 是否AI自动识别
     */
    private Boolean isAutoDetected;
    
    /**
     * 识别来源(manual/ai/import)
     */
    private String detectionSource;
    
    /**
     * 行业关键词(JSON)
     */
    private String keywords;
    
    /**
     * 行业描述
     */
    private String description;
    
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