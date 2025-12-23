package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI新闻实体
 */
@Data
@TableName("ai_news")
public class AINews {

    @TableId(type = IdType.INPUT)
    private String id;

    /**
     * 标题
     */
    private String title;

    /**
     * 摘要
     */
    private String summary;

    /**
     * 来源
     */
    private String source;

    /**
     * 来源图标
     */
    private String sourceIcon;

    /**
     * 发布时间（字符串格式）
     */
    private String publishTime;

    /**
     * 分类
     */
    private String category;

    /**
     * 标签（JSON格式）
     */
    private String tags;

    /**
     * 链接
     */
    private String url;

    /**
     * 是否收藏
     */
    private Integer isStarred;

    /**
     * 相关度
     */
    private Integer relevance;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}