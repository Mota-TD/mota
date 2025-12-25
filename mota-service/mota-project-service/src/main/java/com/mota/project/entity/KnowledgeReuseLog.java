package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 知识复用记录实体
 */
@Data
@TableName("knowledge_reuse_log")
public class KnowledgeReuseLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 源文档ID
     */
    private Long sourceDocumentId;

    /**
     * 目标文档ID
     */
    private Long targetDocumentId;

    /**
     * 目标任务ID
     */
    private Long targetTaskId;

    /**
     * 目标项目ID
     */
    private Long targetProjectId;

    /**
     * 复用用户ID
     */
    private Long userId;

    /**
     * 复用类型: copy, reference, template, quote
     */
    private String reuseType;

    /**
     * 复用内容摘要
     */
    private String reuseContent;

    /**
     * 复用内容长度
     */
    private Integer contentLength;

    /**
     * 复用日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reuseDate;

    /**
     * 复用时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reuseTime;
}