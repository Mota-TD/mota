package com.mota.notify.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.notify.entity.DoNotDisturbSetting;
import com.mota.notify.entity.Notification;
import com.mota.notify.entity.NotificationSubscription;
import com.mota.notify.entity.NotificationTemplate;
import com.mota.notify.service.DoNotDisturbService;
import com.mota.notify.service.NotificationService;
import com.mota.notify.service.NotificationSubscriptionService;
import com.mota.notify.service.NotificationTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 * 提供完整的通知服务API
 */
@RestController
@RequestMapping("/api/v1/notify")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationTemplateService templateService;
    private final NotificationSubscriptionService subscriptionService;
    private final DoNotDisturbService doNotDisturbService;

    // ==================== 通知管理 ====================

    /**
     * 发送通知
     */
    @PostMapping
    public Result<Notification> sendNotification(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long tenantId = request.get("tenantId") != null ? 
            Long.valueOf(request.get("tenantId").toString()) : null;
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        String link = (String) request.get("link");
        Long senderId = request.get("senderId") != null ? 
            Long.valueOf(request.get("senderId").toString()) : null;
        
        Notification notification = notificationService.sendNotification(
            userId, tenantId, type, title, content, link, senderId);
        return Result.success(notification);
    }

    /**
     * 使用模板发送通知
     */
    @PostMapping("/template")
    public Result<Notification> sendWithTemplate(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long tenantId = request.get("tenantId") != null ? 
            Long.valueOf(request.get("tenantId").toString()) : null;
        String templateCode = (String) request.get("templateCode");
        @SuppressWarnings("unchecked")
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        String link = (String) request.get("link");
        Long senderId = request.get("senderId") != null ? 
            Long.valueOf(request.get("senderId").toString()) : null;
        
        Notification notification = notificationService.sendWithTemplate(
            userId, tenantId, templateCode, variables, link, senderId);
        return Result.success(notification);
    }

    /**
     * 批量发送通知
     */
    @PostMapping("/batch")
    public Result<Void> sendBatchNotifications(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> userIds = (List<Long>) request.get("userIds");
        Long tenantId = request.get("tenantId") != null ? 
            Long.valueOf(request.get("tenantId").toString()) : null;
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        String link = (String) request.get("link");
        Long senderId = request.get("senderId") != null ? 
            Long.valueOf(request.get("senderId").toString()) : null;
        
        notificationService.sendBatchNotifications(userIds, tenantId, type, title, content, link, senderId);
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
     * 按类型获取通知
     */
    @GetMapping("/by-type")
    public Result<IPage<Notification>> getNotificationsByType(
            @RequestParam Long userId,
            @RequestParam String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        IPage<Notification> notifications = notificationService.getNotificationsByType(userId, type, page, size);
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
     * 按类型获取未读数量
     */
    @GetMapping("/unread-count-by-type")
    public Result<Map<String, Integer>> getUnreadCountByType(@RequestParam Long userId) {
        Map<String, Integer> counts = notificationService.getUnreadCountByType(userId);
        return Result.success(counts);
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
     * 批量标记为已读
     */
    @PostMapping("/batch-read")
    public Result<Void> batchMarkAsRead(@RequestBody List<Long> ids) {
        notificationService.batchMarkAsRead(ids);
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
     * 按类型标记为已读
     */
    @PostMapping("/read-by-type")
    public Result<Void> markAsReadByType(@RequestParam Long userId, @RequestParam String type) {
        notificationService.markAsReadByType(userId, type);
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

    // ==================== 模板管理 ====================

    /**
     * 获取模板列表
     */
    @GetMapping("/templates")
    public Result<List<NotificationTemplate>> getTemplates(@RequestParam(required = false) Long tenantId) {
        List<NotificationTemplate> templates;
        if (tenantId != null) {
            templates = templateService.getByTenantId(tenantId);
        } else {
            templates = templateService.getByType(null);
        }
        return Result.success(templates);
    }

    /**
     * 获取模板详情
     */
    @GetMapping("/templates/{id}")
    public Result<NotificationTemplate> getTemplate(@PathVariable Long id) {
        NotificationTemplate template = templateService.getById(id);
        return Result.success(template);
    }

    /**
     * 根据编码获取模板
     */
    @GetMapping("/templates/code/{code}")
    public Result<NotificationTemplate> getTemplateByCode(@PathVariable String code) {
        NotificationTemplate template = templateService.getByCode(code);
        return Result.success(template);
    }

    /**
     * 创建模板
     */
    @PostMapping("/templates")
    public Result<NotificationTemplate> createTemplate(@RequestBody NotificationTemplate template) {
        NotificationTemplate created = templateService.create(template);
        return Result.success(created);
    }

    /**
     * 更新模板
     */
    @PutMapping("/templates/{id}")
    public Result<NotificationTemplate> updateTemplate(@PathVariable Long id, @RequestBody NotificationTemplate template) {
        template.setId(id);
        NotificationTemplate updated = templateService.update(template);
        return Result.success(updated);
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/templates/{id}")
    public Result<Void> deleteTemplate(@PathVariable Long id) {
        templateService.delete(id);
        return Result.success();
    }

    /**
     * 启用模板
     */
    @PostMapping("/templates/{id}/enable")
    public Result<Void> enableTemplate(@PathVariable Long id) {
        templateService.enable(id);
        return Result.success();
    }

    /**
     * 禁用模板
     */
    @PostMapping("/templates/{id}/disable")
    public Result<Void> disableTemplate(@PathVariable Long id) {
        templateService.disable(id);
        return Result.success();
    }

    /**
     * 预览模板
     */
    @PostMapping("/templates/preview")
    public Result<NotificationTemplateService.RenderedNotification> previewTemplate(@RequestBody Map<String, Object> request) {
        String templateCode = (String) request.get("templateCode");
        @SuppressWarnings("unchecked")
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        NotificationTemplateService.RenderedNotification rendered = templateService.render(templateCode, variables);
        return Result.success(rendered);
    }

    // ==================== 订阅管理 ====================

    /**
     * 获取用户订阅列表
     */
    @GetMapping("/subscriptions")
    public Result<List<NotificationSubscription>> getUserSubscriptions(@RequestParam Long userId) {
        List<NotificationSubscription> subscriptions = subscriptionService.getUserSubscriptions(userId);
        return Result.success(subscriptions);
    }

    /**
     * 保存订阅设置
     */
    @PostMapping("/subscriptions")
    public Result<NotificationSubscription> saveSubscription(@RequestBody NotificationSubscription subscription) {
        NotificationSubscription saved = subscriptionService.saveSubscription(subscription);
        return Result.success(saved);
    }

    /**
     * 批量保存订阅设置
     */
    @PostMapping("/subscriptions/batch")
    public Result<Void> batchSaveSubscriptions(@RequestBody List<NotificationSubscription> subscriptions) {
        subscriptionService.batchSaveSubscriptions(subscriptions);
        return Result.success();
    }

    /**
     * 订阅通知类型
     */
    @PostMapping("/subscriptions/subscribe")
    public Result<Void> subscribe(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String notifyType = (String) request.get("notifyType");
        String channels = (String) request.get("channels");
        subscriptionService.subscribe(userId, notifyType, channels);
        return Result.success();
    }

    /**
     * 取消订阅
     */
    @PostMapping("/subscriptions/unsubscribe")
    public Result<Void> unsubscribe(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String notifyType = (String) request.get("notifyType");
        subscriptionService.unsubscribe(userId, notifyType);
        return Result.success();
    }

    /**
     * 删除订阅
     */
    @DeleteMapping("/subscriptions/{id}")
    public Result<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return Result.success();
    }

    /**
     * 初始化用户默认订阅
     */
    @PostMapping("/subscriptions/init")
    public Result<Void> initDefaultSubscriptions(@RequestParam Long userId) {
        subscriptionService.initDefaultSubscriptions(userId);
        return Result.success();
    }

    // ==================== 免打扰设置 ====================

    /**
     * 获取免打扰设置
     */
    @GetMapping("/dnd")
    public Result<DoNotDisturbSetting> getDoNotDisturbSetting(@RequestParam Long userId) {
        DoNotDisturbSetting setting = doNotDisturbService.getSetting(userId);
        return Result.success(setting);
    }

    /**
     * 保存免打扰设置
     */
    @PostMapping("/dnd")
    public Result<DoNotDisturbSetting> saveDoNotDisturbSetting(@RequestBody DoNotDisturbSetting setting) {
        DoNotDisturbSetting saved = doNotDisturbService.saveSetting(setting);
        return Result.success(saved);
    }

    /**
     * 启用免打扰
     */
    @PostMapping("/dnd/enable")
    public Result<Void> enableDoNotDisturb(@RequestParam Long userId) {
        doNotDisturbService.enable(userId);
        return Result.success();
    }

    /**
     * 禁用免打扰
     */
    @PostMapping("/dnd/disable")
    public Result<Void> disableDoNotDisturb(@RequestParam Long userId) {
        doNotDisturbService.disable(userId);
        return Result.success();
    }

    /**
     * 设置临时免打扰
     */
    @PostMapping("/dnd/temporary")
    public Result<Void> setTemporaryDoNotDisturb(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String endTimeStr = (String) request.get("endTime");
        LocalDateTime endTime = LocalDateTime.parse(endTimeStr);
        doNotDisturbService.setTemporary(userId, endTime);
        return Result.success();
    }

    /**
     * 取消临时免打扰
     */
    @PostMapping("/dnd/cancel-temporary")
    public Result<Void> cancelTemporaryDoNotDisturb(@RequestParam Long userId) {
        doNotDisturbService.cancelTemporary(userId);
        return Result.success();
    }

    /**
     * 检查是否在免打扰时间
     */
    @GetMapping("/dnd/check")
    public Result<Boolean> checkDoNotDisturb(@RequestParam Long userId) {
        boolean inDnd = doNotDisturbService.isInDoNotDisturb(userId);
        return Result.success(inDnd);
    }

    // ==================== 统计接口 ====================

    /**
     * 获取通知统计
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics(@RequestParam Long userId) {
        Map<String, Object> stats = notificationService.getStatistics(userId);
        return Result.success(stats);
    }

    /**
     * 清理过期通知
     */
    @PostMapping("/cleanup")
    public Result<Integer> cleanupExpiredNotifications(@RequestParam(defaultValue = "30") int days) {
        int count = notificationService.cleanupExpiredNotifications(days);
        return Result.success(count);
    }
}