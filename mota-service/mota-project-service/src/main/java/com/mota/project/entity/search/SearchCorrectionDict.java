package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 搜索纠错词典实体 (SS-006 自动纠错)
 */
@Data
@TableName("search_correction_dict")
public class SearchCorrectionDict {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 错误词
     */
    private String wrongWord;
    
    /**
     * 正确词
     */
    private String correctWord;
    
    /**
     * 纠错类型(spelling/synonym/pinyin)
     */
    private String correctionType;
    
    /**
     * 置信度
     */
    private BigDecimal confidence;
    
    /**
     * 使用次数
     */
    private Integer usageCount;
    
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