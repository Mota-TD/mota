package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 企业业务领域实体 (NW-002 业务理解)
 */
@Data
@TableName("news_business_domain")
public class BusinessDomain {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 业务领域名称
     */
    private String domainName;
    
    /**
     * 领域类型(product/service/market/technology)
     */
    private String domainType;
    
    /**
     * 领域关键词(JSON)
     */
    private String keywords;
    
    /**
     * 领域描述
     */
    private String description;
    
    /**
     * 重要程度(1-10)
     */
    private Integer importance;
    
    /**
     * 是否核心业务
     */
    private Boolean isCore;
    
    /**
     * 关联行业(JSON)
     */
    private String relatedIndustries;
    
    /**
     * 竞争对手(JSON)
     */
    private String competitors;
    
    /**
     * 目标客户(JSON)
     */
    private String targetCustomers;
    
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