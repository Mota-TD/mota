package com.mota.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * 网关CORS配置
 *
 * 配置跨域资源共享(CORS)，允许前端应用跨域访问API
 *
 * @author Mota
 * @since 1.0.0
 */
@Configuration
public class CorsConfig {

    /**
     * CORS预检请求缓存时间（1小时，秒）
     */
    private static final long CORS_MAX_AGE = 3600L;

    /**
     * 创建CORS过滤器
     *
     * @return CorsWebFilter实例
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许所有来源（生产环境应限制具体域名）
        config.addAllowedOriginPattern("*");
        
        // 允许所有HTTP方法
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // 允许所有请求头
        config.addAllowedHeader("*");
        
        // 允许携带凭证（cookies等）
        config.setAllowCredentials(true);
        
        // 暴露所有响应头
        config.addExposedHeader("*");
        
        // 预检请求的缓存时间
        config.setMaxAge(CORS_MAX_AGE);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsWebFilter(source);
    }
}