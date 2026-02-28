package com.mota.common.core.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * 密码验证器单元测试
 *
 * @author Mota
 * @since 1.0.0
 */
@DisplayName("密码验证器测试")
class PasswordValidatorTest {

    private PasswordValidator validator;

    @Mock
    private Password passwordAnnotation;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder violationBuilder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        validator = new PasswordValidator();

        // 设置默认注解属性
        when(passwordAnnotation.minLength()).thenReturn(8);
        when(passwordAnnotation.maxLength()).thenReturn(50);
        when(passwordAnnotation.requireUpperCase()).thenReturn(true);
        when(passwordAnnotation.requireLowerCase()).thenReturn(true);
        when(passwordAnnotation.requireDigit()).thenReturn(true);
        when(passwordAnnotation.requireSpecialChar()).thenReturn(false);
        when(passwordAnnotation.specialChars()).thenReturn("!@#$%^&*()_+-=[]{}|;':\",./<>?");

        // Mock context
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(violationBuilder);

        validator.initialize(passwordAnnotation);
    }

    @Test
    @DisplayName("有效密码应该通过验证")
    void validPassword_shouldPass() {
        assertTrue(validator.isValid("Password123", context));
        assertTrue(validator.isValid("MySecret99", context));
        assertTrue(validator.isValid("Abcdefgh1", context));
    }

    @Test
    @DisplayName("空密码应该通过（由@NotBlank处理）")
    void nullOrEmptyPassword_shouldPass() {
        assertTrue(validator.isValid(null, context));
        assertTrue(validator.isValid("", context));
    }

    @Test
    @DisplayName("太短的密码应该失败")
    void shortPassword_shouldFail() {
        assertFalse(validator.isValid("Pass1", context));
        assertFalse(validator.isValid("Ab1", context));
    }

    @Test
    @DisplayName("没有大写字母的密码应该失败")
    void noUpperCase_shouldFail() {
        assertFalse(validator.isValid("password123", context));
    }

    @Test
    @DisplayName("没有小写字母的密码应该失败")
    void noLowerCase_shouldFail() {
        assertFalse(validator.isValid("PASSWORD123", context));
    }

    @Test
    @DisplayName("没有数字的密码应该失败")
    void noDigit_shouldFail() {
        assertFalse(validator.isValid("PasswordAbc", context));
    }

    @Test
    @DisplayName("需要特殊字符时，没有特殊字符应该失败")
    void requireSpecialChar_noSpecialChar_shouldFail() {
        when(passwordAnnotation.requireSpecialChar()).thenReturn(true);
        validator.initialize(passwordAnnotation);

        assertFalse(validator.isValid("Password123", context));
    }

    @Test
    @DisplayName("需要特殊字符时，有特殊字符应该通过")
    void requireSpecialChar_withSpecialChar_shouldPass() {
        when(passwordAnnotation.requireSpecialChar()).thenReturn(true);
        validator.initialize(passwordAnnotation);

        assertTrue(validator.isValid("Password123!", context));
        assertTrue(validator.isValid("Pass@word1", context));
    }

    @Test
    @DisplayName("超过最大长度的密码应该失败")
    void tooLongPassword_shouldFail() {
        when(passwordAnnotation.maxLength()).thenReturn(10);
        validator.initialize(passwordAnnotation);

        assertFalse(validator.isValid("Password123456", context));
    }
}