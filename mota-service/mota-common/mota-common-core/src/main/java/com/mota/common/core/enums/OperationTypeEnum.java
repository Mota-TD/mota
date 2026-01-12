package com.mota.common.core.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 操作类型枚举
 * 
 * @author Mota
 * @since 1.0.0
 */
@Getter
@AllArgsConstructor
public enum OperationTypeEnum {

    /**
     * 其他
     */
    OTHER(0, "其他"),

    /**
     * 新增
     */
    CREATE(1, "新增"),

    /**
     * 修改
     */
    UPDATE(2, "修改"),

    /**
     * 删除
     */
    DELETE(3, "删除"),

    /**
     * 查询
     */
    QUERY(4, "查询"),

    /**
     * 导入
     */
    IMPORT(5, "导入"),

    /**
     * 导出
     */
    EXPORT(6, "导出"),

    /**
     * 授权
     */
    GRANT(7, "授权"),

    /**
     * 强退
     */
    FORCE_LOGOUT(8, "强退"),

    /**
     * 清空数据
     */
    CLEAN(9, "清空数据");

    /**
     * 操作类型值
     */
    private final Integer value;

    /**
     * 操作类型描述
     */
    private final String desc;

    /**
     * 根据值获取枚举
     *
     * @param value 值
     * @return 枚举
     */
    public static OperationTypeEnum of(Integer value) {
        if (value == null) {
            return null;
        }
        for (OperationTypeEnum type : values()) {
            if (type.getValue().equals(value)) {
                return type;
            }
        }
        return OTHER;
    }
}