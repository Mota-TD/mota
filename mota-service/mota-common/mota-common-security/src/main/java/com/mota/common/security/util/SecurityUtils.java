package com.mota.common.security.util;

import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.result.ResultCode;
import com.mota.common.security.domain.LoginUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * 安全工具类
 */
public class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * 获取当前登录用户
     */
    public static LoginUser getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof LoginUser) {
            return (LoginUser) principal;
        }
        throw new BusinessException(ResultCode.UNAUTHORIZED);
    }

    /**
     * 获取当前用户ID
     */
    public static Long getUserId() {
        return getLoginUser().getUserId();
    }

    /**
     * 获取当前用户名
     */
    public static String getUsername() {
        return getLoginUser().getUsername();
    }

    /**
     * 获取当前组织ID
     */
    public static String getOrgId() {
        return getLoginUser().getOrgId();
    }

    /**
     * 判断是否已登录
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof LoginUser;
    }

    /**
     * 判断是否有指定权限
     */
    public static boolean hasPermission(String permission) {
        LoginUser loginUser = getLoginUser();
        if (loginUser.getPermissions() == null) {
            return false;
        }
        return loginUser.getPermissions().contains(permission);
    }

    /**
     * 判断是否有指定角色
     */
    public static boolean hasRole(String role) {
        LoginUser loginUser = getLoginUser();
        if (loginUser.getRoles() == null) {
            return false;
        }
        return loginUser.getRoles().contains(role);
    }

    /**
     * 判断是否是管理员
     */
    public static boolean isAdmin() {
        return hasRole("admin");
    }
}