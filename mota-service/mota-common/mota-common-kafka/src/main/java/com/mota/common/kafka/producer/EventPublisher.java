package com.mota.common.kafka.producer;

import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.kafka.event.BaseEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * 事件发布服务
 * 用于发布领域事件和集成事件到Kafka
 * 
 * @author Mota
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * 发布事件（异步）
     *
     * @param event 事件
     */
    public void publish(BaseEvent event) {
        prepareEvent(event);
        
        String topic = event.getTopic();
        String key = event.getMessageKey();
        
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);
        
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("发布事件失败: topic={}, eventId={}, eventType={}", 
                        topic, event.getEventId(), event.getEventType(), ex);
            } else {
                log.debug("发布事件成功: topic={}, partition={}, offset={}, eventId={}, eventType={}", 
                        topic, 
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        event.getEventId(), 
                        event.getEventType());
            }
        });
    }

    /**
     * 发布事件到指定主题（异步）
     *
     * @param topic 主题
     * @param event 事件
     */
    public void publish(String topic, BaseEvent event) {
        prepareEvent(event);
        
        String key = event.getMessageKey();
        
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);
        
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("发布事件失败: topic={}, eventId={}, eventType={}", 
                        topic, event.getEventId(), event.getEventType(), ex);
            } else {
                log.debug("发布事件成功: topic={}, partition={}, offset={}, eventId={}, eventType={}", 
                        topic, 
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        event.getEventId(), 
                        event.getEventType());
            }
        });
    }

    /**
     * 发布事件（同步）
     *
     * @param event 事件
     * @return 发送结果
     */
    public SendResult<String, Object> publishSync(BaseEvent event) {
        prepareEvent(event);
        
        String topic = event.getTopic();
        String key = event.getMessageKey();
        
        try {
            SendResult<String, Object> result = kafkaTemplate.send(topic, key, event).get();
            log.debug("发布事件成功: topic={}, partition={}, offset={}, eventId={}, eventType={}", 
                    topic, 
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset(),
                    event.getEventId(), 
                    event.getEventType());
            return result;
        } catch (Exception e) {
            log.error("发布事件失败: topic={}, eventId={}, eventType={}", 
                    topic, event.getEventId(), event.getEventType(), e);
            throw new RuntimeException("发布事件失败", e);
        }
    }

    /**
     * 发布事件到指定主题（同步）
     *
     * @param topic 主题
     * @param event 事件
     * @return 发送结果
     */
    public SendResult<String, Object> publishSync(String topic, BaseEvent event) {
        prepareEvent(event);
        
        String key = event.getMessageKey();
        
        try {
            SendResult<String, Object> result = kafkaTemplate.send(topic, key, event).get();
            log.debug("发布事件成功: topic={}, partition={}, offset={}, eventId={}, eventType={}", 
                    topic, 
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset(),
                    event.getEventId(), 
                    event.getEventType());
            return result;
        } catch (Exception e) {
            log.error("发布事件失败: topic={}, eventId={}, eventType={}", 
                    topic, event.getEventId(), event.getEventType(), e);
            throw new RuntimeException("发布事件失败", e);
        }
    }

    /**
     * 发布事件到指定分区（异步）
     *
     * @param topic     主题
     * @param partition 分区
     * @param event     事件
     */
    public void publish(String topic, int partition, BaseEvent event) {
        prepareEvent(event);
        
        String key = event.getMessageKey();
        
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, partition, key, event);
        
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("发布事件失败: topic={}, partition={}, eventId={}, eventType={}", 
                        topic, partition, event.getEventId(), event.getEventType(), ex);
            } else {
                log.debug("发布事件成功: topic={}, partition={}, offset={}, eventId={}, eventType={}", 
                        topic, 
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        event.getEventId(), 
                        event.getEventType());
            }
        });
    }

    /**
     * 准备事件（填充基础信息）
     *
     * @param event 事件
     */
    private void prepareEvent(BaseEvent event) {
        // 初始化事件基础信息
        event.init();
        
        // 填充租户ID
        if (event.getTenantId() == null) {
            event.setTenantId(TenantContext.getTenantId());
        }
        
        // 填充用户ID
        if (event.getUserId() == null) {
            event.setUserId(UserContext.getUserId());
        }
        
        // 填充追踪ID
        if (event.getTraceId() == null) {
            event.setTraceId(UUID.randomUUID().toString().replace("-", ""));
        }
    }
}