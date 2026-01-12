package com.mota.common.core.context;

import com.alibaba.ttl.TransmittableThreadLocal;
import lombok.extern.slf4j.Slf4j;

/**
 * 多租户上下文
 * 使用 TransmittableThreadLocal 支持线程池场景下的租户信息传递
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
public class TenantContext {

    /**
     * 租户ID线程变量
     * 使用 TransmittableThreadLocal 确保在线程池中也能正确传递
     */
    private static final TransmittableThreadLocal<Long> TENANT_ID = new TransmittableThreadLocal<>();

    /**
     * 租户编码线程变量
     */
    private static final TransmittableThreadLocal<String> TENANT_CODE = new TransmittableThreadLocal<>();

    /**
     * 租户名称线程变量
     */
    private static final TransmittableThreadLocal<String> TENANT_NAME = new TransmittableThreadLocal<>();

    /**
     * 是否忽略租户过滤（用于超级管理员等场景）
     */
    private static final TransmittableThreadLocal<Boolean> IGNORE_TENANT = new TransmittableThreadLocal<>();

    private TenantContext() {
        // 私有构造函数，防止实例化
    }

    /**
     * 设置租户ID
     *
     * @param tenantId 租户ID
     */
    public static void setTenantId(Long tenantId) {
        TENANT_ID.set(tenantId);
        log.debug("设置租户ID: {}", tenantId);
    }

    /**
     * 获取租户ID
     *
     * @return 租户ID
     */
    public static Long getTenantId() {
        return TENANT_ID.get();
    }

    /**
     * 获取租户ID，如果为空则返回默认值
     *
     * @param defaultValue 默认值
     * @return 租户ID
     */
    public static Long getTenantIdOrDefault(Long defaultValue) {
        Long tenantId = TENANT_ID.get();
        return tenantId != null ? tenantId : defaultValue;
    }

    /**
     * 设置租户编码
     *
     * @param tenantCode 租户编码
     */
    public static void setTenantCode(String tenantCode) {
        TENANT_CODE.set(tenantCode);
    }

    /**
     * 获取租户编码
     *
     * @return 租户编码
     */
    public static String getTenantCode() {
        return TENANT_CODE.get();
    }

    /**
     * 设置租户名称
     *
     * @param tenantName 租户名称
     */
    public static void setTenantName(String tenantName) {
        TENANT_NAME.set(tenantName);
    }

    /**
     * 获取租户名称
     *
     * @return 租户名称
     */
    public static String getTenantName() {
        return TENANT_NAME.get();
    }

    /**
     * 设置是否忽略租户过滤
     *
     * @param ignore 是否忽略
     */
    public static void setIgnoreTenant(Boolean ignore) {
        IGNORE_TENANT.set(ignore);
    }

    /**
     * 是否忽略租户过滤
     *
     * @return 是否忽略
     */
    public static boolean isIgnoreTenant() {
        Boolean ignore = IGNORE_TENANT.get();
        return ignore != null && ignore;
    }

    /**
     * 设置租户信息
     *
     * @param tenantId   租户ID
     * @param tenantCode 租户编码
     * @param tenantName 租户名称
     */
    public static void setTenant(Long tenantId, String tenantCode, String tenantName) {
        setTenantId(tenantId);
        setTenantCode(tenantCode);
        setTenantName(tenantName);
    }

    /**
     * 清除租户上下文
     */
    public static void clear() {
        TENANT_ID.remove();
        TENANT_CODE.remove();
        TENANT_NAME.remove();
        IGNORE_TENANT.remove();
        log.debug("清除租户上下文");
    }

    /**
     * 在忽略租户的上下文中执行操作
     *
     * @param runnable 要执行的操作
     */
    public static void runWithIgnoreTenant(Runnable runnable) {
        Boolean oldValue = IGNORE_TENANT.get();
        try {
            IGNORE_TENANT.set(true);
            runnable.run();
        } finally {
            if (oldValue != null) {
                IGNORE_TENANT.set(oldValue);
            } else {
                IGNORE_TENANT.remove();
            }
        }
    }

    /**
     * 在指定租户上下文中执行操作
     *
     * @param tenantId 租户ID
     * @param runnable 要执行的操作
     */
    public static void runWithTenant(Long tenantId, Runnable runnable) {
        Long oldTenantId = TENANT_ID.get();
        try {
            TENANT_ID.set(tenantId);
            runnable.run();
        } finally {
            if (oldTenantId != null) {
                TENANT_ID.set(oldTenantId);
            } else {
                TENANT_ID.remove();
            }
        }
    }
}