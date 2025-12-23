package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 项目实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("project")
public class Project extends BaseEntityDO {

    /**
     * 组织ID
     */
    @TableField(value = "org_id", insertStrategy = FieldStrategy.NOT_NULL)
    private String orgId;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目标识
     */
    @TableField("`key`")
    private String key;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 状态
     */
    private String status;

    /**
     * 负责人ID
     */
    @TableField(value = "owner_id", insertStrategy = FieldStrategy.NOT_NULL)
    private Long ownerId;

    /**
     * 颜色
     */
    private String color;

    /**
     * 是否收藏
     */
    private Integer starred;

    /**
     * 进度
     */
    private Integer progress;

    /**
     * 成员数量
     */
    private Integer memberCount;

    /**
     * 任务数量
     */
    private Integer issueCount;
}