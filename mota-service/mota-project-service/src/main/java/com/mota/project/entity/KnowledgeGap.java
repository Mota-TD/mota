package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识缺口记录实体
 */
@Data
@TableName("knowledge_gap")
public class KnowledgeGap {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 缺口类型: search_no_result, frequent_question, missing_topic
     */
    private String gapType;

    /**
     * 相关关键词
     */
    private String keyword;

    /**
     * 缺口描述
     */
    private String description;

    /**
     * 出现次数
     */
    private Integer occurrenceCount;

    /**
     * 影响用户数
     */
    private Integer affectedUsers;

    /**
     * 状态: open, in_progress, resolved, ignored
     */
    private String status;

    /**
     * 优先级: low, medium, high, critical
     */
    private String priority;

    /**
     * 解决者ID
     */
    private Long resolvedBy;

    /**
     * 解决文档ID
     */
    private Long resolvedDocumentId;

    /**
     * 解决时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime resolvedAt;

    /**
     * 解决说明
     */
    private String resolutionNote;

    /**
     * 首次出现时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime firstOccurredAt;

    /**
     * 最后出现时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastOccurredAt;

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