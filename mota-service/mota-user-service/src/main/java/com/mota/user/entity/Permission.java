package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 权限/菜单实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_permission")
public class Permission extends BaseEntityDO {

    /**
     * 权限名称
     */
    private String name;

    /**
     * 权限编码
     */
    private String code;

    /**
     * 父权限ID
     */
    private Long parentId;

    /**
     * 类型（1目录 2菜单 3按钮）
     */
    private Integer type;

    /**
     * 路由地址
     */
    private String path;

    /**
     * 组件路径
     */
    private String component;

    /**
     * 权限标识
     */
    private String perms;

    /**
     * 图标
     */
    private String icon;

    /**
     * 显示顺序
     */
    private Integer sort;

    /**
     * 是否可见（1是 0否）
     */
    private Integer visible;

    /**
     * 是否缓存（1是 0否）
     */
    private Integer keepAlive;

    /**
     * 状态（1正常 0停用）
     */
    private Integer status;

    /**
     * 备注
     */
    private String remark;
}