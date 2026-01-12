package com.mota.user.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户视图对象
 * 
 * @author mota
 */
@Data
public class UserVO {

    /**
     * 用户ID
     */
    private Long id;

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
    private Long deptId;

    /**
     * 部门名称
     */
    private String deptName;

    /**
     * 岗位ID
     */
    private Long postId;

    /**
     * 岗位名称
     */
    private String postName;

    /**
     * 用户类型（1普通用户 2管理员 3超级管理员）
     */
    private Integer userType;

    /**
     * 角色列表
     */
    private List<RoleVO> roles;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginAt;

    /**
     * 最后登录IP
     */
    private String lastLoginIp;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 角色视图对象
     */
    @Data
    public static class RoleVO {
        private Long id;
        private String name;
        private String code;
    }
}