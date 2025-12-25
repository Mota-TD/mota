package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 搜索热词实体
 */
@Data
@TableName("search_hot_word")
public class SearchHotWord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 热词
     */
    private String word;
    
    /**
     * 分类
     */
    private String category;
    
    /**
     * 搜索次数
     */
    private Integer searchCount;
    
    /**
     * 趋势得分
     */
    private BigDecimal trendScore;
    
    /**
     * 统计周期(hourly/daily/weekly)
     */
    private String periodType;
    
    /**
     * 统计日期
     */
    private LocalDate periodDate;
    
    /**
     * 排名位置
     */
    private Integer rankPosition;
    
    /**
     * 是否上升趋势
     */
    private Boolean isTrending;
    
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