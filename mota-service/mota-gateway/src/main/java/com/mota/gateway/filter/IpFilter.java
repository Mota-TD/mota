package com.mota.gateway.filter;

import cn.hutool.core.util.StrUtil;
import com.mota.gateway.config.IpFilterProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Pattern;

/**
 * IP黑白名单过滤器
 * 
 * 功能：
 * 1. IP白名单：只允许白名单中的IP访问
 * 2. IP黑名单：禁止黑名单中的IP访问
 * 3. 支持CIDR格式（如 192.168.1.0/24）
 * 4. 支持动态黑名单（Redis存储）
 * 5. 支持X-Forwarded-For头解析
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IpFilter implements GlobalFilter, Ordered {

    private final IpFilterProperties ipFilterProperties;
    private final ReactiveRedisTemplate<String, String> redisTemplate;

    private static final String DYNAMIC_BLACKLIST_PREFIX = "ip:blacklist:";
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String X_REAL_IP = "X-Real-IP";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!ipFilterProperties.isEnabled()) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String clientIp = getClientIp(request);

        if (StrUtil.isBlank(clientIp)) {
            log.warn("无法获取客户端IP");
            return chain.filter(exchange);
        }

        // 将客户端IP添加到请求头
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Client-IP", clientIp)
                .build();

        // 检查白名单模式
        if (ipFilterProperties.isWhitelistMode()) {
            if (!isInWhitelist(clientIp)) {
                log.warn("IP {} 不在白名单中，拒绝访问", clientIp);
                return forbidden(exchange.getResponse(), "IP地址不在允许列表中");
            }
            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        }

        // 检查静态黑名单
        if (isInBlacklist(clientIp)) {
            log.warn("IP {} 在黑名单中，拒绝访问", clientIp);
            return forbidden(exchange.getResponse(), "IP地址已被禁止访问");
        }

        // 检查动态黑名单（Redis）
        return checkDynamicBlacklist(clientIp)
                .flatMap(isBlacklisted -> {
                    if (isBlacklisted) {
                        log.warn("IP {} 在动态黑名单中，拒绝访问", clientIp);
                        return forbidden(exchange.getResponse(), "IP地址已被临时禁止访问");
                    }
                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                });
    }

    /**
     * 获取客户端真实IP
     */
    private String getClientIp(ServerHttpRequest request) {
        // 优先从X-Forwarded-For获取
        String xForwardedFor = request.getHeaders().getFirst(X_FORWARDED_FOR);
        if (StrUtil.isNotBlank(xForwardedFor)) {
            // X-Forwarded-For可能包含多个IP，取第一个
            String[] ips = xForwardedFor.split(",");
            for (String ip : ips) {
                ip = ip.trim();
                if (isValidIp(ip)) {
                    return ip;
                }
            }
        }

        // 其次从X-Real-IP获取
        String xRealIp = request.getHeaders().getFirst(X_REAL_IP);
        if (StrUtil.isNotBlank(xRealIp) && isValidIp(xRealIp)) {
            return xRealIp;
        }

        // 最后从连接获取
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null) {
            InetAddress address = remoteAddress.getAddress();
            if (address != null) {
                return address.getHostAddress();
            }
        }

        return null;
    }

    /**
     * 验证IP格式
     */
    private boolean isValidIp(String ip) {
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            return false;
        }
        // 简单的IPv4验证
        String ipv4Pattern = "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
        // IPv6验证（简化版）
        String ipv6Pattern = "^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$";
        return Pattern.matches(ipv4Pattern, ip) || Pattern.matches(ipv6Pattern, ip) || "::1".equals(ip);
    }

    /**
     * 检查是否在白名单中
     */
    private boolean isInWhitelist(String clientIp) {
        List<String> whitelist = ipFilterProperties.getWhitelist();
        if (whitelist == null || whitelist.isEmpty()) {
            return true; // 白名单为空时允许所有
        }
        return matchIpList(clientIp, whitelist);
    }

    /**
     * 检查是否在黑名单中
     */
    private boolean isInBlacklist(String clientIp) {
        List<String> blacklist = ipFilterProperties.getBlacklist();
        if (blacklist == null || blacklist.isEmpty()) {
            return false;
        }
        return matchIpList(clientIp, blacklist);
    }

    /**
     * 匹配IP列表
     */
    private boolean matchIpList(String clientIp, List<String> ipList) {
        for (String pattern : ipList) {
            if (matchIp(clientIp, pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 匹配单个IP模式
     * 支持：
     * - 精确匹配：192.168.1.1
     * - CIDR格式：192.168.1.0/24
     * - 通配符：192.168.1.*
     */
    private boolean matchIp(String clientIp, String pattern) {
        if (pattern.contains("/")) {
            // CIDR格式
            return matchCidr(clientIp, pattern);
        } else if (pattern.contains("*")) {
            // 通配符格式
            String regex = pattern.replace(".", "\\.").replace("*", "\\d+");
            return Pattern.matches(regex, clientIp);
        } else {
            // 精确匹配
            return pattern.equals(clientIp);
        }
    }

    /**
     * CIDR格式匹配
     */
    private boolean matchCidr(String clientIp, String cidr) {
        try {
            String[] parts = cidr.split("/");
            if (parts.length != 2) {
                return false;
            }
            
            String networkAddress = parts[0];
            int prefixLength = Integer.parseInt(parts[1]);
            
            long clientIpLong = ipToLong(clientIp);
            long networkIpLong = ipToLong(networkAddress);
            long mask = -1L << (32 - prefixLength);
            
            return (clientIpLong & mask) == (networkIpLong & mask);
        } catch (Exception e) {
            log.warn("CIDR匹配失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * IP转长整型
     */
    private long ipToLong(String ip) {
        String[] parts = ip.split("\\.");
        long result = 0;
        for (int i = 0; i < 4; i++) {
            result = result << 8 | Integer.parseInt(parts[i]);
        }
        return result;
    }

    /**
     * 检查动态黑名单
     */
    private Mono<Boolean> checkDynamicBlacklist(String clientIp) {
        if (redisTemplate == null) {
            return Mono.just(false);
        }
        String key = DYNAMIC_BLACKLIST_PREFIX + clientIp;
        return redisTemplate.hasKey(key)
                .onErrorReturn(false);
    }

    /**
     * 将IP加入动态黑名单
     */
    public Mono<Boolean> addToDynamicBlacklist(String ip, java.time.Duration ttl) {
        if (redisTemplate == null) {
            return Mono.just(false);
        }
        String key = DYNAMIC_BLACKLIST_PREFIX + ip;
        return redisTemplate.opsForValue()
                .set(key, "1", ttl)
                .onErrorReturn(false);
    }

    /**
     * 从动态黑名单移除IP
     */
    public Mono<Boolean> removeFromDynamicBlacklist(String ip) {
        if (redisTemplate == null) {
            return Mono.just(false);
        }
        String key = DYNAMIC_BLACKLIST_PREFIX + ip;
        return redisTemplate.delete(key)
                .map(count -> count > 0)
                .onErrorReturn(false);
    }

    /**
     * 返回禁止访问响应
     */
    private Mono<Void> forbidden(ServerHttpResponse response, String message) {
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"code\":403,\"message\":\"%s\",\"timestamp\":%d,\"success\":false}", 
                message, System.currentTimeMillis());
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        // 在认证过滤器之前执行
        return Ordered.HIGHEST_PRECEDENCE + 100;
    }
}