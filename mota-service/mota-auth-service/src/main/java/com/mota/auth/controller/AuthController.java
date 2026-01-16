package com.mota.auth.controller;

import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.api.auth.dto.RegisterRequest;
import com.mota.api.auth.dto.RegisterResponse;
import com.mota.auth.entity.Industry;
import com.mota.auth.service.AuthService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 认证控制器
 */
@Tag(name = "认证管理", description = "登录、登出、注册、刷新Token等")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public Result<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return Result.success(response);
    }

    @Operation(summary = "用户登出")
    @PostMapping("/logout")
    public Result<Void> logout(@RequestHeader(value = "Authorization") String authorization) {
        String token = authorization.replace("Bearer ", "");
        authService.logout(token);
        return Result.success();
    }

    @Operation(summary = "刷新Token")
    @PostMapping("/refresh")
    public Result<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return Result.success(response);
    }
    
    // 内部类用于接收刷新token请求
    @lombok.Data
    public static class RefreshTokenRequest {
        private String refreshToken;
    }

    @Operation(summary = "获取验证码")
    @GetMapping("/captcha")
    public Result<String> getCaptcha() {
        String captcha = authService.generateCaptcha();
        return Result.success(captcha);
    }

    @Operation(summary = "获取所有行业列表")
    @GetMapping("/industries")
    public Result<List<Industry>> getIndustries() {
        List<Industry> industries = authService.getIndustryList();
        return Result.success(industries);
    }

    @Operation(summary = "获取一级行业列表")
    @GetMapping("/industries/top")
    public Result<List<Industry>> getTopLevelIndustries() {
        List<Industry> industries = authService.getTopLevelIndustries();
        return Result.success(industries);
    }

    @Operation(summary = "获取子行业列表")
    @GetMapping("/industries/{parentId}/children")
    public Result<List<Industry>> getChildIndustries(@PathVariable Long parentId) {
        List<Industry> industries = authService.getChildIndustries(parentId);
        return Result.success(industries);
    }
}