package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 智能搜索日志实体
 */
@Data
@TableName("smart_search_log")
public class SmartSearchLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 企业ID
     */
    private Long enterpriseId;

    /**
     * 搜索查询
     */
    private String query;

    /**
     * 识别的意图
     */
    private String intent;

    /**
     * 结果数量
     */
    private Integer resultsCount;

    /**
     * 点击位置
     */
    private Integer clickPosition;

    /**
     * 搜索耗时(ms)
     */
    private Integer searchTime;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}