package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 搜索意图模板实体 (SS-005 意图识别)
 */
@Data
@TableName("search_intent_template")
public class SearchIntentTemplate {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 意图名称
     */
    private String intentName;
    
    /**
     * 意图代码
     */
    private String intentCode;
    
    /**
     * 匹配模式(正则表达式列表JSON)
     */
    private String patterns;
    
    /**
     * 关键词列表(JSON)
     */
    private String keywords;
    
    /**
     * 动作类型(search/navigate/filter/aggregate)
     */
    private String actionType;
    
    /**
     * 动作配置(JSON)
     */
    private String actionConfig;
    
    /**
     * 优先级
     */
    private Integer priority;
    
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