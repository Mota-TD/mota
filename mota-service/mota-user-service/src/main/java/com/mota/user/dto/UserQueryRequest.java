package com.mota.user.dto;

import com.mota.common.core.base.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户查询请求
 * 
 * @author mota
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class UserQueryRequest extends PageQuery {

    /**
     * 用户名（模糊查询）
     */
    private String username;

    /**
     * 昵称（模糊查询）
     */
    private String nickname;

    /**
     * 真实姓名（模糊查询）
     */
    private String realName;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 状态（1正常 0禁用）
     */
    private Integer status;

    /**
     * 部门ID
     */
    private Long deptId;

    /**
     * 是否包含子部门用户
     */
    private Boolean includeChildDept;

    /**
     * 角色ID
     */
    private Long roleId;

    /**
     * 创建时间开始
     */
    private String createTimeStart;

    /**
     * 创建时间结束
     */
    private String createTimeEnd;
}