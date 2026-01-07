package com.mota.ai.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI工作建议实体
 */
@Data
@TableName("ai_work_suggestion")
public class AIWorkSuggestion {

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
     * 建议类型
     */
    private String type;

    /**
     * 建议标题
     */
    private String title;

    /**
     * 建议内容
     */
    private String content;

    /**
     * 优先级
     */
    private Integer priority;

    /**
     * 状态：pending/accepted/rejected
     */
    private String status;

    /**
     * 上下文类型
     */
    private String contextType;

    /**
     * 上下文ID
     */
    private Long contextId;

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