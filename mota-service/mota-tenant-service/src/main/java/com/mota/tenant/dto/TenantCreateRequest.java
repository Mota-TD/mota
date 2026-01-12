package com.mota.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 租户创建请求DTO
 * 
 * @author mota
 */
@Data
public class TenantCreateRequest {

    /**
     * 租户编码（唯一标识）
     */
    @NotBlank(message = "租户编码不能为空")
    @Size(min = 2, max = 50, message = "租户编码长度必须在2-50之间")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z0-9_-]*$", message = "租户编码必须以字母开头，只能包含字母、数字、下划线和连字符")
    private String tenantCode;

    /**
     * 租户名称（企业名称）
     */
    @NotBlank(message = "租户名称不能为空")
    @Size(min = 2, max = 100, message = "租户名称长度必须在2-100之间")
    private String tenantName;

    /**
     * 租户简称
     */
    @Size(max = 50, message = "租户简称长度不能超过50")
    private String shortName;

    /**
     * 联系人姓名
     */
    @NotBlank(message = "联系人姓名不能为空")
    @Size(max = 50, message = "联系人姓名长度不能超过50")
    private String contactName;

    /**
     * 联系人手机
     */
    @NotBlank(message = "联系人手机不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;

    /**
     * 联系人邮箱
     */
    @NotBlank(message = "联系人邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String contactEmail;

    /**
     * 企业地址
     */
    @Size(max = 200, message = "企业地址长度不能超过200")
    private String address;

    /**
     * 行业类型
     */
    private String industry;

    /**
     * 企业规模
     */
    private String companySize;

    /**
     * 统一社会信用代码
     */
    @Size(max = 50, message = "统一社会信用代码长度不能超过50")
    private String creditCode;

    /**
     * 套餐ID
     */
    private Long packageId;

    /**
     * 试用天数（默认14天）
     */
    private Integer trialDays = 14;

    /**
     * 备注
     */
    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}