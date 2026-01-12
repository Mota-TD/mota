package com.mota.common.core.util;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 字符串工具类
 * 
 * @author Mota
 * @since 1.0.0
 */
public class StringUtils {

    /**
     * 空字符串
     */
    public static final String EMPTY = "";

    /**
     * 空格
     */
    public static final String SPACE = " ";

    /**
     * 下划线
     */
    public static final String UNDERSCORE = "_";

    /**
     * 中划线
     */
    public static final String HYPHEN = "-";

    /**
     * 逗号
     */
    public static final String COMMA = ",";

    /**
     * 点号
     */
    public static final String DOT = ".";

    /**
     * 冒号
     */
    public static final String COLON = ":";

    /**
     * 斜杠
     */
    public static final String SLASH = "/";

    /**
     * 驼峰转下划线正则
     */
    private static final Pattern CAMEL_PATTERN = Pattern.compile("[A-Z]");

    /**
     * 下划线转驼峰正则
     */
    private static final Pattern UNDERSCORE_PATTERN = Pattern.compile("_([a-z])");

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
    private static final Pattern URL_PATTERN = Pattern.compile("^(https?|ftp)://[^\\s/$.?#].[^\\s]*$");

    /**
     * 身份证号正则（简单校验）
     */
    private static final Pattern ID_CARD_PATTERN = Pattern.compile("^\\d{17}[\\dXx]$");

    private StringUtils() {
        // 私有构造函数
    }

    // ========== 判空 ==========

    /**
     * 判断字符串是否为空
     *
     * @param str 字符串
     * @return 是否为空
     */
    public static boolean isEmpty(CharSequence str) {
        return str == null || str.length() == 0;
    }

    /**
     * 判断字符串是否不为空
     *
     * @param str 字符串
     * @return 是否不为空
     */
    public static boolean isNotEmpty(CharSequence str) {
        return !isEmpty(str);
    }

