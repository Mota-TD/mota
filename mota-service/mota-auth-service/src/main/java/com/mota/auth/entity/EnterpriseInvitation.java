package com.mota.auth.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 企业邀请实体
 */
@Data
@TableName("enterprise_invitation")
public class EnterpriseInvitation implements Serializable {

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
     * 邀请码
     */
    private String inviteCode;

    /**
     * 邀请类型(link-链接邀请,email-邮件邀请,phone-手机邀请)
     */
    private String inviteType;

    /**
     * 目标邮箱
     */
    private String targetEmail;

    /**
     * 目标手机号
     */
    private String targetPhone;

    /**
     * 邀请角色
     */
    private String role;

    /**
     * 邀请加入的部门ID
     */
    private Long departmentId;

    /**
     * 最大使用次数(0-无限制)
     */
    private Integer maxUses;

    /**
     * 已使用次数
     */
    private Integer usedCount;

    /**
     * 过期时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiredAt;

    /**
     * 状态(0-已失效,1-有效,2-已使用完)
     */
    private Integer status;

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
}