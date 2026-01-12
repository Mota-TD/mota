package com.mota.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Map;

/**
 * 集成事件基类
 * 用于跨服务的事件通信
 * 
 * @author Mota
 * @since 1.0.0
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public abstract class IntegrationEvent extends BaseEvent {

    private static final long serialVersionUID = 1L;

    /**
     * 目标服务
     */
    private String targetService;

    /**
     * 回调主题（用于请求-响应模式）
     */
    private String replyTopic;

    /**
     * 关联ID（用于关联请求和响应）
     */
    private String correlationId;

    /**
     * 扩展属性
     */
    private Map<String, Object> headers;

    /**
     * 重试次数
     */
    private Integer retryCount;

    /**
     * 最大重试次数
     */
    private Integer maxRetries;

    @Override
    public String getTopic() {
        return "mota-integration-events";
    }

    /**
     * 是否可以重试
     *
     * @return 是否可以重试
     */
    public boolean canRetry() {
        if (retryCount == null) {
            retryCount = 0;
        }
        if (maxRetries == null) {
            maxRetries = 3;
        }
        return retryCount < maxRetries;
    }

    /**
     * 增加重试次数
     */
    public void incrementRetryCount() {
        if (retryCount == null) {
            retryCount = 0;
        }
        retryCount++;
    }
}