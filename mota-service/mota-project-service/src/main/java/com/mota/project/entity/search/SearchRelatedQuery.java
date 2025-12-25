package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 搜索相关推荐实体 (SS-008 相关推荐)
 */
@Data
@TableName("search_related_query")
public class SearchRelatedQuery {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 源查询
     */
    private String sourceQuery;
    
    /**
     * 相关查询
     */
    private String relatedQuery;
    
    /**
     * 关系类型(co_search/refine/broaden)
     */
    private String relationType;
    
    /**
     * 共现次数
     */
    private Integer coOccurrenceCount;
    
    /**
     * 相似度得分
     */
    private BigDecimal similarityScore;
    
    /**
     * 点击率
     */
    private BigDecimal clickThroughRate;
    
    /**
     * 是否启用
     */
    private Boolean isActive;
    
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