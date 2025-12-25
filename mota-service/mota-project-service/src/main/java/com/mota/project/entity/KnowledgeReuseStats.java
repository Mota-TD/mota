package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 知识复用统计实体（按文档汇总）
 */
@Data
@TableName("knowledge_reuse_stats")
public class KnowledgeReuseStats {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 统计月份（YYYY-MM）
     */
    private String statsMonth;

    /**
     * 总复用次数
     */
    private Integer totalReuseCount;

    /**
     * 复制次数
     */
    private Integer copyCount;

    /**
     * 引用次数
     */
    private Integer referenceCount;

    /**
     * 模板使用次数
     */
    private Integer templateCount;

    /**
     * 引述次数
     */
    private Integer quoteCount;

    /**
     * 独立复用用户数
     */
    private Integer uniqueUsers;

    /**
     * 复用率（复用次数/访问次数）
     */
    private BigDecimal reuseRate;

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