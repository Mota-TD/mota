package com.mota.common.security.annotation;

/**
 * 权限逻辑关系枚举
 * 
 * @author Mota
 * @since 1.0.0
 */
public enum Logical {

    /**
     * 与关系：需要同时满足所有条件
     */
    AND,

    /**
     * 或关系：只需要满足其中一个条件
     */
    OR
}