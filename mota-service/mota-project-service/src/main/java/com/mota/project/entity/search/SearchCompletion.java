package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 搜索补全词实体 (SS-007 智能补全)
 */
@Data
@TableName("search_completion")
public class SearchCompletion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 前缀
     */
    private String prefix;
    
    /**
     * 补全文本
     */
    private String completionText;
    
    /**
     * 补全类型(query/entity/tag)
     */
    private String completionType;
    
    /**
     * 频率
     */
    private Integer frequency;
    
    /**
     * 权重
     */
    private BigDecimal weight;
    
    /**
     * 元数据(JSON)
     */
    private String metadata;
    
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