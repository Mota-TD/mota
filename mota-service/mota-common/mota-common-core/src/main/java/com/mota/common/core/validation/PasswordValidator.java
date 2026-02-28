package com.mota.common.core.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * 密码强度验证器
 *
 * @author Mota
 * @since 1.0.0
 */
public class PasswordValidator implements ConstraintValidator<Password, String> {

    private int minLength;
    private int maxLength;
    private boolean requireUpperCase;
    private boolean requireLowerCase;
    private boolean requireDigit;
    private boolean requireSpecialChar;
    private String specialChars;

    @Override
    public void initialize(Password constraintAnnotation) {
        this.minLength = constraintAnnotation.minLength();
        this.maxLength = constraintAnnotation.maxLength();
        this.requireUpperCase = constraintAnnotation.requireUpperCase();
        this.requireLowerCase = constraintAnnotation.requireLowerCase();
        this.requireDigit = constraintAnnotation.requireDigit();
        this.requireSpecialChar = constraintAnnotation.requireSpecialChar();
        this.specialChars = constraintAnnotation.specialChars();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            // 空值由 @NotBlank 验证
            return true;
        }

        // 构建错误信息
        StringBuilder errorMessage = new StringBuilder("密码强度不足：");
        boolean hasError = false;

        // 检查长度
        if (password.length() < minLength) {
            errorMessage.append(String.format("至少需要%d个字符", minLength));
            hasError = true;
        } else if (password.length() > maxLength) {
            errorMessage.append(String.format("不能超过%d个字符", maxLength));
            hasError = true;
        }

        // 检查大写字母
        if (requireUpperCase && !containsUpperCase(password)) {
            if (hasError) errorMessage.append("，");
            errorMessage.append("需要包含大写字母");
            hasError = true;
        }

        // 检查小写字母
        if (requireLowerCase && !containsLowerCase(password)) {
            if (hasError) errorMessage.append("，");
            errorMessage.append("需要包含小写字母");
            hasError = true;
        }

        // 检查数字
        if (requireDigit && !containsDigit(password)) {
            if (hasError) errorMessage.append("，");
            errorMessage.append("需要包含数字");
            hasError = true;
        }

        // 检查特殊字符
        if (requireSpecialChar && !containsSpecialChar(password)) {
            if (hasError) errorMessage.append("，");
            errorMessage.append("需要包含特殊字符");
            hasError = true;
        }

        if (hasError) {
            // 设置自定义错误消息
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(errorMessage.toString())
                    .addConstraintViolation();
            return false;
        }

        return true;
    }

    /**
     * 检查是否包含大写字母
     */
    private boolean containsUpperCase(String password) {
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查是否包含小写字母
     */
    private boolean containsLowerCase(String password) {
        for (char c : password.toCharArray()) {
            if (Character.isLowerCase(c)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查是否包含数字
     */
    private boolean containsDigit(String password) {
        for (char c : password.toCharArray()) {
            if (Character.isDigit(c)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查是否包含特殊字符
     */
    private boolean containsSpecialChar(String password) {
        for (char c : password.toCharArray()) {
            if (specialChars.indexOf(c) >= 0) {
                return true;
            }
        }
        return false;
    }
}