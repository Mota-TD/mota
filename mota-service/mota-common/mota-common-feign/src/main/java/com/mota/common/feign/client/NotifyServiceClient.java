package com.mota.common.feign.client;

import com.mota.common.core.result.Result;
import com.mota.common.feign.config.FeignConfig;
import com.mota.common.feign.dto.NotificationDTO;
import com.mota.common.feign.fallback.NotifyServiceFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知服务Feign客户端
 * 用于服务间调用通知服务
 */
@FeignClient(
    name = "mota-notify-service",
    path = "/api/v1/notify",
    configuration = FeignConfig.class,
    fallbackFactory = NotifyServiceFallback.class
)
public interface NotifyServiceClient {

    /**
     * 发送通知
     */
    @PostMapping
    Result<NotificationDTO> sendNotification(@RequestBody NotificationDTO notification);

    /**
     * 批量发送通知
     */
    @PostMapping("/batch")
    Result<Void> sendBatchNotifications(@RequestBody BatchNotificationRequest request);

    /**
     * 获取用户未读通知数量
     */
    @GetMapping("/unread-count")
    Result<Integer> getUnreadCount(@RequestParam("userId") Long userId);

    /**
     * 标记通知为已读
     */
    @PostMapping("/{id}/read")
    Result<Void> markAsRead(@PathVariable("id") Long id);

    /**
     * 批量通知请求DTO
     */
    record BatchNotificationRequest(
        List<Long> userIds,
        Long enterpriseId,
        String type,
        String title,
        String content,
        String link,
        Long senderId
    ) {}
}