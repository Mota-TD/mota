package com.mota.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.io.Serializable;

/**
 * 创建邀请请求
 */
@Data
@Schema(description = "创建邀请请求")
public class CreateInvitationRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "邀请类型(link-链接邀请,email-邮件邀请,phone-手机邀请)", example = "link")
    private String inviteType = "link";

    @Schema(description = "目标邮箱(邮件邀请时必填)")
    @Email(message = "邮箱格式不正确")
    private String targetEmail;

    @Schema(description = "目标手机号(手机邀请时必填)")
    private String targetPhone;

    @Schema(description = "邀请角色(admin/member)", example = "member")
    private String role = "member";

    @Schema(description = "邀请加入的部门ID")
    private Long departmentId;

    @Schema(description = "最大使用次数(0-无限制)", example = "10")
    private Integer maxUses = 10;

    @Schema(description = "有效天数", example = "7")
    private Integer validDays = 7;
}