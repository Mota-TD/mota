package com.mota.common.mybatis.annotation;

import java.lang.annotation.*;

/**
 * 数据权限注解
 * 标注在Mapper方法上，表示该方法需要进行数据权限过滤
 * 
 * @author Mota
 * @since 1.0.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataPermission {

    /**
     * 是否启用数据权限过滤
     * 默认启用
     */
    boolean enabled() default true;

    /**
     * 用户ID字段名
     * 用于仅本人数据权限过滤
     */
    String userIdColumn() default "created_by";

    /**
     * 部门ID字段名
     * 用于部门数据权限过滤
     */
    String deptIdColumn() default "dept_id";

    /**
     * 表别名
     * 如果SQL中使用了表别名，需要指定
     */
    String tableAlias() default "";
}