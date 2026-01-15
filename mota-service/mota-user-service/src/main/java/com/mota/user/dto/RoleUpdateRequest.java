package com.mota.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 更新角色请求
 * 
 * @author mota
 */
@Data
public class RoleUpdateRequest {

    /**
     * 角色名称
     */
    @Size(max = 50, message = "角色名称长度不能超过50个字符")
    private String name;

    /**
     * 角色编码
     */
    @Size(max = 50, message = "角色编码长度不能超过50个字符")
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
     * 备注
     */
    @Size(max = 500, message = "备注长度不能超过500个字符")
    private String remark;

    /**
     * 权限ID列表
     */
    private List<Long> permissionIds;
}