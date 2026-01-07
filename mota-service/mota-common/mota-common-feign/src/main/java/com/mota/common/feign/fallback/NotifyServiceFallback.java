package com.mota.common.feign.fallback;

import com.mota.common.core.result.Result;
import com.mota.common.feign.client.NotifyServiceClient;
import com.mota.common.feign.dto.NotificationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

/**
 * 通知服务降级处理
 * 当通知服务不可用时，提供降级响应
 */
@Slf4j
@Component
public class NotifyServiceFallback implements FallbackFactory<NotifyServiceClient> {

    @Override
    public NotifyServiceClient create(Throwable cause) {
        log.error("通知服务调用失败，触发降级: {}", cause.getMessage());
        
        return new NotifyServiceClient() {
            @Override
            public Result<NotificationDTO> sendNotification(NotificationDTO notification) {
                log.warn("发送通知降级处理: userId={}, title={}", 
                        notification.getUserId(), notification.getTitle());
                // 返回失败结果，但不抛出异常，让主流程继续
                return Result.fail(503, "通知服务暂时不可用，通知将延迟发送");
            }

            @Override
            public Result<Void> sendBatchNotifications(BatchNotificationRequest request) {
                log.warn("批量发送通知降级处理: userCount={}", 
                        request.userIds() != null ? request.userIds().size() : 0);
                return Result.fail(503, "通知服务暂时不可用，通知将延迟发送");
            }

            @Override
            public Result<Integer> getUnreadCount(Long userId) {
                log.warn("获取未读通知数量降级处理: userId={}", userId);
                // 返回0作为降级值
                return Result.success(0);
            }

            @Override
            public Result<Void> markAsRead(Long id) {
                log.warn("标记通知已读降级处理: id={}", id);
                return Result.fail(503, "通知服务暂时不可用");
            }
        };
    }
}