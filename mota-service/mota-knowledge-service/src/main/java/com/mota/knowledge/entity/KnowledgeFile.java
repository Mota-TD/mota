package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 知识文件实体
 */
@Data
@TableName("knowledge_file")
public class KnowledgeFile {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 企业ID
     */
    private Long enterpriseId;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 父级ID（文件夹）
     */
    private Long parentId;

    /**
     * 文件名
     */
    private String name;

    /**
     * 类型：folder/file
     */
    private String type;

    /**
     * 文件类型
     */
    private String fileType;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文件内容（文本类）
     */
    private String content;

    /**
     * 版本号
     */
    private Integer version;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 创建人
     */
    private Long createdBy;

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
     * 是否删除
     */
    private Integer deleted;

    /**
     * 标签列表（非数据库字段）
     */
    @TableField(exist = false)
    private List<String> tags;

    /**
     * 创建人名称（非数据库字段）
     */
    @TableField(exist = false)
    private String creatorName;
}