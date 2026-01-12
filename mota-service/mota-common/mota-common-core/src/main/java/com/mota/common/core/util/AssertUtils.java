package com.mota.common.core.util;

import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.result.ResultCode;

import java.util.Collection;
import java.util.Map;

/**
 * 断言工具类
 * 用于参数校验，校验失败时抛出业务异常
 * 
 * @author Mota
 * @since 1.0.0
 */
public class AssertUtils {

    private AssertUtils() {
        // 私有构造函数
    }

    // ========== 对象断言 ==========

    /**
     * 断言对象不为空
     *
     * @param object  对象
     * @param message 错误消息
     */
    public static void notNull(Object object, String message) {
        if (object == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言对象不为空
     *
     * @param object     对象
     * @param resultCode 错误码
     */
    public static void notNull(Object object, ResultCode resultCode) {
        if (object == null) {
            throw new BusinessException(resultCode);
        }
    }

    /**
     * 断言对象为空
     *
     * @param object  对象
     * @param message 错误消息
     */
    public static void isNull(Object object, String message) {
        if (object != null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    // ========== 字符串断言 ==========

    /**
     * 断言字符串不为空
     *
     * @param str     字符串
     * @param message 错误消息
     */
    public static void notEmpty(String str, String message) {
        if (StringUtils.isEmpty(str)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言字符串不为空白
     *
     * @param str     字符串
     * @param message 错误消息
     */
    public static void notBlank(String str, String message) {
        if (StringUtils.isBlank(str)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言字符串长度在指定范围内
     *
     * @param str       字符串
     * @param minLength 最小长度
     * @param maxLength 最大长度
     * @param message   错误消息
     */
    public static void length(String str, int minLength, int maxLength, String message) {
        if (str == null || str.length() < minLength || str.length() > maxLength) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    // ========== 集合断言 ==========

    /**
     * 断言集合不为空
     *
     * @param collection 集合
     * @param message    错误消息
     */
    public static void notEmpty(Collection<?> collection, String message) {
        if (collection == null || collection.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言Map不为空
     *
     * @param map     Map
     * @param message 错误消息
     */
    public static void notEmpty(Map<?, ?> map, String message) {
        if (map == null || map.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数组不为空
     *
     * @param array   数组
     * @param message 错误消息
     */
    public static void notEmpty(Object[] array, String message) {
        if (array == null || array.length == 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    // ========== 布尔断言 ==========

    /**
     * 断言表达式为真
     *
     * @param expression 表达式
     * @param message    错误消息
     */
    public static void isTrue(boolean expression, String message) {
        if (!expression) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言表达式为真
     *
     * @param expression 表达式
     * @param resultCode 错误码
     */
    public static void isTrue(boolean expression, ResultCode resultCode) {
        if (!expression) {
            throw new BusinessException(resultCode);
        }
    }

    /**
     * 断言表达式为假
     *
     * @param expression 表达式
     * @param message    错误消息
     */
    public static void isFalse(boolean expression, String message) {
        if (expression) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言表达式为假
     *
     * @param expression 表达式
     * @param resultCode 错误码
     */
    public static void isFalse(boolean expression, ResultCode resultCode) {
        if (expression) {
            throw new BusinessException(resultCode);
        }
    }

    // ========== 数值断言 ==========

    /**
     * 断言数值大于指定值
     *
     * @param number  数值
     * @param min     最小值
     * @param message 错误消息
     */
    public static void greaterThan(long number, long min, String message) {
        if (number <= min) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数值大于等于指定值
     *
     * @param number  数值
     * @param min     最小值
     * @param message 错误消息
     */
    public static void greaterThanOrEqual(long number, long min, String message) {
        if (number < min) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数值小于指定值
     *
     * @param number  数值
     * @param max     最大值
     * @param message 错误消息
     */
    public static void lessThan(long number, long max, String message) {
        if (number >= max) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数值小于等于指定值
     *
     * @param number  数值
     * @param max     最大值
     * @param message 错误消息
     */
    public static void lessThanOrEqual(long number, long max, String message) {
        if (number > max) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数值在指定范围内
     *
     * @param number  数值
     * @param min     最小值
     * @param max     最大值
     * @param message 错误消息
     */
    public static void between(long number, long min, long max, String message) {
        if (number < min || number > max) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数值为正数
     *
     * @param number  数值
     * @param message 错误消息
     */
    public static void positive(long number, String message) {
        if (number <= 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言数值为非负数
     *
     * @param number  数值
     * @param message 错误消息
     */
    public static void nonNegative(long number, String message) {
        if (number < 0) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    // ========== 相等断言 ==========

    /**
     * 断言两个对象相等
     *
     * @param obj1    对象1
     * @param obj2    对象2
     * @param message 错误消息
     */
    public static void equals(Object obj1, Object obj2, String message) {
        if (obj1 == null && obj2 == null) {
            return;
        }
        if (obj1 == null || !obj1.equals(obj2)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言两个对象不相等
     *
     * @param obj1    对象1
     * @param obj2    对象2
     * @param message 错误消息
     */
    public static void notEquals(Object obj1, Object obj2, String message) {
        if (obj1 == null && obj2 == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
        if (obj1 != null && obj1.equals(obj2)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    // ========== 格式断言 ==========

    /**
     * 断言是有效的手机号
     *
     * @param mobile  手机号
     * @param message 错误消息
     */
    public static void isMobile(String mobile, String message) {
        if (!StringUtils.isMobile(mobile)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言是有效的邮箱
     *
     * @param email   邮箱
     * @param message 错误消息
     */
    public static void isEmail(String email, String message) {
        if (!StringUtils.isEmail(email)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言是有效的URL
     *
     * @param url     URL
     * @param message 错误消息
     */
    public static void isUrl(String url, String message) {
        if (!StringUtils.isUrl(url)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    /**
     * 断言是有效的身份证号
     *
     * @param idCard  身份证号
     * @param message 错误消息
     */
    public static void isIdCard(String idCard, String message) {
        if (!StringUtils.isIdCard(idCard)) {
            throw new BusinessException(ResultCode.PARAM_ERROR.getCode(), message);
        }
    }

    // ========== 状态断言 ==========

    /**
     * 断言状态（用于业务状态校验）
     *
     * @param state   状态
     * @param message 错误消息
     */
    public static void state(boolean state, String message) {
        if (!state) {
            throw new BusinessException(ResultCode.BUSINESS_ERROR.getCode(), message);
        }
    }

    /**
     * 断言状态
     *
     * @param state      状态
     * @param resultCode 错误码
     */
    public static void state(boolean state, ResultCode resultCode) {
        if (!state) {
            throw new BusinessException(resultCode);
        }
    }

    /**
     * 直接抛出业务异常
     *
     * @param message 错误消息
     */
    public static void fail(String message) {
        throw new BusinessException(ResultCode.BUSINESS_ERROR.getCode(), message);
    }

    /**
     * 直接抛出业务异常
     *
     * @param resultCode 错误码
     */
    public static void fail(ResultCode resultCode) {
        throw new BusinessException(resultCode);
    }

    /**
     * 直接抛出业务异常
     *
     * @param code    错误码
     * @param message 错误消息
     */
    public static void fail(int code, String message) {
        throw new BusinessException(code, message);
    }
}