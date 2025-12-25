package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 热门文档排行实体
 */
@Data
@TableName("document_ranking")
public class DocumentRanking {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 排行类型: daily, weekly, monthly, all_time
     */
    private String rankingType;

    /**
     * 排行日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rankingDate;

    /**
     * 排名位置
     */
    private Integer rankPosition;

    /**
     * 综合得分
     */
    private BigDecimal score;

    /**
     * 浏览次数
     */
    private Integer viewCount;

    /**
     * 独立访客数
     */
    private Integer uniqueVisitors;

    /**
     * 复用次数
     */
    private Integer reuseCount;

    /**
     * 点赞数
     */
    private Integer likeCount;

    /**
     * 评论数
     */
    private Integer commentCount;

    /**
     * 排名变化（正数上升，负数下降）
     */
    private Integer rankChange;

    /**
     * 浏览量变化率
     */
    private BigDecimal viewChangeRate;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}