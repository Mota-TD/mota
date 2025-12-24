package com.mota.project.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.mota.common.mybatis.base.BaseEntityDO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 项目成员实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("project_member")
public class ProjectMember extends BaseEntityDO {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 项目角色(owner/department_manager/member/viewer)
     */
    private String role;

    /**
     * 所属部门ID
     */
    private Long departmentId;

    /**
     * 加入时间
     */
    private LocalDateTime joinedAt;

    /**
     * 项目角色枚举
     */
    public static class Role {
        public static final String OWNER = "owner";
        public static final String DEPARTMENT_MANAGER = "department_manager";
        public static final String MEMBER = "member";
        public static final String VIEWER = "viewer";
    }
}