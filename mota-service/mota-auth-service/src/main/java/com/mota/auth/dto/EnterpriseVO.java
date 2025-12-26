package com.mota.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 企业信息VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "企业信息")
public class EnterpriseVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "企业ID")
    private Long id;

    @Schema(description = "组织ID")
    private String orgId;

    @Schema(description = "企业名称")
    private String name;

    @Schema(description = "企业简称")
    private String shortName;

    @Schema(description = "行业ID")
    private Long industryId;

    @Schema(description = "行业名称")
    private String industryName;

    @Schema(description = "企业Logo")
    private String logo;

    @Schema(description = "企业简介")
    private String description;

    @Schema(description = "企业地址")
    private String address;

    @Schema(description = "联系人姓名")
    private String contactName;

    @Schema(description = "联系电话")
    private String contactPhone;

    @Schema(description = "联系邮箱")
    private String contactEmail;

    @Schema(description = "企业网站")
    private String website;

    @Schema(description = "企业规模")
    private String scale;

    @Schema(description = "成员数量")
    private Integer memberCount;

    @Schema(description = "最大成员数量")
    private Integer maxMembers;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "是否已认证")
    private Integer verified;

    @Schema(description = "当前用户在企业中的角色")
    private String currentUserRole;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}