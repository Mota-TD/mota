package com.mota.api.auth.dto;

import com.mota.common.core.validation.Password;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * 注册请求
 */
@Data
@Schema(description = "注册请求")
public class RegisterRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "用户名", example = "张三")
    @NotBlank(message = "用户名不能为空")
    @Size(min = 1, max = 16, message = "用户名长度必须在1-16个字之间")
    private String username;

    @Schema(description = "手机号", example = "13800138000")
    @NotBlank(message = "手机号不能为空")
    private String phone;

    @Schema(description = "邮箱", example = "zhangsan@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;

    @Schema(description = "密码（至少8位，需包含大写字母、小写字母和数字）", example = "Password123")
    @NotBlank(message = "密码不能为空")
    @Password(minLength = 8, maxLength = 50, requireUpperCase = true, requireLowerCase = true, requireDigit = true, requireSpecialChar = false)
    private String password;

    @Schema(description = "确认密码", example = "password123")
    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;

    @Schema(description = "企业名称", example = "摩塔科技有限公司")
    @NotBlank(message = "企业名称不能为空")
    @Size(min = 2, max = 200, message = "企业名称长度必须在2-200个字符之间")
    private String enterpriseName;

    @Schema(description = "行业ID", example = "1")
    @NotNull(message = "请选择所属行业")
    private Long industryId;

    @Schema(description = "验证码")
    private String captcha;

    @Schema(description = "验证码Key")
    private String captchaKey;

    @Schema(description = "邀请码（可选，用于加入已有企业）")
    private String inviteCode;
}