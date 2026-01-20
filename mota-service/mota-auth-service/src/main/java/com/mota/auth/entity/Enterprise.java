package com.mota.auth.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 企业实体
 *
 * 注意：此实体包含多租户字段，用于企业级数据隔离
 */
@Data
@TableName("enterprise")
public class Enterprise implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    /**
     * 租户ID
     * 用于多租户数据隔离，每个企业是一个独立的租户
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonSerialize(using = ToStringSerializer.class)
    @JsonIgnore
    private Long tenantId;

    /**
     * 组织ID(用于关联用户)
     */
    private String orgId;

    /**
     * 企业名称
     */
    private String name;

    /**
     * 企业简称
     */
    private String shortName;

    /**
     * 所属行业ID
     */
    private Long industryId;

    /**
     * 行业名称(冗余)
     */
    private String industryName;

    /**
     * 企业Logo
     */
    private String logo;

    /**
     * 企业简介
     */
    private String description;

    /**
     * 企业地址
     */
    private String address;

    /**
     * 联系人姓名
     */
    private String contactName;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 联系邮箱
     */
    private String contactEmail;

    /**
     * 企业网站
     */
    private String website;

    /**
     * 企业规模(1-50/51-200/201-500/501-1000/1000+)
     */
    private String scale;

    /**
     * 超级管理员用户ID
     */
    private Long adminUserId;

    /**
     * 成员数量
     */
    private Integer memberCount;

    /**
     * 最大成员数量
     */
    private Integer maxMembers;

    /**
     * 状态(0-禁用,1-正常,2-待审核)
     */
    private Integer status;

    /**
     * 是否已认证(0-未认证,1-已认证)
     */
    private Integer verified;

    /**
     * 认证时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime verifiedAt;

    /**
     * 服务到期时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiredAt;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 创建人ID
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long createdBy;

    /**
     * 更新人ID
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long updatedBy;

    /**
     * 删除标记（0-未删除，1-已删除）
     */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    /**
     * 乐观锁版本号
     */
    @Version
    @TableField(fill = FieldFill.INSERT)
    private Integer version;
}