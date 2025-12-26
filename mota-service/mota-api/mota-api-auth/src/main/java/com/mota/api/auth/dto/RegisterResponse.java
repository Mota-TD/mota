package com.mota.api.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 注册响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "注册响应")
public class RegisterResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "企业ID")
    private Long enterpriseId;

    @Schema(description = "企业名称")
    private String enterpriseName;

    @Schema(description = "组织ID")
    private String orgId;

    @Schema(description = "行业ID")
    private Long industryId;

    @Schema(description = "行业名称")
    private String industryName;

    @Schema(description = "企业角色")
    private String enterpriseRole;

    @Schema(description = "是否新创建的企业")
    private Boolean isNewEnterprise;
}