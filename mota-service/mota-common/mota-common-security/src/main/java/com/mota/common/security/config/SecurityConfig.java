package com.mota.common.security.config;

import com.mota.common.security.filter.UserHeaderFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 通用安全配置
 * 禁用 HTTP Basic 认证，防止返回 WWW-Authenticate 头
 * 认证由网关统一处理，各微服务从请求头读取用户信息
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserHeaderFilter userHeaderFilter;

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF
            .csrf(AbstractHttpConfigurer::disable)
            // 禁用 HTTP Basic 认证，防止返回 WWW-Authenticate 头
            .httpBasic(AbstractHttpConfigurer::disable)
            // 禁用表单登录
            .formLogin(AbstractHttpConfigurer::disable)
            // 无状态会话
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 允许所有请求（认证由网关处理）
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            // 自定义异常处理，返回 JSON 而不是 WWW-Authenticate 头
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"message\":\"未授权\",\"timestamp\":" + System.currentTimeMillis() + "}");
                })
            )
            // 添加用户请求头过滤器，从网关传递的请求头中读取用户信息
            .addFilterBefore(userHeaderFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}