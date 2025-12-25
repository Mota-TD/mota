package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 搜索同义词实体 (SS-002 语义搜索)
 */
@Data
@TableName("search_synonym")
public class SearchSynonym {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 同义词组(逗号分隔)
     */
    private String wordGroup;
    
    /**
     * 同义词类型(equivalent/expansion)
     */
    private String synonymType;
    
    /**
     * 领域
     */
    private String domain;
    
    /**
     * 权重
     */
    private BigDecimal weight;
    
    /**
     * 是否启用
     */
    private Boolean isActive;
    
    /**
     * 创建人
     */
    private Long createdBy;
    
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