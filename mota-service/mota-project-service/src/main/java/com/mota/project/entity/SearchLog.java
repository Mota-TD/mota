package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 搜索记录实体
 */
@Data
@TableName("search_log")
public class SearchLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 搜索用户ID
     */
    private Long userId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 搜索关键词
     */
    private String keyword;

    /**
     * 搜索类型: document, knowledge, all
     */
    private String searchType;

    /**
     * 搜索结果数量
     */
    private Integer resultCount;

    /**
     * 点击的文档ID
     */
    private Long clickedDocumentId;

    /**
     * 点击位置（排名）
     */
    private Integer clickPosition;

    /**
     * 搜索日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate searchDate;

    /**
     * 搜索时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime searchTime;
}