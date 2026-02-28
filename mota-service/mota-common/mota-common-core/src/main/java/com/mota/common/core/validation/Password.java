package com.mota.common.core.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * 密码强度验证注解
 * 
 * 默认规则：
 * - 最少8个字符
 * - 至少包含1个大写字母
 * - 至少包含1个小写字母
 * - 至少包含1个数字
 * - 可选：至少包含1个特殊字符
 *
 * @author Mota
 * @since 1.0.0
 */
@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface Password {

    String message() default "密码强度不足：至少8位，需包含大写字母、小写字母和数字";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    /**
     * 最小长度
     */
    int minLength() default 8;

    /**
     * 最大长度
     */
    int maxLength() default 50;

    /**
     * 是否需要大写字母
     */
    boolean requireUpperCase() default true;

    /**
     * 是否需要小写字母
     */
    boolean requireLowerCase() default true;

    /**
     * 是否需要数字
     */
    boolean requireDigit() default true;

    /**
     * 是否需要特殊字符
     */
    boolean requireSpecialChar() default false;

    /**
     * 允许的特殊字符
     */
    String specialChars() default "!@#$%^&*()_+-=[]{}|;':\",./<>?";
}