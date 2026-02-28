package com.mota.common.core.util;

import java.util.Collection;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * 字符串工具类
 * 
 * 提供常用的字符串操作方法，避免代码重复
 *
 * @author Mota
 * @since 1.0.0
 */
public final class StringUtils {

    /**
     * 空字符串
     */
    public static final String EMPTY = "";

    /**
     * 空格
     */
    public static final String SPACE = " ";

    /**
     * 逗号
     */
    public static final String COMMA = ",";

    /**
     * 点号
     */
    public static final String DOT = ".";

    /**
     * 斜杠
     */
    public static final String SLASH = "/";

    /**
     * 下划线
     */
    public static final String UNDERSCORE = "_";

    /**
     * 连字符
     */
    public static final String HYPHEN = "-";

    /**
     * 冒号
     */
    public static final String COLON = ":";

    /**
     * 手机号正则
     */
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    /**
     * 邮箱正则
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    /**
     * URL正则
     */
    private static final Pattern URL_PATTERN = Pattern.compile("^(https?|ftp)://[^\\s/$.?#].[^\\s]*$", Pattern.CASE_INSENSITIVE);

    /**
     * 身份证正则（18位）
     */
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$");

    /**
     * 中文正则
     */
    private static final Pattern CHINESE_PATTERN = Pattern.compile("[\\u4e00-\\u9fa5]");

    private StringUtils() {
        throw new UnsupportedOperationException("工具类不允许实例化");
    }

    // ========== 空值判断 ==========

    /**
     * 判断字符串是否为空
     */
    public static boolean isEmpty(CharSequence cs) {
        return cs == null || cs.length() == 0;
    }

    /**
     * 判断字符串是否不为空
     */
    public static boolean isNotEmpty(CharSequence cs) {
        return !isEmpty(cs);
    }

