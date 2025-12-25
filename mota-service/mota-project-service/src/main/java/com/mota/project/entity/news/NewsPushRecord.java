package com.mota.project.entity.news;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 推送记录实体 (NW-007 推送优化)
 */
@Data
@TableName("news_push_record")
public class NewsPushRecord {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 团队ID
     */
    private Long teamId;
    
    /**
     * 推送渠道
     */
    private String pushChannel;
    
    /**
     * 推送类型(scheduled/manual/realtime)
     */
    private String pushType;
    
    /**
     * 推送的文章ID列表(JSON)
     */
    private String articleIds;
    
    /**
     * 文章数量
     */
    private Integer articleCount;
    
    /**
     * 推送标题
     */
    private String pushTitle;
    
    /**
     * 推送内容
     */
    private String pushContent;
    
    /**
     * 推送状态(pending/sent/failed)
     */
    private String pushStatus;
    
    /**
     * 发送时间
     */
    private LocalDateTime sentAt;
    
    /**
     * 打开时间
     */
    private LocalDateTime openedAt;
    
    /**
     * 点击次数
     */
    private Integer clickCount;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}