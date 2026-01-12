package com.mota.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * 领域事件基类
 * 用于服务内部的领域事件
 * 
 * @author Mota
 * @since 1.0.0
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public abstract class DomainEvent extends BaseEvent {

    private static final long serialVersionUID = 1L;

    /**
     * 聚合根ID
     */
    private String aggregateId;

    /**
     * 聚合根类型
     */
    private String aggregateType;

    /**
     * 聚合根版本
     */
    private Long aggregateVersion;

    @Override
    public String getTopic() {
        return "mota-domain-events";
    }

    @Override
    public String getMessageKey() {
        // 使用聚合根ID作为消息key，保证同一聚合根的事件顺序
        return this.aggregateId != null ? this.aggregateId : super.getMessageKey();
    }
}