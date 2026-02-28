package com.mota.common.core.result;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果封装类
 * <p>
 * 所有API接口的统一返回格式，包含状态码、消息、数据和时间戳。
 * 使用泛型支持各种类型的数据返回。
 * </p>
 *
 * <p>使用示例：</p>
 * <pre>{@code
 * // 成功响应
 * return Result.success(data);
 *
 * // 失败响应
 * return Result.fail("操作失败");
 *
 * // 自定义状态码
 * return Result.fail(ResultCode.UNAUTHORIZED);
 * }</pre>
 *
 * @param <T> 响应数据类型
 * @author Mota
 * @since 1.0.0
 * @see ResultCode
 * @see IResultCode
 */
@Data
@Schema(description = "统一响应结果")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     * <p>
     * 200表示成功，其他值表示失败
     * </p>
     */
    @Schema(description = "状态码", example = "200")
    private Integer code;

    /**
     * 响应消息
     */
    @Schema(description = "消息", example = "操作成功")
    private String message;

    /**
     * 响应数据
     */
    @Schema(description = "数据")
    private T data;

    /**
     * 响应时间戳（毫秒）
     */
    @Schema(description = "时间戳", example = "1710483045000")
    private Long timestamp;

    /**
     * 默认构造函数
     * <p>
     * 自动设置当前时间戳
     * </p>
     */
    public Result() {
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 带状态码和消息的构造函数
     *
     * @param code    状态码
     * @param message 响应消息
     */
    public Result(Integer code, String message) {
        this();
        this.code = code;
        this.message = message;
    }

    /**
     * 完整参数构造函数
     *
     * @param code    状态码
     * @param message 响应消息
     * @param data    响应数据
     */
    public Result(Integer code, String message, T data) {
        this(code, message);
        this.data = data;
    }

    /**
     * 创建成功响应（无数据）
     *
     * @param <T> 数据类型
     * @return 成功响应结果
     */
    public static <T> Result<T> success() {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage());
    }

    /**
     * 创建成功响应（带数据）
     *
     * @param data 响应数据
     * @param <T>  数据类型
     * @return 成功响应结果
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), data);
    }

    /**
     * 创建成功响应（带自定义消息和数据）
     *
     * @param message 自定义消息
     * @param data    响应数据
     * @param <T>     数据类型
     * @return 成功响应结果
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), message, data);
    }

    /**
     * 创建失败响应（使用默认失败状态码和消息）
     *
     * @param <T> 数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> fail() {
        return new Result<>(ResultCode.FAIL.getCode(), ResultCode.FAIL.getMessage());
    }

    /**
     * 创建失败响应（带自定义消息）
     *
     * @param message 错误消息
     * @param <T>     数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> fail(String message) {
        return new Result<>(ResultCode.FAIL.getCode(), message);
    }

    /**
     * 创建失败响应（带自定义状态码和消息）
     *
     * @param code    状态码
     * @param message 错误消息
     * @param <T>     数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> fail(Integer code, String message) {
        return new Result<>(code, message);
    }

    /**
     * 创建失败响应（使用预定义的结果码）
     *
     * @param resultCode 预定义结果码
     * @param <T>        数据类型
     * @return 失败响应结果
     */
    public static <T> Result<T> fail(IResultCode resultCode) {
        return new Result<>(resultCode.getCode(), resultCode.getMessage());
    }

    /**
     * 判断响应是否成功
     *
     * @return true表示成功，false表示失败
     */
    public boolean isSuccess() {
        return ResultCode.SUCCESS.getCode().equals(this.code);
    }
}