    /**
     * 判断字符串是否为空白（空或只包含空白字符）
     */
    public static boolean isBlank(CharSequence cs) {
        if (isEmpty(cs)) {
            return true;
        }
        for (int i = 0; i < cs.length(); i++) {
            if (!Character.isWhitespace(cs.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断字符串是否不为空白
     */
    public static boolean isNotBlank(CharSequence cs) {
        return !isBlank(cs);
    }

    /**
     * 判断所有字符串是否都不为空
     */
    public static boolean isNoneEmpty(CharSequence... css) {
        if (css == null || css.length == 0) {
            return false;
        }
        for (CharSequence cs : css) {
            if (isEmpty(cs)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断所有字符串是否都不为空白
     */
    public static boolean isNoneBlank(CharSequence... css) {
        if (css == null || css.length == 0) {
            return false;
        }
        for (CharSequence cs : css) {
            if (isBlank(cs)) {
                return false;
            }
        }
        return true;
    }

    // ========== 字符串处理 ==========

    /**
     * 去除首尾空白
     */
    public static String trim(String str) {
        return str == null ? null : str.trim();
    }

    /**
     * 去除首尾空白，null返回空字符串
     */
    public static String trimToEmpty(String str) {
        return str == null ? EMPTY : str.trim();
    }

    /**
     * 去除首尾空白，空返回null
     */
    public static String trimToNull(String str) {
        String trimmed = trim(str);
        return isEmpty(trimmed) ? null : trimmed;
    }

    /**
     * 默认值处理
     */
    public static String defaultIfEmpty(String str, String defaultStr) {
        return isEmpty(str) ? defaultStr : str;
    }

    /**
     * 默认值处理（空白）
     */
    public static String defaultIfBlank(String str, String defaultStr) {
        return isBlank(str) ? defaultStr : str;
    }

    /**
     * 首字母大写
     */
    public static String capitalize(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }

    /**
     * 首字母小写
     */
    public static String uncapitalize(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return Character.toLowerCase(str.charAt(0)) + str.substring(1);
    }

    /**
     * 下划线转驼峰
     */
    public static String toCamelCase(String str) {
        if (isEmpty(str)) {
            return str;
        }
        StringBuilder result = new StringBuilder();
        boolean nextUpper = false;
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if (c == '_') {
                nextUpper = true;
            } else {
                if (nextUpper) {
                    result.append(Character.toUpperCase(c));
                    nextUpper = false;
                } else {
                    result.append(Character.toLowerCase(c));
                }
            }
        }
        return result.toString();
    }

    /**
     * 驼峰转下划线
     */
    public static String toSnakeCase(String str) {
        if (isEmpty(str)) {
            return str;
        }
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if (Character.isUpperCase(c)) {
                if (i > 0) {
                    result.append('_');
                }
                result.append(Character.toLowerCase(c));
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    // ========== 字符串截取 ==========

    /**
     * 截取字符串（安全）
     */
    public static String substring(String str, int start, int end) {
        if (str == null) {
            return null;
        }
        if (start < 0) {
            start = 0;
        }
        if (end > str.length()) {
            end = str.length();
        }
        if (start > end) {
            return EMPTY;
        }
        return str.substring(start, end);
    }

    /**
     * 截取字符串，超出部分用省略号
     */
    public static String abbreviate(String str, int maxLength) {
        if (str == null || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength - 3) + "...";
    }

    /**
     * 左填充
     */
    public static String leftPad(String str, int size, char padChar) {
        if (str == null) {
            str = EMPTY;
        }
        int padLength = size - str.length();
        if (padLength <= 0) {
            return str;
        }
        return String.valueOf(padChar).repeat(padLength) + str;
    }

    /**
     * 右填充
     */
    public static String rightPad(String str, int size, char padChar) {
        if (str == null) {
            str = EMPTY;
        }
        int padLength = size - str.length();
        if (padLength <= 0) {
            return str;
        }
        return str + String.valueOf(padChar).repeat(padLength);
    }

    // ========== 字符串连接 ==========

    /**
     * 连接字符串
     */
    public static String join(Collection<?> collection, String separator) {
        if (collection == null || collection.isEmpty()) {
            return EMPTY;
        }
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Object item : collection) {
            if (!first) {
                sb.append(separator);
            }
            sb.append(item);
            first = false;
        }
        return sb.toString();
    }

    /**
     * 连接字符串
     */
    public static String join(Object[] array, String separator) {
        if (array == null || array.length == 0) {
            return EMPTY;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < array.length; i++) {
            if (i > 0) {
                sb.append(separator);
            }
            sb.append(array[i]);
        }
        return sb.toString();
    }

    // ========== 生成 ==========

    /**
     * 生成UUID（带连字符）
     */
    public static String uuid() {
        return UUID.randomUUID().toString();
    }

    /**
     * 生成UUID（不带连字符）
     */
    public static String simpleUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 生成短UUID（16位）
     */
    public static String shortUuid() {
        return simpleUuid().substring(0, 16);
    }

    // ========== 格式验证 ==========

    /**
     * 验证手机号
     */
    public static boolean isMobile(String str) {
        return isNotEmpty(str) && MOBILE_PATTERN.matcher(str).matches();
    }

    /**
     * 验证邮箱
     */
    public static boolean isEmail(String str) {
        return isNotEmpty(str) && EMAIL_PATTERN.matcher(str).matches();
    }

    /**
     * 判断是否包含中文
     */
    public static boolean containsChinese(String str) {
        return isNotEmpty(str) && CHINESE_PATTERN.matcher(str).find();
    }

    /**
     * 判断是否为数字
     */
    public static boolean isNumeric(String str) {
        if (isEmpty(str)) {
            return false;
        }
        for (int i = 0; i < str.length(); i++) {
            if (!Character.isDigit(str.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    /**
     * 验证URL格式
     */
    public static boolean isUrl(String str) {
        return isNotEmpty(str) && URL_PATTERN.matcher(str).matches();
    }

    /**
     * 验证身份证号码（18位）
     */
    public static boolean isIdCard(String str) {
        if (isEmpty(str) || str.length() != 18) {
            return false;
        }
        if (!ID_CARD_PATTERN.matcher(str).matches()) {
            return false;
        }
        // 校验位验证
        int[] weights = {7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2};
        char[] checkCodes = {'1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'};
        int sum = 0;
        for (int i = 0; i < 17; i++) {
            sum += (str.charAt(i) - '0') * weights[i];
        }
        char checkCode = checkCodes[sum % 11];
        return Character.toUpperCase(str.charAt(17)) == checkCode;
    }

    // ========== 脱敏处理 ==========

    /**
     * 手机号脱敏（中间4位用****替换）
     */
    public static String maskMobile(String mobile) {
        if (isEmpty(mobile) || mobile.length() < 11) {
            return mobile;
        }
        return mobile.substring(0, 3) + "****" + mobile.substring(7);
    }

    /**
     * 邮箱脱敏
     */
    public static String maskEmail(String email) {
        if (isEmpty(email) || !email.contains("@")) {
            return email;
        }
        int atIndex = email.indexOf("@");
        if (atIndex <= 1) {
            return email;
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }

    /**
     * 身份证脱敏（中间8位用****替换）
     */
    public static String maskIdCard(String idCard) {
        if (isEmpty(idCard) || idCard.length() < 15) {
            return idCard;
        }
        return idCard.substring(0, 6) + "********" + idCard.substring(14);
    }

    /**
     * 姓名脱敏
     */
    public static String maskName(String name) {
        if (isEmpty(name)) {
            return name;
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        if (name.length() > 2) {
            return name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1);
        }
        return name;
    }
}