    /**
     * 判断字符串是否为空白
     *
     * @param str 字符串
     * @return 是否为空白
     */
    public static boolean isBlank(CharSequence str) {
        if (isEmpty(str)) {
            return true;
        }
        for (int i = 0; i < str.length(); i++) {
            if (!Character.isWhitespace(str.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断字符串是否不为空白
     *
     * @param str 字符串
     * @return 是否不为空白
     */
    public static boolean isNotBlank(CharSequence str) {
        return !isBlank(str);
    }

    /**
     * 判断多个字符串是否都不为空
     *
     * @param strs 字符串数组
     * @return 是否都不为空
     */
    public static boolean isAllNotEmpty(CharSequence... strs) {
        if (strs == null || strs.length == 0) {
            return false;
        }
        for (CharSequence str : strs) {
            if (isEmpty(str)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断多个字符串是否有任一为空
     *
     * @param strs 字符串数组
     * @return 是否有任一为空
     */
    public static boolean isAnyEmpty(CharSequence... strs) {
        return !isAllNotEmpty(strs);
    }

    // ========== 处理 ==========

    /**
     * 去除首尾空白
     *
     * @param str 字符串
     * @return 处理后的字符串
     */
    public static String trim(String str) {
        return str != null ? str.trim() : null;
    }

    /**
     * 去除所有空白
     *
     * @param str 字符串
     * @return 处理后的字符串
     */
    public static String trimAll(String str) {
        return str != null ? str.replaceAll("\\s+", "") : null;
    }

    /**
     * 如果为空则返回默认值
     *
     * @param str        字符串
     * @param defaultStr 默认值
     * @return 结果
     */
    public static String defaultIfEmpty(String str, String defaultStr) {
        return isEmpty(str) ? defaultStr : str;
    }

    /**
     * 如果为空白则返回默认值
     *
     * @param str        字符串
     * @param defaultStr 默认值
     * @return 结果
     */
    public static String defaultIfBlank(String str, String defaultStr) {
        return isBlank(str) ? defaultStr : str;
    }

    /**
     * 截取字符串
     *
     * @param str    字符串
     * @param start  开始位置
     * @param length 长度
     * @return 截取后的字符串
     */
    public static String substring(String str, int start, int length) {
        if (isEmpty(str)) {
            return str;
        }
        int end = Math.min(start + length, str.length());
        return str.substring(start, end);
    }

    /**
     * 左填充
     *
     * @param str    字符串
     * @param length 目标长度
     * @param padStr 填充字符
     * @return 填充后的字符串
     */
    public static String leftPad(String str, int length, String padStr) {
        if (str == null) {
            str = EMPTY;
        }
        if (str.length() >= length) {
            return str;
        }
        StringBuilder sb = new StringBuilder();
        while (sb.length() < length - str.length()) {
            sb.append(padStr);
        }
        sb.append(str);
        return sb.substring(sb.length() - length);
    }

    /**
     * 右填充
     *
     * @param str    字符串
     * @param length 目标长度
     * @param padStr 填充字符
     * @return 填充后的字符串
     */
    public static String rightPad(String str, int length, String padStr) {
        if (str == null) {
            str = EMPTY;
        }
        if (str.length() >= length) {
            return str;
        }
        StringBuilder sb = new StringBuilder(str);
        while (sb.length() < length) {
            sb.append(padStr);
        }
        return sb.substring(0, length);
    }

    // ========== 转换 ==========

    /**
     * 驼峰转下划线
     *
     * @param str 驼峰字符串
     * @return 下划线字符串
     */
    public static String camelToUnderscore(String str) {
        if (isEmpty(str)) {
            return str;
        }
        Matcher matcher = CAMEL_PATTERN.matcher(str);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(sb, "_" + matcher.group(0).toLowerCase());
        }
        matcher.appendTail(sb);
        return sb.toString().toLowerCase();
    }

    /**
     * 下划线转驼峰
     *
     * @param str 下划线字符串
     * @return 驼峰字符串
     */
    public static String underscoreToCamel(String str) {
        if (isEmpty(str)) {
            return str;
        }
        Matcher matcher = UNDERSCORE_PATTERN.matcher(str.toLowerCase());
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(sb, matcher.group(1).toUpperCase());
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    /**
     * 首字母大写
     *
     * @param str 字符串
     * @return 首字母大写的字符串
     */
    public static String capitalize(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return Character.toUpperCase(str.charAt(0)) + str.substring(1);
    }

    /**
     * 首字母小写
     *
     * @param str 字符串
     * @return 首字母小写的字符串
     */
    public static String uncapitalize(String str) {
        if (isEmpty(str)) {
            return str;
        }
        return Character.toLowerCase(str.charAt(0)) + str.substring(1);
    }

    // ========== 分割与连接 ==========

    /**
     * 分割字符串
     *
     * @param str       字符串
     * @param separator 分隔符
     * @return 分割后的数组
     */
    public static String[] split(String str, String separator) {
        if (isEmpty(str)) {
            return new String[0];
        }
        return str.split(Pattern.quote(separator));
    }

    /**
     * 分割字符串为列表
     *
     * @param str       字符串
     * @param separator 分隔符
     * @return 分割后的列表
     */
    public static List<String> splitToList(String str, String separator) {
        return Arrays.asList(split(str, separator));
    }

    /**
     * 连接字符串
     *
     * @param separator 分隔符
     * @param elements  元素
     * @return 连接后的字符串
     */
    public static String join(String separator, String... elements) {
        if (elements == null || elements.length == 0) {
            return EMPTY;
        }
        return String.join(separator, elements);
    }

    /**
     * 连接集合
     *
     * @param separator 分隔符
     * @param elements  元素集合
     * @return 连接后的字符串
     */
    public static String join(String separator, Collection<String> elements) {
        if (elements == null || elements.isEmpty()) {
            return EMPTY;
        }
        return String.join(separator, elements);
    }

    // ========== 校验 ==========

    /**
     * 判断是否是手机号
     *
     * @param str 字符串
     * @return 是否是手机号
     */
    public static boolean isMobile(String str) {
        return isNotEmpty(str) && MOBILE_PATTERN.matcher(str).matches();
    }

    /**
     * 判断是否是邮箱
     *
     * @param str 字符串
     * @return 是否是邮箱
     */
    public static boolean isEmail(String str) {
        return isNotEmpty(str) && EMAIL_PATTERN.matcher(str).matches();
    }

    /**
     * 判断是否是URL
     *
     * @param str 字符串
     * @return 是否是URL
     */
    public static boolean isUrl(String str) {
        return isNotEmpty(str) && URL_PATTERN.matcher(str).matches();
    }

    /**
     * 判断是否是身份证号
     *
     * @param str 字符串
     * @return 是否是身份证号
     */
    public static boolean isIdCard(String str) {
        return isNotEmpty(str) && ID_CARD_PATTERN.matcher(str).matches();
    }

    /**
     * 判断是否是数字
     *
     * @param str 字符串
     * @return 是否是数字
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
     * 判断是否包含中文
     *
     * @param str 字符串
     * @return 是否包含中文
     */
    public static boolean containsChinese(String str) {
        if (isEmpty(str)) {
            return false;
        }
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if (c >= 0x4E00 && c <= 0x9FA5) {
                return true;
            }
        }
        return false;
    }

    // ========== 脱敏 ==========

    /**
     * 手机号脱敏
     *
     * @param mobile 手机号
     * @return 脱敏后的手机号
     */
    public static String maskMobile(String mobile) {
        if (isEmpty(mobile) || mobile.length() != 11) {
            return mobile;
        }
        return mobile.substring(0, 3) + "****" + mobile.substring(7);
    }

    /**
     * 邮箱脱敏
     *
     * @param email 邮箱
     * @return 脱敏后的邮箱
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
     * 身份证号脱敏
     *
     * @param idCard 身份证号
     * @return 脱敏后的身份证号
     */
    public static String maskIdCard(String idCard) {
        if (isEmpty(idCard) || idCard.length() < 8) {
            return idCard;
        }
        return idCard.substring(0, 4) + "**********" + idCard.substring(idCard.length() - 4);
    }

    /**
     * 姓名脱敏
     *
     * @param name 姓名
     * @return 脱敏后的姓名
     */
    public static String maskName(String name) {
        if (isEmpty(name)) {
            return name;
        }
        if (name.length() == 1) {
            return "*";
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        StringBuilder sb = new StringBuilder();
        sb.append(name.charAt(0));
        for (int i = 1; i < name.length() - 1; i++) {
            sb.append("*");
        }
        sb.append(name.charAt(name.length() - 1));
        return sb.toString();
    }

    /**
     * 银行卡号脱敏
     *
     * @param bankCard 银行卡号
     * @return 脱敏后的银行卡号
     */
    public static String maskBankCard(String bankCard) {
        if (isEmpty(bankCard) || bankCard.length() < 8) {
            return bankCard;
        }
        return bankCard.substring(0, 4) + " **** **** " + bankCard.substring(bankCard.length() - 4);
    }

    // ========== 其他 ==========

    /**
     * 生成随机字符串
     *
     * @param length 长度
     * @return 随机字符串
     */
    public static String randomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * 生成随机数字字符串
     *
     * @param length 长度
     * @return 随机数字字符串
     */
    public static String randomNumeric(int length) {
        String chars = "0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * 生成UUID
     *
     * @return UUID字符串
     */
    public static String uuid() {
        return UUID.randomUUID().toString();
    }

    /**
     * 生成简化UUID（无横线）
     *
     * @return 简化UUID字符串
     */
    public static String simpleUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 格式化字符串
     *
     * @param template 模板
     * @param args     参数
     * @return 格式化后的字符串
     */
    public static String format(String template, Object... args) {
        if (isEmpty(template) || args == null || args.length == 0) {
            return template;
        }
        return String.format(template, args);
    }

    /**
     * 占位符替换
     *
     * @param template 模板（使用{}作为占位符）
     * @param args     参数
     * @return 替换后的字符串
     */
    public static String formatPlaceholder(String template, Object... args) {
        if (isEmpty(template) || args == null || args.length == 0) {
            return template;
        }
        StringBuilder sb = new StringBuilder(template);
        for (Object arg : args) {
            int index = sb.indexOf("{}");
            if (index == -1) {
                break;
            }
            sb.replace(index, index + 2, String.valueOf(arg));
        }
        return sb.toString();
    }
}