package com.mota.common.kafka.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 事件基类
 * 所有领域事件和集成事件的基类
 * 
 * @author Mota
 * @since 1.0.0
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 事件ID
     */
    private String eventId;

    /**
     * 事件类型
     */
    private String eventType;

    /**
     * 事件时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime eventTime;

    /**
     * 租户ID
     */
    private Long tenantId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 追踪ID（用于分布式追踪）
     */
    private String traceId;

    /**
     * 事件来源服务
     */
    private String source;

    /**
     * 事件版本
     */
    private Integer version;

    /**
     * 初始化事件基础信息
     */
    public void init() {
        if (this.eventId == null) {
            this.eventId = UUID.randomUUID().toString().replace("-", "");
        }
        if (this.eventTime == null) {
            this.eventTime = LocalDateTime.now();
        }
        if (this.eventType == null) {
            this.eventType = this.getClass().getSimpleName();
        }
        if (this.version == null) {
            this.version = 1;
        }
    }

    /**
     * 获取事件主题
     * 子类可以重写此方法返回自定义主题
     *
     * @return 事件主题
     */
    public String getTopic() {
        return "mota-events";
    }

    /**
     * 获取消息key
     * 用于Kafka分区，相同key的消息会发送到同一分区
     *
     * @return 消息key
     */
    public String getMessageKey() {
        return this.eventId;
    }
}