package com.mota.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 企业成员VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "企业成员信息")
public class EnterpriseMemberVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "成员ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "昵称")
    private String nickname;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "头像")
    private String avatar;

    @Schema(description = "企业角色(super_admin/admin/member)")
    private String role;

    @Schema(description = "角色名称")
    private String roleName;

    @Schema(description = "部门ID")
    private Long departmentId;

    @Schema(description = "部门名称")
    private String departmentName;

    @Schema(description = "职位")
    private String position;

    @Schema(description = "工号")
    private String employeeNo;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "加入时间")
    private LocalDateTime joinedAt;

    @Schema(description = "邀请人ID")
    private Long invitedBy;

    @Schema(description = "邀请人姓名")
    private String invitedByName;
}