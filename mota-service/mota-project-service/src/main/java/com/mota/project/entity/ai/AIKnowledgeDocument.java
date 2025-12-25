package com.mota.project.entity.ai;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * AI知识文档实体
 * 对应功能: AI-001 文档解析
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_knowledge_document")
public class AIKnowledgeDocument implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 文档标题
     */
    private String title;

    /**
     * 原始文件名
     */
    private String originalFilename;

    /**
     * 文件存储路径
     */
    private String filePath;

    /**
     * 文件类型(pdf/docx/txt/md/xlsx/pptx)
     */
    private String fileType;

    /**
     * 文件大小(字节)
     */
    private Long fileSize;

    /**
     * MIME类型
     */
    private String mimeType;

    /**
     * 解析后的文本内容
     */
    private String contentText;

    /**
     * 解析后的HTML内容
     */
    private String contentHtml;

    /**
     * 解析状态(pending/parsing/completed/failed)
     */
    private String parseStatus;

    /**
     * 解析错误信息
     */
    private String parseError;

    /**
     * 解析完成时间
     */
    private LocalDateTime parsedAt;

    /**
     * 页数(PDF/PPT)
     */
    private Integer pageCount;

    /**
     * 字数统计
     */
    private Integer wordCount;

    /**
     * 字符数统计
     */
    private Integer charCount;

    /**
     * 文档语言
     */
    private String language;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 文件夹ID
     */
    private Long folderId;

    /**
     * 团队ID
     */
    private Long teamId;

    /**
     * 创建者ID
     */
    private Long creatorId;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 删除时间
     */
    @TableLogic
    private LocalDateTime deletedAt;

    // 解析状态常量
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_PARSING = "parsing";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_FAILED = "failed";
}