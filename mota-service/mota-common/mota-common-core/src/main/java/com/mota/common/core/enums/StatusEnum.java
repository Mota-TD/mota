package com.mota.common.core.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 状态枚举
 * 
 * @author Mota
 * @since 1.0.0
 */
@Getter
@AllArgsConstructor
public enum StatusEnum {

    /**
     * 启用
     */
    ENABLED(1, "启用"),

    /**
     * 禁用
     */
    DISABLED(0, "禁用");

    /**
     * 状态值
     */
    private final Integer value;

    /**
     * 状态描述
     */
    private final String desc;

    /**
     * 根据值获取枚举
     *
     * @param value 值
     * @return 枚举
     */
    public static StatusEnum of(Integer value) {
        if (value == null) {
            return null;
        }
        for (StatusEnum status : values()) {
            if (status.getValue().equals(value)) {
                return status;
            }
        }
        return null;
    }

    /**
     * 判断是否启用
     *
     * @param value 值
     * @return 是否启用
     */
    public static boolean isEnabled(Integer value) {
        return ENABLED.getValue().equals(value);
    }

    /**
     * 判断是否禁用
     *
     * @param value 值
     * @return 是否禁用
     */
    public static boolean isDisabled(Integer value) {
        return DISABLED.getValue().equals(value);
    }
}