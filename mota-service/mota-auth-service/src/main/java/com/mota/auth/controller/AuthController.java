package com.mota.auth.controller;

import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.auth.entity.User;
import com.mota.auth.mapper.UserMapper;
import com.mota.auth.service.AuthService;
import com.mota.common.core.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@Tag(name = "认证管理", description = "登录、登出、刷新Token等")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
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
    public Result<LoginResponse> refresh(@RequestParam(value = "refreshToken") String refreshToken) {
        LoginResponse response = authService.refreshToken(refreshToken);
        return Result.success(response);
    }

    @Operation(summary = "获取验证码")
    @GetMapping("/captcha")
    public Result<String> getCaptcha() {
        String captcha = authService.generateCaptcha();
        return Result.success(captcha);
    }

    @Operation(summary = "测试密码编码（仅开发环境）")
    @GetMapping("/test-password")
    public Result<Map<String, Object>> testPassword(@RequestParam(value = "password") String password) {
        Map<String, Object> result = new HashMap<>();
        
        // 生成新的BCrypt哈希
        String encodedPassword = passwordEncoder.encode(password);
        result.put("encodedPassword", encodedPassword);
        
        // 从数据库获取admin用户
        User user = userMapper.findByUsername("admin");
        if (user != null) {
            result.put("dbPasswordHash", user.getPasswordHash());
            result.put("passwordMatches", passwordEncoder.matches(password, user.getPasswordHash()));
        } else {
            result.put("error", "User not found");
        }
        
        return Result.success(result);
    }
}