package com.mota.common.core.context;

import com.alibaba.ttl.TransmittableThreadLocal;
import lombok.extern.slf4j.Slf4j;

import java.util.Set;

/**
 * 用户上下文
 * 使用 TransmittableThreadLocal 支持线程池场景下的用户信息传递
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
public class UserContext {

    /**
     * 用户ID线程变量
     */
    private static final TransmittableThreadLocal<Long> USER_ID = new TransmittableThreadLocal<>();

    /**
     * 用户名线程变量
     */
    private static final TransmittableThreadLocal<String> USERNAME = new TransmittableThreadLocal<>();

    /**
     * 用户昵称线程变量
     */
    private static final TransmittableThreadLocal<String> NICKNAME = new TransmittableThreadLocal<>();

    /**
     * 用户邮箱线程变量
     */
    private static final TransmittableThreadLocal<String> EMAIL = new TransmittableThreadLocal<>();

    /**
     * 用户手机号线程变量
     */
    private static final TransmittableThreadLocal<String> PHONE = new TransmittableThreadLocal<>();

    /**
     * 部门ID线程变量
     */
    private static final TransmittableThreadLocal<Long> DEPT_ID = new TransmittableThreadLocal<>();

    /**
     * 部门名称线程变量
     */
    private static final TransmittableThreadLocal<String> DEPT_NAME = new TransmittableThreadLocal<>();

    /**
     * 用户角色列表线程变量
     */
    private static final TransmittableThreadLocal<Set<String>> ROLES = new TransmittableThreadLocal<>();

    /**
     * 用户权限列表线程变量
     */
    private static final TransmittableThreadLocal<Set<String>> PERMISSIONS = new TransmittableThreadLocal<>();

    /**
     * 数据权限范围线程变量
     */
    private static final TransmittableThreadLocal<String> DATA_SCOPE = new TransmittableThreadLocal<>();

    /**
     * 是否超级管理员线程变量
     */
    private static final TransmittableThreadLocal<Boolean> SUPER_ADMIN = new TransmittableThreadLocal<>();

    private UserContext() {
        // 私有构造函数，防止实例化
    }

    // ========== 用户ID ==========

    /**
     * 设置用户ID
     *
     * @param userId 用户ID
     */
    public static void setUserId(Long userId) {
        USER_ID.set(userId);
        log.debug("设置用户ID: {}", userId);
    }

    /**
     * 获取用户ID
     *
     * @return 用户ID
     */
    public static Long getUserId() {
        return USER_ID.get();
    }

    /**
     * 获取用户ID，如果为空则返回默认值
     *
     * @param defaultValue 默认值
     * @return 用户ID
     */
    public static Long getUserIdOrDefault(Long defaultValue) {
        Long userId = USER_ID.get();
        return userId != null ? userId : defaultValue;
    }

    // ========== 用户名 ==========

    /**
     * 设置用户名
     *
     * @param username 用户名
     */
    public static void setUsername(String username) {
        USERNAME.set(username);
    }

    /**
     * 获取用户名
     *
     * @return 用户名
     */
    public static String getUsername() {
        return USERNAME.get();
    }

    // ========== 昵称 ==========

    /**
     * 设置昵称
     *
     * @param nickname 昵称
     */
    public static void setNickname(String nickname) {
        NICKNAME.set(nickname);
    }

    /**
     * 获取昵称
     *
     * @return 昵称
     */
    public static String getNickname() {
        return NICKNAME.get();
    }

    // ========== 邮箱 ==========

    /**
     * 设置邮箱
     *
     * @param email 邮箱
     */
    public static void setEmail(String email) {
        EMAIL.set(email);
    }

    /**
     * 获取邮箱
     *
     * @return 邮箱
     */
    public static String getEmail() {
        return EMAIL.get();
    }

    // ========== 手机号 ==========

    /**
     * 设置手机号
     *
     * @param phone 手机号
     */
    public static void setPhone(String phone) {
        PHONE.set(phone);
    }

    /**
     * 获取手机号
     *
     * @return 手机号
     */
    public static String getPhone() {
        return PHONE.get();
    }

    // ========== 部门 ==========

    /**
     * 设置部门ID
     *
     * @param deptId 部门ID
     */
    public static void setDeptId(Long deptId) {
        DEPT_ID.set(deptId);
    }

    /**
     * 获取部门ID
     *
     * @return 部门ID
     */
    public static Long getDeptId() {
        return DEPT_ID.get();
    }

    /**
     * 设置部门名称
     *
     * @param deptName 部门名称
     */
    public static void setDeptName(String deptName) {
        DEPT_NAME.set(deptName);
    }

    /**
     * 获取部门名称
     *
     * @return 部门名称
     */
    public static String getDeptName() {
        return DEPT_NAME.get();
    }

    // ========== 角色 ==========

    /**
     * 设置角色列表
     *
     * @param roles 角色列表
     */
    public static void setRoles(Set<String> roles) {
        ROLES.set(roles);
    }

    /**
     * 获取角色列表
     *
     * @return 角色列表
     */
    public static Set<String> getRoles() {
        return ROLES.get();
    }

    /**
     * 判断是否拥有指定角色
     *
     * @param role 角色编码
     * @return 是否拥有
     */
    public static boolean hasRole(String role) {
        Set<String> roles = ROLES.get();
        return roles != null && roles.contains(role);
    }

    /**
     * 判断是否拥有任意一个角色
     *
     * @param roles 角色编码列表
     * @return 是否拥有
     */
    public static boolean hasAnyRole(String... roles) {
        Set<String> userRoles = ROLES.get();
        if (userRoles == null || userRoles.isEmpty()) {
            return false;
        }
        for (String role : roles) {
            if (userRoles.contains(role)) {
                return true;
            }
        }
        return false;
    }

    // ========== 权限 ==========

    /**
     * 设置权限列表
     *
     * @param permissions 权限列表
     */
    public static void setPermissions(Set<String> permissions) {
        PERMISSIONS.set(permissions);
    }

    /**
     * 获取权限列表
     *
     * @return 权限列表
     */
    public static Set<String> getPermissions() {
        return PERMISSIONS.get();
    }

    /**
     * 判断是否拥有指定权限
     *
     * @param permission 权限编码
     * @return 是否拥有
     */
    public static boolean hasPermission(String permission) {
        // 超级管理员拥有所有权限
        if (isSuperAdmin()) {
            return true;
        }
        Set<String> permissions = PERMISSIONS.get();
        return permissions != null && (permissions.contains("*") || permissions.contains(permission));
    }

    /**
     * 判断是否拥有任意一个权限
     *
     * @param permissions 权限编码列表
     * @return 是否拥有
     */
    public static boolean hasAnyPermission(String... permissions) {
        // 超级管理员拥有所有权限
        if (isSuperAdmin()) {
            return true;
        }
        Set<String> userPermissions = PERMISSIONS.get();
        if (userPermissions == null || userPermissions.isEmpty()) {
            return false;
        }
        if (userPermissions.contains("*")) {
            return true;
        }
        for (String permission : permissions) {
            if (userPermissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }

    // ========== 数据权限 ==========

    /**
     * 设置数据权限范围
     *
     * @param dataScope 数据权限范围
     */
    public static void setDataScope(String dataScope) {
        DATA_SCOPE.set(dataScope);
    }

    /**
     * 获取数据权限范围
     *
     * @return 数据权限范围
     */
    public static String getDataScope() {
        return DATA_SCOPE.get();
    }

    // ========== 超级管理员 ==========

    /**
     * 设置是否超级管理员
     *
     * @param superAdmin 是否超级管理员
     */
    public static void setSuperAdmin(Boolean superAdmin) {
        SUPER_ADMIN.set(superAdmin);
    }

    /**
     * 是否超级管理员
     *
     * @return 是否超级管理员
     */
    public static boolean isSuperAdmin() {
        Boolean superAdmin = SUPER_ADMIN.get();
        return superAdmin != null && superAdmin;
    }

    // ========== 工具方法 ==========

    /**
     * 判断是否已登录
     *
     * @return 是否已登录
     */
    public static boolean isLoggedIn() {
        return USER_ID.get() != null;
    }

    /**
     * 清除用户上下文
     */
    public static void clear() {
        USER_ID.remove();
        USERNAME.remove();
        NICKNAME.remove();
        EMAIL.remove();
        PHONE.remove();
        DEPT_ID.remove();
        DEPT_NAME.remove();
        ROLES.remove();
        PERMISSIONS.remove();
        DATA_SCOPE.remove();
        SUPER_ADMIN.remove();
        log.debug("清除用户上下文");
    }

    /**
     * 在指定用户上下文中执行操作
     *
     * @param userId   用户ID
     * @param runnable 要执行的操作
     */
    public static void runWithUser(Long userId, Runnable runnable) {
        Long oldUserId = USER_ID.get();
        try {
            USER_ID.set(userId);
            runnable.run();
        } finally {
            if (oldUserId != null) {
                USER_ID.set(oldUserId);
            } else {
                USER_ID.remove();
            }
        }
    }
}