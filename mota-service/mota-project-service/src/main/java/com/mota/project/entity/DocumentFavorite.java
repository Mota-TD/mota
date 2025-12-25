package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档收藏实体
 */
@Data
@TableName("document_favorite")
public class DocumentFavorite {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 文档ID
     */
    private Long documentId;

    /**
     * 收藏夹分类名称
     */
    private String folderName;

    /**
     * 收藏备注
     */
    private String note;

    /**
     * 收藏时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    // ========== 非数据库字段 ==========

    /**
     * 文档标题
     */
    @TableField(exist = false)
    private String documentTitle;

    /**
     * 文档摘要
     */
    @TableField(exist = false)
    private String documentSummary;

    /**
     * 文档状态
     */
    @TableField(exist = false)
    private String documentStatus;

    /**
     * 项目名称
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 创建者名称
     */
    @TableField(exist = false)
    private String creatorName;

    /**
     * 文档更新时间
     */
    @TableField(exist = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime documentUpdatedAt;
}