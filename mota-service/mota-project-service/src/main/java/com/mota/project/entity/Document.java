package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文档实体
 */
@Data
@TableName("document")
public class Document {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 文档标题
     */
    private String title;

    /**
     * 文档内容（Markdown/HTML）
     */
    private String content;

    /**
     * 内容类型: markdown, richtext, html
     */
    private String contentType;

    /**
     * 文档摘要
     */
    private String summary;

    /**
     * 封面图片URL
     */
    private String coverImage;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 所属文件夹ID
     */
    private Long folderId;

    /**
     * 创建者ID
     */
    private Long creatorId;

    /**
     * 状态: draft, published, archived
     */
    private String status;

    /**
     * 是否为模板
     */
    private Boolean isTemplate;

    /**
     * 模板分类
     */
    private String templateCategory;

    /**
     * 可见性: private, project, public
     */
    private String visibility;

    /**
     * 是否允许评论
     */
    private Boolean allowComments;

    /**
     * 是否允许编辑
     */
    private Boolean allowEdit;

    /**
     * 浏览次数
     */
    private Integer viewCount;

    /**
     * 点赞次数
     */
    private Integer likeCount;

    /**
     * 评论数量
     */
    private Integer commentCount;

    /**
     * 当前版本号
     */
    private Integer currentVersion;

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

    /**
     * 发布时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedAt;

    // ========== 非数据库字段 ==========

    /**
     * 创建者名称
     */
    @TableField(exist = false)
    private String creatorName;

    /**
     * 创建者头像
     */
    @TableField(exist = false)
    private String creatorAvatar;

    /**
     * 项目名称
     */
    @TableField(exist = false)
    private String projectName;

    /**
     * 文件夹名称
     */
    @TableField(exist = false)
    private String folderName;

    /**
     * 协作者列表
     */
    @TableField(exist = false)
    private List<DocumentCollaborator> collaborators;

    /**
     * 版本列表
     */
    @TableField(exist = false)
    private List<DocumentVersion> versions;
}