package com.mota.auth.service;

import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;

/**
 * 认证服务接口
 */
public interface AuthService {

    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request);

    /**
     * 用户登出
     */
    void logout(String token);

    /**
     * 刷新Token
     */
    LoginResponse refreshToken(String refreshToken);

    /**
     * 生成验证码
     */
    String generateCaptcha();
}