package com.mota.common.feign.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.result.Result;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;

/**
 * Feign错误解码器
 * 将下游服务的错误响应转换为业务异常
 */
@Slf4j
public class FeignErrorDecoder implements ErrorDecoder {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ErrorDecoder defaultDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("Feign调用失败: methodKey={}, status={}, reason={}", 
                methodKey, response.status(), response.reason());

        try {
            if (response.body() != null) {
                try (InputStream inputStream = response.body().asInputStream()) {
                    Result<?> result = objectMapper.readValue(inputStream, Result.class);
                    if (result != null && result.getCode() != null) {
                        return new BusinessException(result.getCode(), result.getMessage());
                    }
                }
            }
        } catch (IOException e) {
            log.warn("解析Feign错误响应失败: {}", e.getMessage());
        }

        // 根据HTTP状态码返回不同的异常
        return switch (response.status()) {
            case 400 -> new BusinessException(400, "请求参数错误");
            case 401 -> new BusinessException(401, "未授权访问");
            case 403 -> new BusinessException(403, "禁止访问");
            case 404 -> new BusinessException(404, "服务资源不存在");
            case 500 -> new BusinessException(500, "服务内部错误");
            case 502 -> new BusinessException(502, "网关错误");
            case 503 -> new BusinessException(503, "服务不可用");
            case 504 -> new BusinessException(504, "网关超时");
            default -> defaultDecoder.decode(methodKey, response);
        };
    }
}