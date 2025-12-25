package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 收藏夹实体 (NW-008 新闻收藏)
 */
@Data
@TableName("news_favorite_folder")
public class NewsFavoriteFolder {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 收藏夹名称
     */
    private String folderName;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 是否默认收藏夹
     */
    private Boolean isDefault;
    
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