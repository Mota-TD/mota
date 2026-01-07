package com.mota.notify.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.notify.entity.Notification;
import com.mota.notify.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 * 提供基础通知服务的内部API，供其他服务通过Feign调用
 * 外部API请使用 mota-project-service 的 /api/v1/notifications 接口
 */
@RestController
@RequestMapping("/api/v1/notify")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 发送通知
     */
    @PostMapping
    public Result<Notification> sendNotification(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long enterpriseId = request.get("enterpriseId") != null ? 
            Long.valueOf(request.get("enterpriseId").toString()) : null;
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        String link = (String) request.get("link");
        Long senderId = request.get("senderId") != null ? 
            Long.valueOf(request.get("senderId").toString()) : null;
        
        Notification notification = notificationService.sendNotification(
            userId, enterpriseId, type, title, content, link, senderId);
        return Result.success(notification);
    }

    /**
     * 批量发送通知
     */
    @PostMapping("/batch")
    public Result<Void> sendBatchNotifications(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) request.get("userIds");
        Long enterpriseId = request.get("enterpriseId") != null ? 
            Long.valueOf(request.get("enterpriseId").toString()) : null;
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        String link = (String) request.get("link");
        Long senderId = request.get("senderId") != null ? 
            Long.valueOf(request.get("senderId").toString()) : null;
        
        notificationService.sendBatchNotifications(userIds, enterpriseId, type, title, content, link, senderId);
        return Result.success();
    }

    /**
     * 获取用户通知列表
     */
    @GetMapping
    public Result<IPage<Notification>> getUserNotifications(
            @RequestParam Long userId,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<Notification> notifications = notificationService.getUserNotifications(userId, isRead, page, size);
        return Result.success(notifications);
    }

    /**
     * 获取未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Integer> getUnreadCount(@RequestParam Long userId) {
        int count = notificationService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 获取通知详情
     */
    @GetMapping("/{id}")
    public Result<Notification> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return Result.success(notification);
    }

    /**
     * 标记为已读
     */
    @PostMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Result.success();
    }

    /**
     * 全部标记为已读
     */
    @PostMapping("/read-all")
    public Result<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return Result.success();
    }

    /**
     * 删除通知
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return Result.success();
    }

    /**
     * 批量删除通知
     */
    @DeleteMapping("/batch")
    public Result<Void> deleteNotifications(@RequestBody List<Long> ids) {
        notificationService.deleteNotifications(ids);
        return Result.success();
    }
}