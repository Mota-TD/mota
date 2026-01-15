package com.mota.user.dto;

import com.mota.common.core.base.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色查询请求
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class RoleQueryRequest extends PageQuery {

    /**
     * 角色名称
     */
    private String name;

    /**
     * 角色编码
     */
    private String code;

    /**
     * 状态（1正常 0停用）
     */
    private Integer status;
}