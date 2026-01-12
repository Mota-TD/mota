package com.mota.gateway.filter;

import cn.hutool.core.util.StrUtil;
import com.mota.gateway.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

/**
 * JWT认证过滤器
 * 
 * 功能：
 * 1. JWT Token验证
 * 2. 白名单路径放行
 * 3. Token黑名单检查（用于登出）
 * 4. 用户信息传递到下游服务
 * 5. 租户ID传递（多租户支持）
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthFilter extends AbstractGatewayFilterFactory<AuthFilter.Config> {

    private final JwtProperties jwtProperties;
    private final ReactiveRedisTemplate<String, String> redisTemplate;

    private static final String TOKEN_BLACKLIST_PREFIX = "token:blacklist:";
    private static final String USER_TOKEN_PREFIX = "user:token:";

    public AuthFilter() {
        super(Config.class);
        this.jwtProperties = null;
        this.redisTemplate = null;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 检查白名单
            if (isWhiteListed(path)) {
                log.debug("路径 {} 在白名单中，跳过认证", path);
                return chain.filter(exchange);
            }

            // 获取Token
            String token = getToken(request);
            if (StrUtil.isBlank(token)) {
                log.warn("请求 {} 未提供认证令牌", path);
                return unauthorized(exchange.getResponse(), "未提供认证令牌");
            }

            // 检查Token是否在黑名单中（用于登出场景）
            return checkTokenBlacklist(token)
                    .flatMap(isBlacklisted -> {
                        if (isBlacklisted) {
                            log.warn("Token已被加入黑名单");
                            return unauthorized(exchange.getResponse(), "认证令牌已失效");
                        }
                        
                        // 验证Token
                        try {
                            Claims claims = parseToken(token);
                            
                            // 检查Token类型
                            String tokenType = claims.get("type", String.class);
                            if (!"access".equals(tokenType)) {
                                log.warn("Token类型不正确: {}", tokenType);
                                return unauthorized(exchange.getResponse(), "认证令牌类型不正确");
                            }
                            
                            // 获取用户信息
                            Object userIdObj = claims.get("userId");
                            Object usernameObj = claims.get("username");
                            Object orgIdObj = claims.get("orgId");
                            Object tenantIdObj = claims.get("tenantId");
                            Object rolesObj = claims.get("roles");
                            
                            String userId = userIdObj != null ? String.valueOf(userIdObj) : "";
                            String username = usernameObj != null ? String.valueOf(usernameObj) : "";
                            String orgId = orgIdObj != null ? String.valueOf(orgIdObj) : "";
                            String tenantId = tenantIdObj != null ? String.valueOf(tenantIdObj) : "";
                            String roles = rolesObj != null ? String.valueOf(rolesObj) : "";
                            
                            // 将用户信息添加到请求头，传递给下游服务
                            ServerHttpRequest mutatedRequest = request.mutate()
                                    .header("X-User-Id", userId)
                                    .header("X-Username", username)
                                    .header("X-Org-Id", orgId)
                                    .header("X-Tenant-Id", tenantId)
                                    .header("X-User-Roles", roles)
                                    .header("X-Request-Id", generateRequestId())
                                    .build();

                            log.debug("用户 {} (ID: {}) 访问 {}", username, userId, path);
                            return chain.filter(exchange.mutate().request(mutatedRequest).build());
                        } catch (ExpiredJwtException e) {
                            log.warn("Token已过期: {}", e.getMessage());
                            return unauthorized(exchange.getResponse(), "认证令牌已过期");
                        } catch (JwtException e) {
                            log.warn("Token无效: {}", e.getMessage());
                            return unauthorized(exchange.getResponse(), "认证令牌无效");
                        }
                    });
        };
    }

    /**
     * 检查Token是否在黑名单中
     */
    private Mono<Boolean> checkTokenBlacklist(String token) {
        if (redisTemplate == null) {
            return Mono.just(false);
        }
        String key = TOKEN_BLACKLIST_PREFIX + token.hashCode();
        return redisTemplate.hasKey(key)
                .onErrorReturn(false);
    }

    /**
     * 将Token加入黑名单（用于登出）
     */
    public Mono<Boolean> addToBlacklist(String token, Duration ttl) {
        if (redisTemplate == null) {
            return Mono.just(false);
        }
        String key = TOKEN_BLACKLIST_PREFIX + token.hashCode();
        return redisTemplate.opsForValue()
                .set(key, "1", ttl)
                .onErrorReturn(false);
    }

    /**
     * 检查是否在白名单中
     */
    private boolean isWhiteListed(String path) {
        List<String> whiteList = jwtProperties != null ? jwtProperties.getWhiteList() : null;
        if (whiteList == null || whiteList.isEmpty()) {
            return false;
        }
        return whiteList.stream().anyMatch(pattern -> {
            if (pattern.endsWith("/**")) {
                String prefix = pattern.substring(0, pattern.length() - 3);
                return path.startsWith(prefix);
            } else if (pattern.contains("*")) {
                // 支持简单的通配符匹配
                String regex = pattern.replace("*", ".*");
                return path.matches(regex);
            }
            return path.equals(pattern);
        });
    }

    /**
     * 从请求中获取Token
     */
    private String getToken(ServerHttpRequest request) {
        // 优先从Authorization头获取
        String authorization = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (StrUtil.isNotBlank(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        
        // 其次从查询参数获取（用于WebSocket等场景）
        String tokenParam = request.getQueryParams().getFirst("token");
        if (StrUtil.isNotBlank(tokenParam)) {
            return tokenParam;
        }
        
        // 最后从Cookie获取
        if (request.getCookies().containsKey("access_token")) {
            return request.getCookies().getFirst("access_token").getValue();
        }
        
        return null;
    }

    /**
     * 解析Token
     */
    private Claims parseToken(String token) {
        String secret = jwtProperties != null ? jwtProperties.getSecret() : 
                "bW90YS1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tZ2VuZXJhdGlvbi1tdXN0LWJlLWF0LWxlYXN0LTI1Ni1iaXRz";
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 生成请求ID
     */
    private String generateRequestId() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 返回未授权响应
     */
    private Mono<Void> unauthorized(ServerHttpResponse response, String message) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"code\":401,\"message\":\"%s\",\"timestamp\":%d,\"success\":false}", 
                message, System.currentTimeMillis());
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // 配置属性（可扩展）
    }
}