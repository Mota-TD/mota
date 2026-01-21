package com.mota.common.mybatis.handler;

import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import com.mota.common.core.context.TenantContext;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.NullValue;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * 多租户处理器实现
 * 自动为SQL添加租户条件
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
public class TenantLineHandlerImpl implements TenantLineHandler {

    /**
     * 租户字段名
     */
    private static final String TENANT_COLUMN = "tenant_id";

    /**
     * 忽略租户过滤的表
     * 这些表不需要租户隔离
     */
    private static final Set<String> IGNORE_TABLES = new HashSet<>(Arrays.asList(
            // 系统级表
            "sys_tenant",           // 租户表本身
            "sys_config",           // 系统配置表
            "sys_dict_type",        // 字典类型表
            "sys_dict_data",        // 字典数据表
            "sys_region",           // 地区表
            "sys_industry",         // 行业表
            // 日志表
            "sys_login_log",        // 登录日志
            "sys_operation_log",    // 操作日志
            // 其他公共表
            "flyway_schema_history", // Flyway版本控制表
            // 用户级别表（不需要租户隔离）
            "user_view_config",     // 用户视图配置表
            // 组织级别表（使用 org_id 而非 tenant_id）
            "department",           // 部门表
            "sys_user"              // 用户表
    ));

    @Override
    public Expression getTenantId() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            log.debug("租户ID为空，返回NULL值");
            return new NullValue();
        }
        return new LongValue(tenantId);
    }

    @Override
    public String getTenantIdColumn() {
        return TENANT_COLUMN;
    }

    @Override
    public boolean ignoreTable(String tableName) {
        // 如果设置了忽略租户过滤，则忽略所有表
        if (TenantContext.isIgnoreTenant()) {
            log.debug("忽略租户过滤: table={}", tableName);
            return true;
        }

        // 如果租户ID为空，则忽略（避免SQL错误）
        if (TenantContext.getTenantId() == null) {
            log.debug("租户ID为空，忽略表: {}", tableName);
            return true;
        }

        // 检查是否在忽略列表中
        String lowerTableName = tableName.toLowerCase();
        if (IGNORE_TABLES.contains(lowerTableName)) {
            log.debug("表在忽略列表中: {}", tableName);
            return true;
        }

        return false;
    }

    /**
     * 添加忽略的表
     *
     * @param tableName 表名
     */
    public static void addIgnoreTable(String tableName) {
        IGNORE_TABLES.add(tableName.toLowerCase());
    }

    /**
     * 移除忽略的表
     *
     * @param tableName 表名
     */
    public static void removeIgnoreTable(String tableName) {
        IGNORE_TABLES.remove(tableName.toLowerCase());
    }

    /**
     * 检查表是否在忽略列表中
     *
     * @param tableName 表名
     * @return 是否忽略
     */
    public static boolean isIgnoreTable(String tableName) {
        return IGNORE_TABLES.contains(tableName.toLowerCase());
    }
}