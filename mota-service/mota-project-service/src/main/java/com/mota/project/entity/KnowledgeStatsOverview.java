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
 * 知识统计概览实体（项目级别）
 */
@Data
@TableName("knowledge_stats_overview")
public class KnowledgeStatsOverview {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目ID（NULL表示全局）
     */
    private Long projectId;

    /**
     * 统计日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate statsDate;

    /**
     * 总文档数
     */
    private Integer totalDocuments;

    /**
     * 新增文档数
     */
    private Integer newDocuments;

    /**
     * 更新文档数
     */
    private Integer updatedDocuments;

    /**
     * 总浏览量
     */
    private Integer totalViews;

    /**
     * 独立访客数
     */
    private Integer uniqueVisitors;

    /**
     * 平均停留时长
     */
    private Integer avgDurationSeconds;

    /**
     * 总搜索次数
     */
    private Integer totalSearches;

    /**
     * 搜索成功率
     */
    private BigDecimal searchSuccessRate;

    /**
     * 总复用次数
     */
    private Integer totalReuses;

    /**
     * 整体复用率
     */
    private BigDecimal reuseRate;

    /**
     * 未解决缺口数
     */
    private Integer openGaps;

    /**
     * 已解决缺口数
     */
    private Integer resolvedGaps;

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