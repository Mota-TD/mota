package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档版本实体
 */
@Data
@TableName("document_version")
public class DocumentVersion {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 版本号
     */
    private Integer versionNumber;

    /**
     * 版本标题
     */
    private String title;

    /**
     * 版本内容
     */
    private String content;

    /**
     * 变更摘要
     */
    private String changeSummary;

    /**
     * 编辑者ID
     */
    private Long editorId;

    /**
     * 编辑者名称
     */
    private String editorName;

    /**
     * 版本类型: major, minor, patch, auto
     */
    private String versionType;

    /**
     * 与上一版本的差异（JSON格式）
     */
    private String diffContent;

    /**
     * 内容哈希值
     */
    private String contentHash;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}