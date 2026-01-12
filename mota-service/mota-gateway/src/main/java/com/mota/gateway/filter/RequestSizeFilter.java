package com.mota.gateway.filter;

import com.mota.gateway.config.RequestSizeProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * 请求体大小限制过滤器
 * 
 * 功能：
 * 1. 全局请求体大小限制
 * 2. 路径级别的大小限制配置
 * 3. 文件上传路径特殊处理
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RequestSizeFilter implements GlobalFilter, Ordered {

    private final RequestSizeProperties requestSizeProperties;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!requestSizeProperties.isEnabled()) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String contentType = request.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        
        // 获取Content-Length
        long contentLength = request.getHeaders().getContentLength();
        
        // 如果没有Content-Length头，对于某些请求类型可能需要特殊处理
        if (contentLength == -1) {
            // 对于分块传输编码，暂时放行
            String transferEncoding = request.getHeaders().getFirst(HttpHeaders.TRANSFER_ENCODING);
            if ("chunked".equalsIgnoreCase(transferEncoding)) {
                log.debug("分块传输编码请求，跳过大小检查: {}", path);
                return chain.filter(exchange);
            }
            // 没有请求体的请求直接放行
            return chain.filter(exchange);
        }

        // 获取该路径的最大允许大小
        long maxSize = getMaxSizeForPath(path, contentType);
        
        if (contentLength > maxSize) {
            log.warn("请求体大小 {} 超过限制 {} (路径: {})", 
                    formatSize(contentLength), formatSize(maxSize), path);
            return payloadTooLarge(exchange.getResponse(), maxSize);
        }

        log.debug("请求体大小检查通过: {} <= {} (路径: {})", 
                formatSize(contentLength), formatSize(maxSize), path);
        return chain.filter(exchange);
    }

    /**
     * 获取指定路径的最大请求体大小
     */
    private long getMaxSizeForPath(String path, String contentType) {
        // 检查路径级别的配置
        Map<String, Long> pathLimits = requestSizeProperties.getPathLimits();
        if (pathLimits != null && !pathLimits.isEmpty()) {
            for (Map.Entry<String, Long> entry : pathLimits.entrySet()) {
                if (pathMatcher.match(entry.getKey(), path)) {
                    return entry.getValue();
                }
            }
        }

        // 检查是否是文件上传请求
        if (isFileUploadRequest(path, contentType)) {
            return requestSizeProperties.getMaxFileUploadSize();
        }

        // 返回默认限制
        return requestSizeProperties.getMaxRequestSize();
    }

    /**
     * 判断是否是文件上传请求
     */
    private boolean isFileUploadRequest(String path, String contentType) {
        // 检查Content-Type
        if (contentType != null && contentType.toLowerCase().contains("multipart/form-data")) {
            return true;
        }

        // 检查路径
        List<String> uploadPaths = requestSizeProperties.getFileUploadPaths();
        if (uploadPaths != null) {
            for (String uploadPath : uploadPaths) {
                if (pathMatcher.match(uploadPath, path)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 格式化文件大小
     */
    private String formatSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else if (bytes < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", bytes / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
        }
    }

    /**
     * 返回请求体过大响应
     */
    private Mono<Void> payloadTooLarge(ServerHttpResponse response, long maxSize) {
        response.setStatusCode(HttpStatus.PAYLOAD_TOO_LARGE);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"code\":413,\"message\":\"请求体大小超过限制，最大允许 %s\",\"timestamp\":%d,\"success\":false}", 
                formatSize(maxSize), System.currentTimeMillis());
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        // 在IP过滤器之后，认证过滤器之前执行
        return Ordered.HIGHEST_PRECEDENCE + 200;
    }
}