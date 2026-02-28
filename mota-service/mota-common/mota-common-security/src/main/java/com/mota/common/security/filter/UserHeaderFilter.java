package com.mota.common.security.filter;

import com.mota.common.core.constant.CommonConstants;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.security.domain.LoginUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 用户请求头过滤器
 * 从网关传递的请求头中读取用户信息，并设置到 SecurityContextHolder、UserContext、TenantContext
 *
 * 网关会在验证 JWT 后，将用户信息添加到以下请求头：
 * - X-Tenant-Id: 租户ID
 * - X-User-Id: 用户ID
 * - X-Username: 用户名
 * - X-Nickname: 用户昵称
 * - X-Dept-Id: 部门ID
 * - X-Roles: 角色列表（逗号分隔）
 * - X-Permissions: 权限列表（逗号分隔）
 * - X-Data-Scope: 数据权限范围
 * - X-Super-Admin: 是否超级管理员
 *
 * 注意：此过滤器可通过配置 mota.security.user-header-filter.enabled=false 禁用
 * 认证服务（auth-service）应禁用此过滤器，因为它是生成用户信息的服务
 *
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "mota.security.user-header-filter.enabled", havingValue = "true", matchIfMissing = true)
public class UserHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            // 设置租户上下文
            setupTenantContext(request);
            
            // 设置用户上下文
            setupUserContext(request);
            
            // 设置 Spring Security 上下文
            setupSecurityContext(request);
            
            filterChain.doFilter(request, response);
        } finally {
            // 请求结束后清理所有上下文，避免线程复用导致的问题
            TenantContext.clear();
            UserContext.clear();
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * 设置租户上下文
     */
    private void setupTenantContext(HttpServletRequest request) {
        String tenantIdStr = request.getHeader(CommonConstants.HEADER_TENANT_ID);
        if (StringUtils.hasText(tenantIdStr) && !"null".equals(tenantIdStr)) {
            try {
                Long tenantId = Long.parseLong(tenantIdStr);
                TenantContext.setTenantId(tenantId);
                if (log.isDebugEnabled()) {
                    log.debug("设置租户上下文: tenantId={}", tenantId);
                }
            } catch (NumberFormatException e) {
                log.warn("无效的租户ID格式: {}", tenantIdStr);
            }
        }
    }

    /**
     * 设置用户上下文
     */
    private void setupUserContext(HttpServletRequest request) {
        String userIdStr = request.getHeader(CommonConstants.HEADER_USER_ID);
        if (!StringUtils.hasText(userIdStr) || "null".equals(userIdStr)) {
            return;
        }

        try {
            Long userId = Long.parseLong(userIdStr);
            String username = getDecodedHeader(request, CommonConstants.HEADER_USERNAME);
            String nickname = getDecodedHeader(request, CommonConstants.HEADER_NICKNAME);
            String deptIdStr = request.getHeader(CommonConstants.HEADER_DEPT_ID);
            String rolesStr = request.getHeader(CommonConstants.HEADER_ROLES);
            String permissionsStr = request.getHeader(CommonConstants.HEADER_PERMISSIONS);
            String dataScopeStr = request.getHeader(CommonConstants.HEADER_DATA_SCOPE);
            String superAdminStr = request.getHeader(CommonConstants.HEADER_SUPER_ADMIN);

            // 设置用户ID
            UserContext.setUserId(userId);

            // 设置用户名
            if (StringUtils.hasText(username) && !"null".equals(username)) {
                UserContext.setUsername(username);
            }

            // 设置昵称
            if (StringUtils.hasText(nickname) && !"null".equals(nickname)) {
                UserContext.setNickname(nickname);
            }

            // 设置部门ID
            if (StringUtils.hasText(deptIdStr) && !"null".equals(deptIdStr)) {
                try {
                    UserContext.setDeptId(Long.parseLong(deptIdStr));
                } catch (NumberFormatException e) {
                    log.warn("无效的部门ID格式: {}", deptIdStr);
                }
            }

            // 设置角色
            if (StringUtils.hasText(rolesStr) && !"null".equals(rolesStr)) {
                Set<String> roles = Arrays.stream(rolesStr.split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .collect(Collectors.toSet());
                UserContext.setRoles(roles);
            }

            // 设置权限
            if (StringUtils.hasText(permissionsStr) && !"null".equals(permissionsStr)) {
                Set<String> permissions = Arrays.stream(permissionsStr.split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .collect(Collectors.toSet());
                UserContext.setPermissions(permissions);
            }

            // 设置数据权限范围
            if (StringUtils.hasText(dataScopeStr) && !"null".equals(dataScopeStr)) {
                UserContext.setDataScope(dataScopeStr);
            }

            // 设置超级管理员标识
            if (StringUtils.hasText(superAdminStr)) {
                UserContext.setSuperAdmin(Boolean.parseBoolean(superAdminStr));
            }

            if (log.isDebugEnabled()) {
                log.debug("设置用户上下文: userId={}, username={}, deptId={}", userId, username, deptIdStr);
            }
        } catch (NumberFormatException e) {
            log.warn("无效的用户ID格式: {}", userIdStr);
        }
    }

    /**
     * 设置 Spring Security 上下文
     */
    private void setupSecurityContext(HttpServletRequest request) {
        // 如果已经有认证信息，跳过
        if (SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()
                && SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof LoginUser) {
            return;
        }

        String userIdStr = request.getHeader(CommonConstants.HEADER_USER_ID);
        if (!StringUtils.hasText(userIdStr) || "null".equals(userIdStr)) {
            return;
        }

        try {
            Long userId = Long.parseLong(userIdStr);
            String username = getDecodedHeader(request, CommonConstants.HEADER_USERNAME);
            String nickname = getDecodedHeader(request, CommonConstants.HEADER_NICKNAME);
            String tenantIdStr = request.getHeader(CommonConstants.HEADER_TENANT_ID);
            String deptIdStr = request.getHeader(CommonConstants.HEADER_DEPT_ID);
            String rolesStr = request.getHeader(CommonConstants.HEADER_ROLES);
            String permissionsStr = request.getHeader(CommonConstants.HEADER_PERMISSIONS);

            // 解析角色
            Set<String> roles = new HashSet<>();
            if (StringUtils.hasText(rolesStr) && !"null".equals(rolesStr)) {
                roles = Arrays.stream(rolesStr.split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .collect(Collectors.toSet());
            }

            // 解析权限
            Set<String> permissions = new HashSet<>();
            if (StringUtils.hasText(permissionsStr) && !"null".equals(permissionsStr)) {
                permissions = Arrays.stream(permissionsStr.split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .collect(Collectors.toSet());
            }

            // 构建 LoginUser 对象
            LoginUser loginUser = LoginUser.builder()
                    .userId(userId)
                    .username(StringUtils.hasText(username) && !"null".equals(username) ? username : "user_" + userId)
                    .nickname(StringUtils.hasText(nickname) && !"null".equals(nickname) ? nickname : null)
                    .orgId(StringUtils.hasText(tenantIdStr) && !"null".equals(tenantIdStr) ? tenantIdStr : null)
                    .enterpriseId(StringUtils.hasText(tenantIdStr) && !"null".equals(tenantIdStr) ? Long.parseLong(tenantIdStr) : null)
                    .status(1) // 默认启用状态
                    .roles(roles)
                    .permissions(permissions)
                    .build();

            // 创建认证令牌并设置到 SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            if (log.isDebugEnabled()) {
                log.debug("设置Security上下文: userId={}, username={}, roles={}", userId, username, roles);
            }
        } catch (NumberFormatException e) {
            log.warn("无效的用户ID格式: {}", userIdStr);
        }
    }

    /**
     * 获取解码后的请求头值（处理中文编码）
     */
    private String getDecodedHeader(HttpServletRequest request, String headerName) {
        String value = request.getHeader(headerName);
        if (StringUtils.hasText(value) && !"null".equals(value)) {
            try {
                return URLDecoder.decode(value, StandardCharsets.UTF_8);
            } catch (Exception e) {
                return value;
            }
        }
        return value;
    }
}