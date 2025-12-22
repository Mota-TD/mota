package com.mota.common.core.result;

/**
 * 结果码接口
 */
public interface IResultCode {

    /**
     * 获取状态码
     */
    Integer getCode();

    /**
     * 获取消息
     */
    String getMessage();
}