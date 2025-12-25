package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 文档统计汇总实体（按天）
 */
@Data
@TableName("document_stats_daily")
public class DocumentStatsDaily {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 统计日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate statsDate;

    /**
     * 浏览次数
     */
    private Integer viewCount;

    /**
     * 独立访客数
     */
    private Integer uniqueVisitors;

    /**
     * 下载次数
     */
    private Integer downloadCount;

    /**
     * 分享次数
     */
    private Integer shareCount;

    /**
     * 复制次数
     */
    private Integer copyCount;

    /**
     * 引用次数
     */
    private Integer referenceCount;

    /**
     * 总停留时长（秒）
     */
    private Long totalDurationSeconds;

    /**
     * 平均停留时长（秒）
     */
    private Integer avgDurationSeconds;

    /**
     * 搜索访问次数
     */
    private Integer searchVisits;

    /**
     * 直接访问次数
     */
    private Integer directVisits;

    /**
     * 推荐访问次数
     */
    private Integer recommendationVisits;

    /**
     * 链接访问次数
     */
    private Integer linkVisits;

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