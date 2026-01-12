package com.mota.common.mybatis.base;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 数据库实体基类
 * 包含通用字段：主键、租户ID、创建/更新时间、创建/更新人、删除标记、版本号
 *
 * @author Mota
 * @since 1.0.0
 */
@Data
public abstract class BaseEntityDO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     * 使用 ToStringSerializer 将 Long 序列化为字符串，解决 JavaScript 数字精度丢失问题
     */
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    /**
     * 租户ID
     * 多租户隔离字段，由多租户插件自动填充和过滤
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonSerialize(using = ToStringSerializer.class)
    @JsonIgnore
    private Long tenantId;

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
     * 使用 ToStringSerializer 将 Long 序列化为字符串
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long createdBy;

    /**
     * 更新人ID
     * 使用 ToStringSerializer 将 Long 序列化为字符串
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long updatedBy;

    /**
     * 部门ID
     * 用于数据权限过滤
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long deptId;

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