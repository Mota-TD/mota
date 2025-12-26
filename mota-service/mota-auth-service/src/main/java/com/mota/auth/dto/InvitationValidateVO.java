package com.mota.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 邀请验证结果VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "邀请验证结果")
public class InvitationValidateVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "是否有效")
    private Boolean valid;

    @Schema(description = "错误信息(无效时)")
    private String errorMessage;

    @Schema(description = "企业ID")
    private Long enterpriseId;

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "企业Logo")
    private String enterpriseLogo;

    @Schema(description = "行业名称")
    private String industryName;

    @Schema(description = "邀请角色")
    private String role;

    @Schema(description = "角色名称")
    private String roleName;

    @Schema(description = "部门名称")
    private String departmentName;

    @Schema(description = "邀请人姓名")
    private String invitedByName;

    @Schema(description = "过期时间")
    private LocalDateTime expiredAt;
}