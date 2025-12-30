package com.mota.gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT配置属性
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    
    /**
     * JWT密钥
     */
    private String secret;
    
    /**
     * Token过期时间（毫秒）
     */
    private Long expiration;
    
    /**
     * 刷新Token过期时间（毫秒）
     */
    private Long refreshExpiration;
}