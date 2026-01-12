package com.mota.common.core.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 数据权限范围枚举
 * 
 * @author Mota
 * @since 1.0.0
 */
@Getter
@AllArgsConstructor
public enum DataScopeEnum {

    /**
     * 全部数据权限
     */
    ALL(1, "全部数据权限"),

    /**
     * 自定义数据权限
     */
    CUSTOM(2, "自定义数据权限"),

    /**
     * 本部门数据权限
     */
    DEPT(3, "本部门数据权限"),

    /**
     * 本部门及以下数据权限
     */
    DEPT_AND_CHILD(4, "本部门及以下数据权限"),

    /**
     * 仅本人数据权限
     */
    SELF(5, "仅本人数据权限");

    /**
     * 数据权限值
     */
    private final Integer value;

    /**
     * 数据权限描述
     */
    private final String desc;

    /**
     * 根据值获取枚举
     *
     * @param value 值
     * @return 枚举
     */
    public static DataScopeEnum of(Integer value) {
        if (value == null) {
            return null;
        }
        for (DataScopeEnum scope : values()) {
            if (scope.getValue().equals(value)) {
                return scope;
            }
        }
        return null;
    }

    /**
     * 判断是否是全部数据权限
     *
     * @param value 值
     * @return 是否是全部数据权限
     */
    public static boolean isAll(Integer value) {
        return ALL.getValue().equals(value);
    }

    /**
     * 判断是否是自定义数据权限
     *
     * @param value 值
     * @return 是否是自定义数据权限
     */
    public static boolean isCustom(Integer value) {
        return CUSTOM.getValue().equals(value);
    }

    /**
     * 判断是否是本部门数据权限
     *
     * @param value 值
     * @return 是否是本部门数据权限
     */
    public static boolean isDept(Integer value) {
        return DEPT.getValue().equals(value);
    }

    /**
     * 判断是否是本部门及以下数据权限
     *
     * @param value 值
     * @return 是否是本部门及以下数据权限
     */
    public static boolean isDeptAndChild(Integer value) {
        return DEPT_AND_CHILD.getValue().equals(value);
    }

    /**
     * 判断是否是仅本人数据权限
     *
     * @param value 值
     * @return 是否是仅本人数据权限
     */
    public static boolean isSelf(Integer value) {
        return SELF.getValue().equals(value);
    }
}