package com.mota.auth.controller;

import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.api.auth.dto.RegisterRequest;
import com.mota.api.auth.dto.RegisterResponse;
import com.mota.auth.entity.Industry;
import com.mota.auth.service.AuthService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 认证控制器
 * <p>
 * 提供用户认证相关的REST API接口，包括：
 * <ul>
 *     <li>POST /login - 用户登录</li>
 *     <li>POST /register - 用户注册</li>
 *     <li>POST /logout - 用户登出</li>
 *     <li>POST /refresh - 刷新访问令牌</li>
 *     <li>GET /captcha - 获取验证码</li>
 *     <li>GET /industries - 获取行业列表</li>
 * </ul>
 * </p>
 *
 * @author Mota
 * @since 1.0.0
 */
@Tag(name = "认证管理", description = "登录、登出、注册、刷新Token等")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    /**
     * 认证服务
     */
    private final AuthService authService;

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应，包含令牌信息
     */
    @Operation(summary = "用户登录", description = "使用用户名和密码进行登录，返回访问令牌和刷新令牌")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 注册响应，包含新用户ID
     */
    @Operation(summary = "用户注册", description = "创建新用户账户")
    @PostMapping("/register")
    public Result<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return Result.success(response);
    }

    /**
     * 用户登出
     *
     * @param authorization Authorization请求头，格式：Bearer {token}
     * @return 空响应
     */
    @Operation(summary = "用户登出", description = "使当前访问令牌失效")
    @PostMapping("/logout")
    public Result<Void> logout(
            @Parameter(description = "Bearer Token", required = true)
            @RequestHeader(value = "Authorization") String authorization) {
        // 移除Bearer前缀，提取实际令牌
        String token = authorization.replace("Bearer ", "");
        authService.logout(token);
        return Result.success();
    }

    /**
     * 刷新访问令牌
     *
     * @param request 刷新令牌请求
     * @return 新的登录响应，包含新的访问令牌
     */
    @Operation(summary = "刷新Token", description = "使用刷新令牌获取新的访问令牌")
    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return Result.success(response);
    }

    /**
     * 刷新令牌请求DTO
     * <p>
     * 用于接收刷新令牌请求的内部类
     * </p>
     */
    @lombok.Data
    public static class RefreshTokenRequest {
        /**
         * 刷新令牌
         */
        private String refreshToken;
    }

    /**
     * 获取验证码
     *
     * @return Base64编码的验证码图片
     */
    @Operation(summary = "获取验证码", description = "生成图形验证码，返回Base64编码的图片")
    @GetMapping("/captcha")
    public Result<String> getCaptcha() {
        String captcha = authService.generateCaptcha();
        return Result.success(captcha);
    }

    /**
     * 获取所有行业列表
     *
     * @return 行业列表
     */
    @Operation(summary = "获取所有行业列表", description = "返回系统中所有行业信息")
    @GetMapping("/industries")
    public Result<List<Industry>> getIndustries() {
        List<Industry> industries = authService.getIndustryList();
        return Result.success(industries);
    }

    /**
     * 获取一级行业列表
     *
     * @return 一级行业列表
     */
    @Operation(summary = "获取一级行业列表", description = "仅返回顶级行业分类")
    @GetMapping("/industries/top")
    public Result<List<Industry>> getTopLevelIndustries() {
        List<Industry> industries = authService.getTopLevelIndustries();
        return Result.success(industries);
    }

    /**
     * 获取子行业列表
     *
     * @param parentId 父行业ID
     * @return 子行业列表
     */
    @Operation(summary = "获取子行业列表", description = "根据父行业ID获取子行业")
    @GetMapping("/industries/{parentId}/children")
    public Result<List<Industry>> getChildIndustries(
            @Parameter(description = "父行业ID", required = true)
            @PathVariable Long parentId) {
        List<Industry> industries = authService.getChildIndustries(parentId);
        return Result.success(industries);
    }
}