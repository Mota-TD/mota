package com.mota.auth.service;

import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.api.auth.dto.RegisterRequest;
import com.mota.api.auth.dto.RegisterResponse;
import com.mota.auth.entity.Industry;

import java.util.List;

/**
 * 认证服务接口
 */
public interface AuthService {

    /**
     * 用户登录
     */
    LoginResponse login(LoginRequest request);

    /**
     * 用户注册
     */
    RegisterResponse register(RegisterRequest request);

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

    /**
     * 获取所有行业列表
     */
    List<Industry> getIndustryList();

    /**
     * 获取一级行业列表
     */
    List<Industry> getTopLevelIndustries();

    /**
     * 获取子行业列表
     */
    List<Industry> getChildIndustries(Long parentId);
}