package com.mota.common.feign.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;

/**
 * Feign全局配置
 * 用于配置服务间调用的通用行为
 */
@Configuration
public class FeignConfig {

    /**
     * Feign日志级别
     * NONE: 不记录日志
     * BASIC: 仅记录请求方法、URL、响应状态码和执行时间
     * HEADERS: 记录BASIC级别的信息，加上请求和响应头
     * FULL: 记录请求和响应的头、体和元数据
     */
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }

    /**
     * 请求拦截器 - 传递请求头
     * 将当前请求的认证信息传递给下游服务
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                // 传递认证相关的请求头
                Enumeration<String> headerNames = request.getHeaderNames();
                if (headerNames != null) {
                    while (headerNames.hasMoreElements()) {
                        String name = headerNames.nextElement();
                        // 传递Authorization、X-User-Id、X-Enterprise-Id等头信息
                        if (name.equalsIgnoreCase("Authorization") ||
                            name.startsWith("X-") ||
                            name.equalsIgnoreCase("Content-Type")) {
                            String value = request.getHeader(name);
                            requestTemplate.header(name, value);
                        }
                    }
                }
            }
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
}