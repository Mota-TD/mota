package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 角色实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_role")
public class Role extends BaseEntityDO {

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
}