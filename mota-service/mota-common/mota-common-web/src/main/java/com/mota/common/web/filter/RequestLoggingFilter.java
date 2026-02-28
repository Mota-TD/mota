package com.mota.common.web.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * 请求日志过滤器
 * 
 * 记录所有HTTP请求的详细信息，包括：
 * - 请求URL、方法、参数
 * - 请求头（可选）
 * - 请求体（可选，对于POST/PUT请求）
 * - 响应状态码
 * - 请求处理时间
 * 
 * 可通过配置 mota.logging.request.enabled=false 禁用
 *
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@ConditionalOnProperty(name = "mota.logging.request.enabled", havingValue = "true", matchIfMissing = true)
public class RequestLoggingFilter implements Filter {

    /**
     * 不记录日志的路径前缀
     */
    private static final Set<String> EXCLUDED_PATHS = Set.of(
            "/actuator",
            "/health",
            "/favicon.ico",
            "/swagger",
            "/v3/api-docs",
            "/webjars"
    );

    /**
     * 敏感请求头（不记录）
     */
    private static final Set<String> SENSITIVE_HEADERS = Set.of(
            "authorization",
            "cookie",
            "x-api-key",
            "x-auth-token"
    );

    /**
     * 最大请求体记录长度
     */
    private static final int MAX_BODY_LENGTH = 2048;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 检查是否排除的路径
        String path = httpRequest.getRequestURI();
        if (isExcludedPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        // 包装请求和响应以支持多次读取
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(httpRequest);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(httpResponse);

        // 获取请求追踪ID
        String traceId = getTraceId(httpRequest);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 记录请求开始
            logRequest(wrappedRequest, traceId);
            
            // 执行请求
            chain.doFilter(wrappedRequest, wrappedResponse);
            
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // 记录请求完成
            logResponse(wrappedRequest, wrappedResponse, traceId, duration);
            
            // 将响应内容写回
            wrappedResponse.copyBodyToResponse();
        }
    }

    /**
     * 检查是否排除的路径
     */
    private boolean isExcludedPath(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    /**
     * 获取请求追踪ID
     */
    private String getTraceId(HttpServletRequest request) {
        String traceId = request.getHeader("X-Request-Id");
        if (!StringUtils.hasText(traceId)) {
            traceId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }
        return traceId;
    }

    /**
     * 记录请求信息
     */
    private void logRequest(ContentCachingRequestWrapper request, String traceId) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIp(request);
        String userId = request.getHeader("X-User-Id");
        
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(traceId).append("] ");
        sb.append(">>> ").append(method).append(" ").append(uri);
        
        if (StringUtils.hasText(queryString)) {
            sb.append("?").append(queryString);
        }
        
        sb.append(" | IP: ").append(clientIp);
        
        if (StringUtils.hasText(userId)) {
            sb.append(" | User: ").append(userId);
        }
        
        log.info(sb.toString());
        
        // 调试级别记录请求头
        if (log.isDebugEnabled()) {
            logRequestHeaders(request, traceId);
        }
    }

    /**
     * 记录请求头
     */
    private void logRequestHeaders(HttpServletRequest request, String traceId) {
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(traceId).append("] Headers: {");
        
        Enumeration<String> headerNames = request.getHeaderNames();
        boolean first = true;
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = SENSITIVE_HEADERS.contains(headerName.toLowerCase()) 
                    ? "***" 
                    : request.getHeader(headerName);
            
            if (!first) {
                sb.append(", ");
            }
            sb.append(headerName).append("=").append(headerValue);
            first = false;
        }
        sb.append("}");
        
        log.debug(sb.toString());
    }

    /**
     * 记录响应信息
     */
    private void logResponse(ContentCachingRequestWrapper request, 
                             ContentCachingResponseWrapper response, 
                             String traceId, 
                             long duration) {
        int status = response.getStatus();
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(traceId).append("] ");
        sb.append("<<< ").append(method).append(" ").append(uri);
        sb.append(" | Status: ").append(status);
        sb.append(" | Duration: ").append(duration).append("ms");
        
        // 根据响应状态使用不同的日志级别
        if (status >= 500) {
            log.error(sb.toString());
            // 记录请求体以便调试
            logRequestBody(request, traceId);
        } else if (status >= 400) {
            log.warn(sb.toString());
        } else {
            log.info(sb.toString());
        }
        
        // 慢请求警告（超过3秒）
        if (duration > 3000) {
            log.warn("[{}] 慢请求警告: {} {} 耗时 {}ms", traceId, method, uri, duration);
        }
    }

    /**
     * 记录请求体
     */
    private void logRequestBody(ContentCachingRequestWrapper request, String traceId) {
        byte[] content = request.getContentAsByteArray();
        if (content.length > 0) {
            String contentType = request.getContentType();
            if (contentType != null && contentType.contains("application/json")) {
                String body = new String(content, StandardCharsets.UTF_8);
                if (body.length() > MAX_BODY_LENGTH) {
                    body = body.substring(0, MAX_BODY_LENGTH) + "...(truncated)";
                }
                log.debug("[{}] Request Body: {}", traceId, body);
            }
        }
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 对于多级代理，取第一个IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}