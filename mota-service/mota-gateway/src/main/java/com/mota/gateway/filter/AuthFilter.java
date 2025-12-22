package com.mota.gateway.filter;

import cn.hutool.core.util.StrUtil;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 认证过滤器
 */
@Slf4j
@Component
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${gateway.white-list:}")
    private List<String> whiteList;

    public AuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 检查白名单
            if (isWhiteListed(path)) {
                return chain.filter(exchange);
            }

            // 获取Token
            String token = getToken(request);
            if (StrUtil.isBlank(token)) {
                return unauthorized(exchange.getResponse(), "未提供认证令牌");
            }

            // 验证Token
            try {
                Claims claims = parseToken(token);
                
                // 将用户信息添加到请求头
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", String.valueOf(claims.get("userId")))
                        .header("X-Username", String.valueOf(claims.get("username")))
                        .header("X-Org-Id", String.valueOf(claims.get("orgId")))
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } catch (ExpiredJwtException e) {
                log.warn("Token已过期: {}", e.getMessage());
                return unauthorized(exchange.getResponse(), "认证令牌已过期");
            } catch (JwtException e) {
                log.warn("Token无效: {}", e.getMessage());
                return unauthorized(exchange.getResponse(), "认证令牌无效");
            }
        };
    }

    /**
     * 检查是否在白名单中
     */
    private boolean isWhiteListed(String path) {
        if (whiteList == null || whiteList.isEmpty()) {
            return false;
        }
        return whiteList.stream().anyMatch(pattern -> {
            if (pattern.endsWith("/**")) {
                String prefix = pattern.substring(0, pattern.length() - 3);
                return path.startsWith(prefix);
            }
            return path.equals(pattern);
        });
    }

    /**
     * 从请求中获取Token
     */
    private String getToken(ServerHttpRequest request) {
        String authorization = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StrUtil.isNotBlank(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }

    /**
     * 解析Token
     */
    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 返回未授权响应
     */
    private Mono<Void> unauthorized(ServerHttpResponse response, String message) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format("{\"code\":401,\"message\":\"%s\",\"timestamp\":%d}", 
                message, System.currentTimeMillis());
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // 配置属性
    }
}