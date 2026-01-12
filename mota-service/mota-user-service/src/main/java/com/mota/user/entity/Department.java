package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 部门实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dept")
public class Department extends BaseEntityDO {

    /**
     * 部门名称
     */
    private String name;

    /**
     * 部门编码
     */
    private String code;

    /**
     * 父部门ID
     */
    private Long parentId;

    /**
     * 祖级列表（如：0,1,2）
     */
    private String ancestors;

    /**
     * 部门层级
     */
    private Integer level;

    /**
     * 显示顺序
     */
    private Integer sort;

    /**
     * 负责人ID
     */
    private Long leaderId;

    /**
     * 负责人姓名
     */
    private String leaderName;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 状态（1正常 0停用）
     */
    private Integer status;

    /**
     * 备注
     */
    private String remark;
}