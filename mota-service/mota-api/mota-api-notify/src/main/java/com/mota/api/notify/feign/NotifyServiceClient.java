package com.mota.api.notify.feign;

import com.mota.api.notify.dto.*;
import com.mota.common.core.result.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知服务Feign客户端
 */
@FeignClient(name = "mota-notify-service", path = "/api/v1/notify")
public interface NotifyServiceClient {

    /**
     * 发送通知
     */
    @PostMapping("/send")
    Result<NotificationDTO> sendNotification(@RequestBody SendNotificationDTO request);

    /**
     * 批量发送通知
     */
    @PostMapping("/send/batch")
    Result<List<NotificationDTO>> sendBatchNotifications(@RequestBody BatchNotificationDTO request);

    /**
     * 获取用户通知列表
     */
    @GetMapping("/user/{userId}")
    Result<List<NotificationDTO>> getUserNotifications(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "unreadOnly", defaultValue = "false") Boolean unreadOnly);

    /**
     * 标记通知为已读
     */
    @PutMapping("/{id}/read")
    Result<Boolean> markAsRead(@PathVariable("id") Long id);

    /**
     * 标记所有通知为已读
     */
    @PutMapping("/user/{userId}/read-all")
    Result<Boolean> markAllAsRead(@PathVariable("userId") Long userId);

    /**
     * 获取未读通知数量
     */
    @GetMapping("/user/{userId}/unread-count")
    Result<Integer> getUnreadCount(@PathVariable("userId") Long userId);
}