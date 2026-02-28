package com.mota.auth.config;

import com.mota.common.core.constant.CommonConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * 认证服务安全配置
 *
 * 此配置优先于 mota-common-security 的配置
 * 认证服务不需要从请求头读取用户信息，因为它是生成用户信息的服务
 */
@Configuration("authSecurityConfig")
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(CommonConstants.CORS_MAX_AGE);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @Primary
    @Order(1)  // 高优先级，确保此配置优先于 common 的配置
    public SecurityFilterChain authSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // 启用CORS并使用自定义配置源，确保跨域请求能被正确处理
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // 禁用 HTTP Basic 认证，防止返回 WWW-Authenticate 头
            .httpBasic(AbstractHttpConfigurer::disable)
            // 禁用表单登录
            .formLogin(AbstractHttpConfigurer::disable)
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/doc.html").permitAll()
                .requestMatchers("/webjars/**").permitAll()
                .requestMatchers("/swagger-resources/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/favicon.ico").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            // 自定义异常处理，返回 JSON 而不是 WWW-Authenticate 头
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"code\":401,\"message\":\"未授权\",\"timestamp\":" + System.currentTimeMillis() + "}");
                })
            );
        
        return http.build();
    }
}