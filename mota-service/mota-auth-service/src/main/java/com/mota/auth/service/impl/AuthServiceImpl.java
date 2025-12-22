package com.mota.auth.service.impl;

import cn.hutool.core.util.IdUtil;
import com.mota.api.auth.dto.LoginRequest;
import com.mota.api.auth.dto.LoginResponse;
import com.mota.auth.entity.User;
import com.mota.auth.mapper.UserMapper;
import com.mota.auth.service.AuthService;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.result.ResultCode;
import com.mota.common.redis.service.RedisService;
import com.mota.common.security.util.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 认证服务实现
 */
@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    
    // Optional Redis service - may be null in standalone mode
    private final RedisService redisService;
    
    // In-memory fallback for standalone mode (when Redis is not available)
    private final Map<String, String> tokenBlacklist = new ConcurrentHashMap<>();
    private final Map<String, String> captchaStore = new ConcurrentHashMap<>();

    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";
    private static final String CAPTCHA_PREFIX = "captcha:";

    @Autowired
    public AuthServiceImpl(UserMapper userMapper, 
                          JwtUtils jwtUtils, 
                          PasswordEncoder passwordEncoder,
                          @Autowired(required = false) RedisService redisService) {
        this.userMapper = userMapper;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.redisService = redisService;
        
        if (redisService == null) {
            log.warn("RedisService is not available, using in-memory storage for tokens and captcha");
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 查询用户
        User user = userMapper.findByUsername(request.getUsername());
        if (user == null) {
            user = userMapper.findByEmail(request.getUsername());
        }
        if (user == null) {
            user = userMapper.findByPhone(request.getUsername());
        }
        if (user == null) {
            throw new BusinessException(ResultCode.USERNAME_OR_PASSWORD_ERROR);
        }

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.USERNAME_OR_PASSWORD_ERROR);
        }

        // 检查账号状态
        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.ACCOUNT_DISABLED);
        }

        // 生成Token
        String accessToken = jwtUtils.generateAccessToken(
                user.getId(), 
                user.getUsername(), 
                user.getOrgId()
        );
        String refreshToken = jwtUtils.generateRefreshToken(
                user.getId(), 
                user.getUsername()
        );

        // 更新最后登录时间
        userMapper.updateLastLoginTime(user.getId());

        // 构建响应
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .orgId(user.getOrgId())
                .orgName(user.getOrgName())
                .build();
    }

    @Override
    public void logout(String token) {
        // 将Token加入黑名单
        long expiration = jwtUtils.getExpirationFromToken(token).getTime() - System.currentTimeMillis();
        if (expiration > 0) {
            if (redisService != null) {
                redisService.setEx(TOKEN_BLACKLIST_PREFIX + token, "1", expiration / 1000);
            } else {
                // Fallback to in-memory storage
                tokenBlacklist.put(TOKEN_BLACKLIST_PREFIX + token, "1");
            }
        }
        log.info("用户登出成功");
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        // 验证刷新Token
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        // 检查Token类型
        String tokenType = jwtUtils.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }

        // 获取用户信息
        Long userId = jwtUtils.getUserIdFromToken(refreshToken);
        String username = jwtUtils.getUsernameFromToken(refreshToken);

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 生成新Token
        String newAccessToken = jwtUtils.generateAccessToken(
                user.getId(), 
                user.getUsername(), 
                user.getOrgId()
        );
        String newRefreshToken = jwtUtils.generateRefreshToken(
                user.getId(), 
                user.getUsername()
        );

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .orgId(user.getOrgId())
                .orgName(user.getOrgName())
                .build();
    }

    @Override
    public String generateCaptcha() {
        String captchaKey = IdUtil.fastSimpleUUID();
        String captchaCode = IdUtil.fastSimpleUUID().substring(0, 4).toUpperCase();
        
        if (redisService != null) {
            // 存储验证码，5分钟有效
            redisService.setEx(CAPTCHA_PREFIX + captchaKey, captchaCode, 300);
        } else {
            // Fallback to in-memory storage
            captchaStore.put(CAPTCHA_PREFIX + captchaKey, captchaCode);
        }
        
        // 返回验证码Key（实际应返回图片Base64）
        return captchaKey;
    }
    
    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        if (redisService != null) {
            return redisService.hasKey(TOKEN_BLACKLIST_PREFIX + token);
        } else {
            return tokenBlacklist.containsKey(TOKEN_BLACKLIST_PREFIX + token);
        }
    }
    
    /**
     * Validate captcha
     */
    public boolean validateCaptcha(String captchaKey, String captchaCode) {
        String storedCode;
        if (redisService != null) {
            storedCode = redisService.get(CAPTCHA_PREFIX + captchaKey);
            if (storedCode != null) {
                redisService.delete(CAPTCHA_PREFIX + captchaKey);
            }
        } else {
            storedCode = captchaStore.remove(CAPTCHA_PREFIX + captchaKey);
        }
        return storedCode != null && storedCode.equalsIgnoreCase(captchaCode);
    }
}