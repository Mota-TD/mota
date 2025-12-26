package com.mota.common.core.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果（简化版）
 * 提供 R.ok() 风格的API
 *
 * @param <T> 数据类型
 */
@Data
@Schema(description = "统一响应结果")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 成功状态码 */
    public static final int SUCCESS_CODE = 200;
    
    /** 失败状态码 */
    public static final int FAIL_CODE = 500;

    @Schema(description = "状态码")
    private Integer code;

    @Schema(description = "消息")
    private String msg;

    @Schema(description = "数据")
    private T data;

    @Schema(description = "时间戳")
    private Long timestamp;

    public R() {
        this.timestamp = System.currentTimeMillis();
    }

    public R(Integer code, String msg) {
        this();
        this.code = code;
        this.msg = msg;
    }

    public R(Integer code, String msg, T data) {
        this(code, msg);
        this.data = data;
    }

    /**
     * 成功响应
     */
    public static <T> R<T> ok() {
        return new R<>(SUCCESS_CODE, "操作成功");
    }

    /**
     * 成功响应（带数据）
     */
    public static <T> R<T> ok(T data) {
        return new R<>(SUCCESS_CODE, "操作成功", data);
    }

    /**
     * 成功响应（带消息和数据）
     */
    public static <T> R<T> ok(String msg, T data) {
        return new R<>(SUCCESS_CODE, msg, data);
    }

    /**
     * 失败响应
     */
    public static <T> R<T> fail() {
        return new R<>(FAIL_CODE, "操作失败");
    }

    /**
     * 失败响应（带消息）
     */
    public static <T> R<T> fail(String msg) {
        return new R<>(FAIL_CODE, msg);
    }

    /**
     * 失败响应（带状态码和消息）
     */
    public static <T> R<T> fail(Integer code, String msg) {
        return new R<>(code, msg);
    }

    /**
     * 判断是否成功
     */
    public boolean isSuccess() {
        return SUCCESS_CODE == this.code;
    }
}