package com.mota.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 用户实体
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class User extends BaseEntityDO {

    /**
     * 用户名
     */
    private String username;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 密码哈希
     */
    private String passwordHash;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 性别（0未知 1男 2女）
     */
    private Integer gender;

    /**
     * 状态（1正常 0禁用）
     */
    private Integer status;

    /**
     * 部门ID
     */
    @TableField("dept_id")
    private Long deptId;

    /**
     * 岗位ID
     */
    private Long postId;

    /**
     * 用户类型（1普通用户 2管理员 3超级管理员）
     */
    private Integer userType;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginAt;

    /**
     * 最后登录IP
     */
    private String lastLoginIp;

    /**
     * 登录失败次数
     */
    private Integer loginFailCount;

    /**
     * 账号锁定时间
     */
    private LocalDateTime lockTime;

    /**
     * 密码过期时间
     */
    private LocalDateTime passwordExpireAt;

    /**
     * 备注
     */
    private String remark;
}