package com.mota.common.security.annotation;

import java.lang.annotation.*;

/**
 * 角色校验注解
 * 标注在方法或类上，表示需要指定的角色才能访问
 * 
 * @author Mota
 * @since 1.0.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {

    /**
     * 需要的角色标识
     * 多个角色之间的关系由 logical 属性决定
     */
    String[] value();

    /**
     * 多个角色之间的逻辑关系
     * AND: 需要同时拥有所有角色
     * OR: 只需要拥有其中一个角色
     */
    Logical logical() default Logical.AND;
}