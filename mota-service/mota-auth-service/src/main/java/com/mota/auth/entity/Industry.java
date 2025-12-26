package com.mota.auth.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 行业实体
 */
@Data
@TableName("industry")
public class Industry implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 行业代码
     */
    private String code;

    /**
     * 行业名称
     */
    private String name;

    /**
     * 父行业ID
     */
    private Long parentId;

    /**
     * 层级(1-一级行业,2-二级行业)
     */
    private Integer level;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 行业图标
     */
    private String icon;

    /**
     * 行业描述
     */
    private String description;

    /**
     * 状态(0-禁用,1-启用)
     */
    private Integer status;

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