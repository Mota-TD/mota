package com.mota.project.entity.search;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户搜索偏好实体
 */
@Data
@TableName("user_search_preference")
public class UserSearchPreference {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 偏好的内容类型(JSON)
     */
    private String preferredTypes;
    
    /**
     * 常用筛选条件(JSON)
     */
    private String preferredFilters;
    
    /**
     * 是否启用搜索历史
     */
    private Boolean searchHistoryEnabled;
    
    /**
     * 是否启用搜索建议
     */
    private Boolean suggestionEnabled;
    
    /**
     * 是否启用个性化
     */
    private Boolean personalizationEnabled;
    
    /**
     * 安全搜索级别
     */
    private String safeSearchLevel;
    
    /**
     * 每页结果数
     */
    private Integer resultsPerPage;
    
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