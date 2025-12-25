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
 * 搜索热词统计实体
 */
@Data
@TableName("search_keyword_stats")
public class SearchKeywordStats {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 搜索关键词
     */
    private String keyword;

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
     * 搜索次数
     */
    private Integer searchCount;

    /**
     * 独立用户数
     */
    private Integer uniqueUsers;

    /**
     * 点击次数
     */
    private Integer clickCount;

    /**
     * 平均结果数
     */
    private BigDecimal avgResultCount;

    /**
     * 点击率
     */
    private BigDecimal clickRate;

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