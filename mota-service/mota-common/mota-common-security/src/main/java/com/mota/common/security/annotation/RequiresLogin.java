package com.mota.common.security.annotation;

import java.lang.annotation.*;

/**
 * 登录校验注解
 * 标注在方法或类上，表示需要登录才能访问
 * 
 * @author Mota
 * @since 1.0.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresLogin {
}