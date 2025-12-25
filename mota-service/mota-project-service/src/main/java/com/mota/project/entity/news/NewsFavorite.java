package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 新闻收藏实体 (NW-008 新闻收藏)
 */
@Data
@TableName("news_favorite")
public class NewsFavorite {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 文章ID
     */
    private Long articleId;
    
    /**
     * 收藏夹ID
     */
    private Long folderId;
    
    /**
     * 备注
     */
    private String note;
    
    /**
     * 自定义标签(JSON)
     */
    private String tags;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}