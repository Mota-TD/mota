package com.mota.auth.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 行业实体
 *
 * 注意：行业数据是全局共享的基础数据，不需要租户隔离和数据权限控制
 * 因此不包含 tenantId、deptId、createdBy、updatedBy 等字段
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
     * 注意：行业数据通常由系统初始化，不需要自动填充
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     * 注意：行业数据通常由系统初始化，不需要自动填充
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // ========== 以下字段在表中不存在，明确标记为不存在 ==========
    
    /**
     * 租户ID - 行业数据是全局共享的，不需要租户隔离
     */
    @TableField(exist = false)
    private Long tenantId;

    /**
     * 部门ID - 行业数据不需要部门权限控制
     */
    @TableField(exist = false)
    private Long deptId;

    /**
     * 创建人ID - 行业数据由系统初始化
     */
    @TableField(exist = false)
    private Long createdBy;

    /**
     * 更新人ID - 行业数据由系统初始化
     */
    @TableField(exist = false)
    private Long updatedBy;

    /**
     * 删除标记 - 行业数据不支持逻辑删除
     */
    @TableField(exist = false)
    private Integer deleted;

    /**
     * 版本号 - 行业数据不需要乐观锁
     */
    @TableField(exist = false)
    private Integer version;
}