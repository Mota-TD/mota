package com.mota.api.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * 登录请求DTO
 * <p>
 * 用户登录时提交的数据传输对象，支持用户名、邮箱或手机号登录。
 * </p>
 *
 * @author Mota
 * @since 1.0.0
 */
@Data
@Schema(description = "登录请求")
public class LoginRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 登录账号
     * <p>
     * 支持用户名、邮箱或手机号
     * </p>
     */
    @Schema(description = "用户名/邮箱/手机号", example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "用户名不能为空")
    private String username;

    /**
     * 登录密码
     */
    @Schema(description = "密码", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "密码不能为空")
    private String password;

    /**
     * 图形验证码
     * <p>
     * 用户输入的验证码内容
     * </p>
     */
    @Schema(description = "验证码", example = "a1b2")
    private String captcha;

    /**
     * 验证码标识
     * <p>
     * 用于服务端校验验证码的唯一标识
     * </p>
     */
    @Schema(description = "验证码Key", example = "uuid-xxxx-xxxx")
    private String captchaKey;

    /**
     * 是否记住登录状态
     * <p>
     * 设置为true时，刷新令牌有效期延长
     * </p>
     */
    @Schema(description = "记住我", defaultValue = "false")
    private Boolean rememberMe = false;
}