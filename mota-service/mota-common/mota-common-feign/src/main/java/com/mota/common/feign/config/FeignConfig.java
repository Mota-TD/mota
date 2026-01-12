package com.mota.common.feign.config;

import com.mota.common.core.constant.CommonConstants;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import feign.Logger;
import feign.RequestInterceptor;
import feign.Retryer;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Feign全局配置
 * 用于配置服务间调用的通用行为
 * 支持多租户和用户上下文传递
 *
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Configuration
public class FeignConfig {

    @Value("${feign.client.config.default.loggerLevel:BASIC}")
    private String loggerLevel;

    /**
     * Feign日志级别
     * NONE: 不记录日志
     * BASIC: 仅记录请求方法、URL、响应状态码和执行时间
     * HEADERS: 记录BASIC级别的信息，加上请求和响应头
     * FULL: 记录请求和响应的头、体和元数据
     */
    @Bean
    public Logger.Level feignLoggerLevel() {
        try {
            return Logger.Level.valueOf(loggerLevel.toUpperCase());
        } catch (Exception e) {
            return Logger.Level.BASIC;
        }
    }

    /**
     * 请求拦截器 - 传递请求头
     * 将当前请求的认证信息和上下文信息传递给下游服务
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // 1. 从当前请求中传递请求头
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                Enumeration<String> headerNames = request.getHeaderNames();
                if (headerNames != null) {
                    while (headerNames.hasMoreElements()) {
                        String name = headerNames.nextElement();
                        // 传递Authorization、X-开头的头信息
                        if (name.equalsIgnoreCase("Authorization") ||
                            name.toLowerCase().startsWith("x-")) {
                            String value = request.getHeader(name);
                            if (value != null && !value.isEmpty()) {
                                requestTemplate.header(name, value);
                            }
                        }
                    }
                }
            }

            // 2. 从上下文中补充租户信息（如果请求头中没有）
            Long tenantId = TenantContext.getTenantId();
            if (tenantId != null && !requestTemplate.headers().containsKey(CommonConstants.HEADER_TENANT_ID)) {
                requestTemplate.header(CommonConstants.HEADER_TENANT_ID, String.valueOf(tenantId));
            }

            // 3. 从上下文中补充用户信息（如果请求头中没有）
            Long userId = UserContext.getUserId();
            if (userId != null && !requestTemplate.headers().containsKey(CommonConstants.HEADER_USER_ID)) {
                requestTemplate.header(CommonConstants.HEADER_USER_ID, String.valueOf(userId));
            }

            String username = UserContext.getUsername();
            if (username != null && !requestTemplate.headers().containsKey(CommonConstants.HEADER_USERNAME)) {
                requestTemplate.header(CommonConstants.HEADER_USERNAME, encodeHeader(username));
            }

            String nickname = UserContext.getNickname();
            if (nickname != null && !requestTemplate.headers().containsKey(CommonConstants.HEADER_NICKNAME)) {
                requestTemplate.header(CommonConstants.HEADER_NICKNAME, encodeHeader(nickname));
            }

            Long deptId = UserContext.getDeptId();
            if (deptId != null && !requestTemplate.headers().containsKey(CommonConstants.HEADER_DEPT_ID)) {
                requestTemplate.header(CommonConstants.HEADER_DEPT_ID, String.valueOf(deptId));
            }

            Set<String> roles = UserContext.getRoles();
            if (roles != null && !roles.isEmpty() && !requestTemplate.headers().containsKey(CommonConstants.HEADER_ROLES)) {
                requestTemplate.header(CommonConstants.HEADER_ROLES, String.join(",", roles));
            }

            Set<String> permissions = UserContext.getPermissions();
            if (permissions != null && !permissions.isEmpty() && !requestTemplate.headers().containsKey(CommonConstants.HEADER_PERMISSIONS)) {
                requestTemplate.header(CommonConstants.HEADER_PERMISSIONS, String.join(",", permissions));
            }

            String dataScope = UserContext.getDataScope();
            if (dataScope != null && !dataScope.isEmpty() && !requestTemplate.headers().containsKey(CommonConstants.HEADER_DATA_SCOPE)) {
                requestTemplate.header(CommonConstants.HEADER_DATA_SCOPE, dataScope);
            }

            if (UserContext.isSuperAdmin() && !requestTemplate.headers().containsKey(CommonConstants.HEADER_SUPER_ADMIN)) {
                requestTemplate.header(CommonConstants.HEADER_SUPER_ADMIN, "true");
            }

            // 4. 添加请求追踪ID
            if (!requestTemplate.headers().containsKey(CommonConstants.HEADER_REQUEST_ID)) {
                requestTemplate.header(CommonConstants.HEADER_REQUEST_ID, UUID.randomUUID().toString().replace("-", ""));
            }

            log.debug("Feign请求: {} {}, 租户ID: {}, 用户ID: {}",
                    requestTemplate.method(),
                    requestTemplate.url(),
                    tenantId,
                    userId);
        };
    }

    /**
     * 错误解码器
     * 处理服务间调用的错误响应
     */
    @Bean
    public ErrorDecoder errorDecoder() {
        return new FeignErrorDecoder();
    }

    /**
     * 重试器配置
     * 配置Feign的重试策略
     */
    @Bean
    public Retryer retryer() {
        // 初始间隔100ms，最大间隔1s，最大重试次数3次
        return new Retryer.Default(100, TimeUnit.SECONDS.toMillis(1), 3);
    }

    /**
     * URL编码请求头值（处理中文）
     */
    private String encodeHeader(String value) {
        if (value == null) {
            return null;
        }
        try {
            return URLEncoder.encode(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return value;
        }
    }
}