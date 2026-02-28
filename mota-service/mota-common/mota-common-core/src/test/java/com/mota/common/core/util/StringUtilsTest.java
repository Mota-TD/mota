package com.mota.common.core.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 字符串工具类单元测试
 *
 * @author Mota
 * @since 1.0.0
 */
@DisplayName("字符串工具类测试")
class StringUtilsTest {

    // ========== 空值判断测试 ==========

    @Test
    @DisplayName("isEmpty - null应该返回true")
    void isEmpty_null_shouldReturnTrue() {
        assertTrue(StringUtils.isEmpty(null));
    }

    @Test
    @DisplayName("isEmpty - 空字符串应该返回true")
    void isEmpty_empty_shouldReturnTrue() {
        assertTrue(StringUtils.isEmpty(""));
    }

    @Test
    @DisplayName("isEmpty - 非空字符串应该返回false")
    void isEmpty_nonEmpty_shouldReturnFalse() {
        assertFalse(StringUtils.isEmpty("hello"));
        assertFalse(StringUtils.isEmpty(" "));
    }

    @Test
    @DisplayName("isBlank - 空白字符串应该返回true")
    void isBlank_whitespace_shouldReturnTrue() {
        assertTrue(StringUtils.isBlank(null));
        assertTrue(StringUtils.isBlank(""));
        assertTrue(StringUtils.isBlank(" "));
        assertTrue(StringUtils.isBlank("  \t\n  "));
    }

    @Test
    @DisplayName("isBlank - 非空白字符串应该返回false")
    void isBlank_nonBlank_shouldReturnFalse() {
        assertFalse(StringUtils.isBlank("hello"));
        assertFalse(StringUtils.isBlank(" a "));
    }

    // ========== 字符串处理测试 ==========

    @Test
    @DisplayName("trim - 应该去除首尾空白")
    void trim_shouldRemoveWhitespace() {
        assertEquals("hello", StringUtils.trim("  hello  "));
        assertNull(StringUtils.trim(null));
    }

    @Test
    @DisplayName("capitalize - 应该首字母大写")
    void capitalize_shouldUppercaseFirstChar() {
        assertEquals("Hello", StringUtils.capitalize("hello"));
        assertEquals("A", StringUtils.capitalize("a"));
        assertEquals("", StringUtils.capitalize(""));
    }

    @Test
    @DisplayName("uncapitalize - 应该首字母小写")
    void uncapitalize_shouldLowercaseFirstChar() {
        assertEquals("hello", StringUtils.uncapitalize("Hello"));
        assertEquals("a", StringUtils.uncapitalize("A"));
    }

    @Test
    @DisplayName("toCamelCase - 应该转换为驼峰命名")
    void toCamelCase_shouldConvertCorrectly() {
        assertEquals("userName", StringUtils.toCamelCase("user_name"));
        assertEquals("getUserById", StringUtils.toCamelCase("get_user_by_id"));
        assertEquals("id", StringUtils.toCamelCase("id"));
    }

    @Test
    @DisplayName("toSnakeCase - 应该转换为下划线命名")
    void toSnakeCase_shouldConvertCorrectly() {
        assertEquals("user_name", StringUtils.toSnakeCase("userName"));
        assertEquals("get_user_by_id", StringUtils.toSnakeCase("getUserById"));
        assertEquals("id", StringUtils.toSnakeCase("id"));
    }

    // ========== 字符串截取测试 ==========

    @Test
    @DisplayName("abbreviate - 应该正确截断并添加省略号")
    void abbreviate_shouldTruncateWithEllipsis() {
        assertEquals("hello...", StringUtils.abbreviate("hello world", 8));
        assertEquals("hello", StringUtils.abbreviate("hello", 10));
    }

    @Test
    @DisplayName("leftPad - 应该正确左填充")
    void leftPad_shouldPadCorrectly() {
        assertEquals("00123", StringUtils.leftPad("123", 5, '0'));
        assertEquals("12345", StringUtils.leftPad("12345", 3, '0'));
    }

    @Test
    @DisplayName("rightPad - 应该正确右填充")
    void rightPad_shouldPadCorrectly() {
        assertEquals("123--", StringUtils.rightPad("123", 5, '-'));
    }

