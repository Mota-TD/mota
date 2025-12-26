package com.mota.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 企业更新请求
 */
@Data
@Schema(description = "企业更新请求")
public class EnterpriseUpdateRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "企业名称")
    @Size(min = 2, max = 200, message = "企业名称长度必须在2-200个字符之间")
    private String name;

    @Schema(description = "企业简称")
    @Size(max = 100, message = "企业简称最多100个字符")
    private String shortName;

    @Schema(description = "行业ID")
    private Long industryId;

    @Schema(description = "企业Logo")
    private String logo;

    @Schema(description = "企业简介")
    @Size(max = 2000, message = "企业简介最多2000个字符")
    private String description;

    @Schema(description = "企业地址")
    @Size(max = 500, message = "企业地址最多500个字符")
    private String address;

    @Schema(description = "联系人姓名")
    @Size(max = 50, message = "联系人姓名最多50个字符")
    private String contactName;

    @Schema(description = "联系电话")
    @Size(max = 20, message = "联系电话最多20个字符")
    private String contactPhone;

    @Schema(description = "联系邮箱")
    @Size(max = 100, message = "联系邮箱最多100个字符")
    private String contactEmail;

    @Schema(description = "企业网站")
    @Size(max = 200, message = "企业网站最多200个字符")
    private String website;

    @Schema(description = "企业规模(1-50/51-200/201-500/501-1000/1000+)")
    private String scale;
}