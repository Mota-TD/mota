package com.mota.api.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * 登录请求
 */
@Data
@Schema(description = "登录请求")
public class LoginRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "用户名/邮箱/手机号", example = "admin")
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Schema(description = "密码", example = "123456")
    @NotBlank(message = "密码不能为空")
    private String password;

    @Schema(description = "验证码")
    private String captcha;

    @Schema(description = "验证码Key")
    private String captchaKey;

    @Schema(description = "记住我")
    private Boolean rememberMe = false;
}