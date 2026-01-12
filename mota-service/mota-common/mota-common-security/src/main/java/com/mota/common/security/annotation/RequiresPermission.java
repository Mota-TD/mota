package com.mota.common.security.annotation;

import java.lang.annotation.*;

/**
 * 权限校验注解
 * 标注在方法或类上，表示需要指定的权限才能访问
 * 
 * @author Mota
 * @since 1.0.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermission {

    /**
     * 需要的权限标识
     * 多个权限之间的关系由 logical 属性决定
     */
    String[] value();

    /**
     * 多个权限之间的逻辑关系
     * AND: 需要同时拥有所有权限
     * OR: 只需要拥有其中一个权限
     */
    Logical logical() default Logical.AND;
}