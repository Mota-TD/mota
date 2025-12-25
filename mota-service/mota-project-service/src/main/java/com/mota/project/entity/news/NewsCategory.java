package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 新闻分类实体 (NW-009 新闻分类)
 */
@Data
@TableName("news_category")
public class NewsCategory {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 分类代码
     */
    private String categoryCode;
    
    /**
     * 分类名称
     */
    private String categoryName;
    
    /**
     * 父分类ID
     */
    private Long parentId;
    
    /**
     * 层级
     */
    private Integer level;
    
    /**
     * 分类路径
     */
    private String path;
    
    /**
     * 图标
     */
    private String icon;
    
    /**
     * 颜色
     */
    private String color;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 分类关键词(JSON)
     */
    private String keywords;
    
    /**
     * 排序
     */
    private Integer sortOrder;
    
    /**
     * 是否系统分类
     */
    private Boolean isSystem;
    
    /**
     * 是否启用
     */
    private Boolean isEnabled;
    
    /**
     * 文章数量
     */
    private Integer articleCount;
    
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