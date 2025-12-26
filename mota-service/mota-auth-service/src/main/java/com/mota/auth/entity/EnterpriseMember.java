package com.mota.auth.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 企业成员实体
 */
@Data
@TableName("enterprise_member")
public class EnterpriseMember implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 企业ID
     */
    private Long enterpriseId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 角色(super_admin/admin/member)
     */
    private String role;

    /**
     * 所属部门ID
     */
    private Long departmentId;

    /**
     * 职位
     */
    private String position;

    /**
     * 工号
     */
    private String employeeNo;

    /**
     * 状态(0-禁用,1-正常)
     */
    private Integer status;

    /**
     * 加入时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime joinedAt;

    /**
     * 邀请人ID
     */
    private Long invitedBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 删除标记（0-未删除，1-已删除）
     */
    @TableLogic
    private Integer deleted;
}