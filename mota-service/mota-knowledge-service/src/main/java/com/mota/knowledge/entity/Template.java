package com.mota.knowledge.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 模板实体
 */
@Data
@TableName("template")
public class Template {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 企业ID（NULL表示系统模板）
     */
    private Long enterpriseId;

    /**
     * 模板名称
     */
    private String name;

    /**
     * 模板类型
     */
    private String type;

    /**
     * 模板分类
     */
    private String category;

    /**
     * 模板内容
     */
    private String content;

    /**
     * 模板描述
     */
    private String description;

    /**
     * 缩略图
     */
    private String thumbnail;

    /**
     * 使用次数
     */
    private Integer useCount;

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
}