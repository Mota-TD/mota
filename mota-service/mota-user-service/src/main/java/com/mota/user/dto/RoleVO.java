package com.mota.user.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色视图对象
 * 
 * @author mota
 */
@Data
public class RoleVO {

    /**
     * 角色ID
     */
    private Long id;

    /**
     * 角色名称
     */
    private String name;

    /**
     * 角色编码
     */
    private String code;

    /**
     * 显示顺序
     */
    private Integer sort;

    /**
     * 数据范围（1全部 2自定义 3本部门 4本部门及以下 5仅本人）
     */
    private Integer dataScope;

    /**
     * 状态（1正常 0停用）
     */
    private Integer status;

    /**
     * 是否系统内置（1是 0否）
     */
    private Integer isSystem;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 权限ID列表
     */
    private List<Long> permissionIds;

    /**
     * 用户数量
     */
    private Integer userCount;
}