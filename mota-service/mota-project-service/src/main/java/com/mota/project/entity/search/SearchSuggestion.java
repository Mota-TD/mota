package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 搜索建议实体 (SS-007 智能补全, SS-008 相关推荐)
 */
@Data
@TableName("search_suggestion")
public class SearchSuggestion {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 建议文本
     */
    private String suggestionText;
    
    /**
     * 建议类型(hot/related/correction/completion)
     */
    private String suggestionType;
    
    /**
     * 来源查询
     */
    private String sourceQuery;
    
    /**
     * 出现频率
     */
    private Integer frequency;
    
    /**
     * 点击次数
     */
    private Integer clickCount;
    
    /**
     * 相关度得分
     */
    private BigDecimal score;
    
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