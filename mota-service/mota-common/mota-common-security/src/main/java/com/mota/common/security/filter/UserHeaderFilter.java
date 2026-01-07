package com.mota.common.security.filter;

import com.mota.common.security.domain.LoginUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;

/**
 * 用户请求头过滤器
 * 从网关传递的请求头中读取用户信息，并设置到 SecurityContextHolder
 * 
 * 网关会在验证 JWT 后，将用户信息添加到以下请求头：
 * - X-User-Id: 用户ID
 * - X-Username: 用户名
 * - X-Org-Id: 组织ID
 */
@Slf4j
@Component
public class UserHeaderFilter extends OncePerRequestFilter {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USERNAME = "X-Username";
    private static final String HEADER_ORG_ID = "X-Org-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 如果已经有认证信息，跳过
        if (SecurityContextHolder.getContext().getAuthentication() != null 
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
                && SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof LoginUser) {
            filterChain.doFilter(request, response);
            return;
        }

        // 从请求头中获取用户信息
        String userIdStr = request.getHeader(HEADER_USER_ID);
        String username = request.getHeader(HEADER_USERNAME);
        String orgId = request.getHeader(HEADER_ORG_ID);

        if (StringUtils.hasText(userIdStr) && !"null".equals(userIdStr)) {
            try {
                Long userId = Long.parseLong(userIdStr);
                
                // 构建 LoginUser 对象
                LoginUser loginUser = LoginUser.builder()
                        .userId(userId)
                        .username(StringUtils.hasText(username) && !"null".equals(username) ? username : "user_" + userId)
                        .orgId(StringUtils.hasText(orgId) && !"null".equals(orgId) ? orgId : null)
                        .status(1) // 默认启用状态
                        .roles(new HashSet<>())
                        .permissions(new HashSet<>())
                        .build();

                // 创建认证令牌并设置到 SecurityContext
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                if (log.isDebugEnabled()) {
                    log.debug("从请求头设置用户信息: userId={}, username={}, orgId={}", userId, username, orgId);
                }
            } catch (NumberFormatException e) {
                log.warn("无效的用户ID格式: {}", userIdStr);
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // 请求结束后清理 SecurityContext，避免线程复用导致的问题
            SecurityContextHolder.clearContext();
        }
    }
}