    // ========== 字符串连接测试 ==========

    @Test
    @DisplayName("join - 应该正确连接集合")
    void join_collection_shouldJoinCorrectly() {
        assertEquals("a,b,c", StringUtils.join(Arrays.asList("a", "b", "c"), ","));
        assertEquals("", StringUtils.join(Collections.emptyList(), ","));
    }

    @Test
    @DisplayName("join - 应该正确连接数组")
    void join_array_shouldJoinCorrectly() {
        assertEquals("1-2-3", StringUtils.join(new Integer[]{1, 2, 3}, "-"));
    }

    // ========== 生成测试 ==========

    @Test
    @DisplayName("uuid - 应该生成有效的UUID")
    void uuid_shouldGenerateValidUuid() {
        String uuid = StringUtils.uuid();
        assertNotNull(uuid);
        assertEquals(36, uuid.length());
        assertTrue(uuid.contains("-"));
    }

    @Test
    @DisplayName("simpleUuid - 应该生成不带连字符的UUID")
    void simpleUuid_shouldGenerateWithoutHyphens() {
        String uuid = StringUtils.simpleUuid();
        assertNotNull(uuid);
        assertEquals(32, uuid.length());
        assertFalse(uuid.contains("-"));
    }

    @Test
    @DisplayName("shortUuid - 应该生成16位UUID")
    void shortUuid_shouldGenerate16Chars() {
        String uuid = StringUtils.shortUuid();
        assertNotNull(uuid);
        assertEquals(16, uuid.length());
    }

    // ========== 格式验证测试 ==========

    @Test
    @DisplayName("isMobile - 应该正确验证手机号")
    void isMobile_shouldValidateCorrectly() {
        assertTrue(StringUtils.isMobile("13800138000"));
        assertTrue(StringUtils.isMobile("15912345678"));
        assertFalse(StringUtils.isMobile("12345678901"));
        assertFalse(StringUtils.isMobile("1380013800"));
        assertFalse(StringUtils.isMobile(""));
        assertFalse(StringUtils.isMobile(null));
    }

    @Test
    @DisplayName("isEmail - 应该正确验证邮箱")
    void isEmail_shouldValidateCorrectly() {
        assertTrue(StringUtils.isEmail("test@example.com"));
        assertTrue(StringUtils.isEmail("user.name@domain.org"));
        assertFalse(StringUtils.isEmail("invalid"));
        assertFalse(StringUtils.isEmail("@example.com"));
        assertFalse(StringUtils.isEmail(""));
    }

    @Test
    @DisplayName("isNumeric - 应该正确判断数字")
    void isNumeric_shouldValidateCorrectly() {
        assertTrue(StringUtils.isNumeric("12345"));
        assertTrue(StringUtils.isNumeric("0"));
        assertFalse(StringUtils.isNumeric("12.34"));
        assertFalse(StringUtils.isNumeric("abc"));
        assertFalse(StringUtils.isNumeric(""));
    }

    // ========== 脱敏测试 ==========

    @Test
    @DisplayName("maskMobile - 应该正确脱敏手机号")
    void maskMobile_shouldMaskCorrectly() {
        assertEquals("138****8000", StringUtils.maskMobile("13800138000"));
    }

    @Test
    @DisplayName("maskEmail - 应该正确脱敏邮箱")
    void maskEmail_shouldMaskCorrectly() {
        assertEquals("t***@example.com", StringUtils.maskEmail("test@example.com"));
    }

    @Test
    @DisplayName("maskIdCard - 应该正确脱敏身份证")
    void maskIdCard_shouldMaskCorrectly() {
        assertEquals("110101********1234", StringUtils.maskIdCard("110101199001011234"));
    }

    @Test
    @DisplayName("maskName - 应该正确脱敏姓名")
    void maskName_shouldMaskCorrectly() {
        assertEquals("张*", StringUtils.maskName("张三"));
        assertEquals("张*丰", StringUtils.maskName("张三丰"));
        assertEquals("司**格", StringUtils.maskName("司马相格"));
    }
}