package com.mota.api.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 登录响应DTO
 * <p>
 * 用户登录成功后返回的数据传输对象，包含令牌信息和基本用户信息。
 * </p>
 *
 * <p>使用示例：</p>
 * <pre>{@code
 * LoginResponse response = LoginResponse.builder()
 *     .accessToken(token)
 *     .refreshToken(refreshToken)
 *     .expiresIn(86400L)
 *     .userId(user.getId())
 *     .username(user.getUsername())
 *     .build();
 * }</pre>
 *
 * @author Mota
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "登录响应")
public class LoginResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * JWT访问令牌
     * <p>
     * 用于API请求认证，放在Authorization请求头中
     * </p>
     */
    @Schema(description = "访问令牌", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    /**
     * 刷新令牌
     * <p>
     * 用于获取新的访问令牌，有效期较长
     * </p>
     */
    @Schema(description = "刷新令牌", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    /**
     * 令牌类型
     * <p>
     * 固定值为"Bearer"，使用时需在Authorization头中添加此前缀
     * </p>
     */
    @Schema(description = "令牌类型", example = "Bearer", defaultValue = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    /**
     * 访问令牌过期时间（秒）
     * <p>
     * 从当前时间算起，令牌有效的秒数
     * </p>
     */
    @Schema(description = "过期时间（秒）", example = "86400")
    private Long expiresIn;

    /**
     * 用户唯一标识
     */
    @Schema(description = "用户ID", example = "1")
    private Long userId;

    /**
     * 登录用户名
     */
    @Schema(description = "用户名", example = "admin")
    private String username;

    /**
     * 用户昵称
     * <p>
     * 用于界面显示
     * </p>
     */
    @Schema(description = "昵称", example = "管理员")
    private String nickname;

    /**
     * 用户头像URL
     */
    @Schema(description = "头像", example = "https://example.com/avatar.jpg")
    private String avatar;

    /**
     * 所属组织ID
     */
    @Schema(description = "组织ID", example = "org_001")
    private String orgId;

    /**
     * 所属组织名称
     */
    @Schema(description = "组织名称", example = "默认组织")
    private String orgName;
}