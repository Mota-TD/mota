package com.mota.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 邀请信息VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "邀请信息")
public class InvitationVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "邀请ID")
    private Long id;

    @Schema(description = "邀请码")
    private String inviteCode;

    @Schema(description = "邀请链接")
    private String inviteLink;

    @Schema(description = "邀请类型")
    private String inviteType;

    @Schema(description = "目标邮箱")
    private String targetEmail;

    @Schema(description = "目标手机号")
    private String targetPhone;

    @Schema(description = "邀请角色")
    private String role;

    @Schema(description = "角色名称")
    private String roleName;

    @Schema(description = "部门ID")
    private Long departmentId;

    @Schema(description = "部门名称")
    private String departmentName;

    @Schema(description = "最大使用次数")
    private Integer maxUses;

    @Schema(description = "已使用次数")
    private Integer usedCount;

    @Schema(description = "过期时间")
    private LocalDateTime expiredAt;

    @Schema(description = "状态(0-已失效,1-有效,2-已使用完)")
    private Integer status;

    @Schema(description = "状态名称")
    private String statusName;

    @Schema(description = "邀请人ID")
    private Long invitedBy;

    @Schema(description = "邀请人姓名")
    private String invitedByName;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}