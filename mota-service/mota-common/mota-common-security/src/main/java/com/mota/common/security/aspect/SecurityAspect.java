package com.mota.common.security.aspect;

import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.result.ResultCode;
import com.mota.common.security.annotation.Logical;
import com.mota.common.security.annotation.RequiresLogin;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.common.security.annotation.RequiresRole;
import com.mota.common.security.domain.LoginUser;
import com.mota.common.security.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Set;

/**
 * 安全校验切面
 * 处理 @RequiresLogin、@RequiresRole、@RequiresPermission 注解
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Aspect
@Order(1)
@Component
public class SecurityAspect {

    /**
     * 登录校验
     */
    @Before("@annotation(requiresLogin) || @within(requiresLogin)")
    public void checkLogin(JoinPoint joinPoint, RequiresLogin requiresLogin) {
        if (!SecurityUtils.isAuthenticated()) {
            log.warn("访问被拒绝: 用户未登录, method={}", getMethodName(joinPoint));
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
    }

    /**
     * 角色校验
     */
    @Before("@annotation(requiresRole) || @within(requiresRole)")
    public void checkRole(JoinPoint joinPoint, RequiresRole requiresRole) {
        // 首先检查是否登录
        if (!SecurityUtils.isAuthenticated()) {
            log.warn("访问被拒绝: 用户未登录, method={}", getMethodName(joinPoint));
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        // 获取注解（方法上的注解优先于类上的注解）
        RequiresRole annotation = getAnnotation(joinPoint, RequiresRole.class, requiresRole);
        if (annotation == null) {
            return;
        }

        String[] roles = annotation.value();
        Logical logical = annotation.logical();

        LoginUser loginUser = SecurityUtils.getLoginUser();
        Set<String> userRoles = loginUser.getRoles();

        if (userRoles == null || userRoles.isEmpty()) {
            log.warn("访问被拒绝: 用户没有任何角色, userId={}, method={}", 
                    loginUser.getUserId(), getMethodName(joinPoint));
            throw new BusinessException(ResultCode.FORBIDDEN);
        }

        boolean hasRole = checkRoles(userRoles, roles, logical);
        if (!hasRole) {
            log.warn("访问被拒绝: 用户角色不足, userId={}, userRoles={}, requiredRoles={}, logical={}, method={}", 
                    loginUser.getUserId(), userRoles, roles, logical, getMethodName(joinPoint));
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
    }

    /**
     * 权限校验
     */
    @Before("@annotation(requiresPermission) || @within(requiresPermission)")
    public void checkPermission(JoinPoint joinPoint, RequiresPermission requiresPermission) {
        // 首先检查是否登录
        if (!SecurityUtils.isAuthenticated()) {
            log.warn("访问被拒绝: 用户未登录, method={}", getMethodName(joinPoint));
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        // 获取注解（方法上的注解优先于类上的注解）
        RequiresPermission annotation = getAnnotation(joinPoint, RequiresPermission.class, requiresPermission);
        if (annotation == null) {
            return;
        }

        String[] permissions = annotation.value();
        Logical logical = annotation.logical();

        LoginUser loginUser = SecurityUtils.getLoginUser();
        Set<String> userPermissions = loginUser.getPermissions();

        // 超级管理员拥有所有权限
        if (loginUser.getRoles() != null && loginUser.getRoles().contains("admin")) {
            return;
        }

        if (userPermissions == null || userPermissions.isEmpty()) {
            log.warn("访问被拒绝: 用户没有任何权限, userId={}, method={}", 
                    loginUser.getUserId(), getMethodName(joinPoint));
            throw new BusinessException(ResultCode.FORBIDDEN);
        }

        boolean hasPermission = checkPermissions(userPermissions, permissions, logical);
        if (!hasPermission) {
            log.warn("访问被拒绝: 用户权限不足, userId={}, userPermissions={}, requiredPermissions={}, logical={}, method={}", 
                    loginUser.getUserId(), userPermissions, permissions, logical, getMethodName(joinPoint));
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
    }

    /**
     * 检查角色
     */
    private boolean checkRoles(Set<String> userRoles, String[] requiredRoles, Logical logical) {
        if (logical == Logical.AND) {
            // AND: 需要同时拥有所有角色
            for (String role : requiredRoles) {
                if (!userRoles.contains(role)) {
                    return false;
                }
            }
            return true;
        } else {
            // OR: 只需要拥有其中一个角色
            for (String role : requiredRoles) {
                if (userRoles.contains(role)) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * 检查权限
     */
    private boolean checkPermissions(Set<String> userPermissions, String[] requiredPermissions, Logical logical) {
        if (logical == Logical.AND) {
            // AND: 需要同时拥有所有权限
            for (String permission : requiredPermissions) {
                if (!userPermissions.contains(permission) && !matchWildcard(userPermissions, permission)) {
                    return false;
                }
            }
            return true;
        } else {
            // OR: 只需要拥有其中一个权限
            for (String permission : requiredPermissions) {
                if (userPermissions.contains(permission) || matchWildcard(userPermissions, permission)) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
     * 通配符匹配
     * 支持 * 通配符：
     * - 单独的 * 表示所有权限
     * - system:user:* 可以匹配 system:user:add
     * - system:* 可以匹配 system:user:add
     */
    private boolean matchWildcard(Set<String> userPermissions, String requiredPermission) {
        for (String userPermission : userPermissions) {
            // 单独的 * 表示拥有所有权限
            if ("*".equals(userPermission)) {
                return true;
            }
            // 以 * 结尾的通配符匹配
            if (userPermission.endsWith("*")) {
                String prefix = userPermission.substring(0, userPermission.length() - 1);
                if (requiredPermission.startsWith(prefix)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 获取方法名
     */
    private String getMethodName(JoinPoint joinPoint) {
        return joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName();
    }

    /**
     * 获取注解（方法上的注解优先于类上的注解）
     */
    @SuppressWarnings("unchecked")
    private <T extends Annotation> T getAnnotation(JoinPoint joinPoint, Class<T> annotationClass, T defaultAnnotation) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // 先从方法上获取注解
        T annotation = method.getAnnotation(annotationClass);
        if (annotation != null) {
            return annotation;
        }
        
        // 再从类上获取注解
        annotation = joinPoint.getTarget().getClass().getAnnotation(annotationClass);
        if (annotation != null) {
            return annotation;
        }
        
        return defaultAnnotation;
    }
}