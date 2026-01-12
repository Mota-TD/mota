package com.mota.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * JWT配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    
    /**
     * JWT密钥（Base64编码，至少256位）
     */
    private String secret = "bW90YS1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tZ2VuZXJhdGlvbi1tdXN0LWJlLWF0LWxlYXN0LTI1Ni1iaXRz";
    
    /**
     * Access Token过期时间（毫秒），默认24小时
     */
    private Long expiration = 86400000L;
    
    /**
     * Refresh Token过期时间（毫秒），默认7天
     */
    private Long refreshExpiration = 604800000L;
    
    /**
     * Token签发者
     */
    private String issuer = "mota";
    
    /**
     * 白名单路径列表（不需要认证的路径）
     * 支持通配符：
     * - /api/v1/auth/** 匹配 /api/v1/auth/ 下的所有路径
     * - /api/v1/public/* 匹配 /api/v1/public/ 下的一级路径
     */
    private List<String> whiteList = new ArrayList<>();
}