package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.Notification;
import com.mota.project.entity.NotificationDndSettings;
import com.mota.project.entity.NotificationPreferences;
import com.mota.project.entity.NotificationSubscription;
import com.mota.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 * 支持通知聚合、智能分类、置顶、折叠、免打扰模式、订阅管理等功能
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ==================== 基础通知功能 ====================

    /**
     * 获取通知列表（支持聚合）
     */
    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(value = "userId") Long userId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "isRead", required = false) Boolean isRead,
            @RequestParam(value = "aggregated", defaultValue = "true") Boolean aggregated,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize) {
        
        Map<String, Object> result = notificationService.getUserNotifications(
                userId, category, isRead, aggregated, page, pageSize);
        return Result.success(result);
    }

    /**
     * 获取聚合通知的详细列表
     */
    @GetMapping("/group/{groupKey}")
    public Result<List<Notification>> getGroupDetails(
            @RequestParam(value = "userId") Long userId,
            @PathVariable("groupKey") String groupKey) {
        List<Notification> notifications = notificationService.getAggregatedNotificationDetails(userId, groupKey);
        return Result.success(notifications);
    }

    /**
     * 获取通知详情
     */
    @GetMapping("/{id}")
    public Result<Notification> detail(@PathVariable("id") Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return Result.success(notification);
    }

    /**
     * 标记通知为已读
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable("id") Long id) {
        notificationService.markAsRead(id);
        return Result.success();
    }

    /**
     * 批量标记为已读
     */
    @PutMapping("/batch-read")
    public Result<Void> batchMarkAsRead(@RequestBody List<Long> ids) {
        notificationService.markAsRead(ids);
        return Result.success();
    }

    /**
     * 标记分组通知为已读
     */
    @PutMapping("/group/{groupKey}/read")
    public Result<Void> markGroupAsRead(
            @RequestParam(value = "userId") Long userId,
            @PathVariable("groupKey") String groupKey) {
        notificationService.markGroupAsRead(userId, groupKey);
        return Result.success();
    }

    /**
     * 标记所有通知为已读
     */
    @PutMapping("/read-all")
    public Result<Void> markAllAsRead(@RequestParam(value = "userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return Result.success();
    }

    /**
     * 标记某分类的所有通知为已读
     */
    @PutMapping("/category/{category}/read")
    public Result<Void> markCategoryAsRead(
            @RequestParam(value = "userId") Long userId,
            @PathVariable("category") String category) {
        notificationService.markCategoryAsRead(userId, category);
        return Result.success();
    }

    /**
     * 删除通知
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        return Result.success();
    }

    /**
     * 批量删除通知
     */
    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        notificationService.deleteNotifications(ids);
        return Result.success();
    }

    /**
     * 删除分组通知
     */
    @DeleteMapping("/group/{groupKey}")
    public Result<Void> deleteGroup(
            @RequestParam(value = "userId") Long userId,
            @PathVariable("groupKey") String groupKey) {
        notificationService.deleteGroupNotifications(userId, groupKey);
        return Result.success();
    }

    /**
     * 获取未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Map<String, Long>> getUnreadCount(@RequestParam(value = "userId") Long userId) {
        Map<String, Long> result = notificationService.getUnreadCount(userId);
        return Result.success(result);
    }

    /**
     * 获取各分类的未读数量
     */
    @GetMapping("/unread-count/by-category")
    public Result<Map<String, Long>> getUnreadCountByCategory(@RequestParam(value = "userId") Long userId) {
        Map<String, Long> result = notificationService.getUnreadCountByCategory(userId);
        return Result.success(result);
    }

    /**
     * 创建通知（内部使用或测试）
     */
    @PostMapping
    public Result<Notification> create(@RequestBody Notification notification) {
        Notification created = notificationService.createNotification(notification);
        return Result.success(created);
    }

    /**
     * 发送系统通知
     */
    @PostMapping("/system")
    public Result<Void> sendSystemNotification(@RequestBody SystemNotificationRequest request) {
        notificationService.sendSystemNotification(request.getTitle(), request.getContent(), request.getUserIds());
        return Result.success();
    }

    /**
     * 清理过期通知
     */
    @DeleteMapping("/cleanup")
    public Result<Integer> cleanup(@RequestParam(value = "retentionDays", defaultValue = "30") Integer retentionDays) {
        int deleted = notificationService.cleanupOldNotifications(retentionDays);
        return Result.success(deleted);
    }

    // ==================== 置顶功能 (NT-008) ====================

    /**
     * 置顶通知
     */
    @PutMapping("/{id}/pin")
    public Result<Void> pinNotification(@PathVariable("id") Long id) {
        notificationService.pinNotification(id);
        return Result.success();
    }

    /**
     * 取消置顶
     */
    @PutMapping("/{id}/unpin")
    public Result<Void> unpinNotification(@PathVariable("id") Long id) {
        notificationService.unpinNotification(id);
        return Result.success();
    }

    /**
     * 获取置顶通知列表
     */
    @GetMapping("/pinned")
    public Result<List<Notification>> getPinnedNotifications(@RequestParam(value = "userId") Long userId) {
        List<Notification> notifications = notificationService.getPinnedNotifications(userId);
        return Result.success(notifications);
    }

    // ==================== 折叠功能 (NT-009) ====================

    /**
     * 折叠通知
     */
    @PutMapping("/{id}/collapse")
    public Result<Void> collapseNotification(@PathVariable("id") Long id) {
        notificationService.collapseNotification(id);
        return Result.success();
    }

    /**
     * 展开通知
     */
    @PutMapping("/{id}/expand")
    public Result<Void> expandNotification(@PathVariable("id") Long id) {
        notificationService.expandNotification(id);
        return Result.success();
    }

    /**
     * 批量折叠低优先级通知
     */
    @PutMapping("/collapse-low-priority")
    public Result<Integer> collapseLowPriorityNotifications(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        int count = notificationService.collapseLowPriorityNotifications(userId);
        return Result.success(count);
    }

    // ==================== 智能分类功能 (NT-007) ====================

    /**
     * 获取AI分类结果
     */
    @GetMapping("/{id}/ai-classification")
    public Result<Map<String, Object>> getAiClassification(@PathVariable("id") Long id) {
        Notification notification = notificationService.getNotificationById(id);
        if (notification == null) {
            return Result.success(null);
        }
        Map<String, Object> result = Map.of(
                "classification", notification.getAiClassification() != null ? notification.getAiClassification() : "normal",
                "score", notification.getAiScore() != null ? notification.getAiScore() : 50,
                "reason", "基于通知类型和优先级的智能分类"
        );
        return Result.success(result);
    }

    /**
     * 重新分类通知
     */
    @PutMapping("/{id}/reclassify")
    public Result<Void> reclassifyNotification(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request) {
        String classification = request.get("classification");
        notificationService.reclassifyNotification(id, classification);
        return Result.success();
    }

    /**
     * 获取重要通知列表
     */
    @GetMapping("/important")
    public Result<List<Notification>> getImportantNotifications(
            @RequestParam(value = "userId") Long userId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize) {
        List<Notification> notifications = notificationService.getImportantNotifications(userId, page, pageSize);
        return Result.success(notifications);
    }

    /**
     * 根据AI分类获取通知
     */
    @GetMapping("/by-classification/{classification}")
    public Result<List<Notification>> getNotificationsByClassification(
            @RequestParam(value = "userId") Long userId,
            @PathVariable("classification") String classification,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize) {
        List<Notification> notifications = notificationService.getNotificationsByAiClassification(
                userId, classification, page, pageSize);
        return Result.success(notifications);
    }

    // ==================== 免打扰模式 (NT-010) ====================

    /**
     * 获取免打扰设置
     */
    @GetMapping("/dnd-settings")
    public Result<NotificationDndSettings> getDndSettings(@RequestParam(value = "userId") Long userId) {
        NotificationDndSettings settings = notificationService.getDndSettings(userId);
        return Result.success(settings);
    }

    /**
     * 更新免打扰设置
     */
    @PutMapping("/dnd-settings")
    public Result<NotificationDndSettings> updateDndSettings(@RequestBody DndSettingsRequest request) {
        NotificationDndSettings settings = new NotificationDndSettings();
        settings.setEnabled(request.getEnabled());
        settings.setStartTime(request.getStartTime());
        settings.setEndTime(request.getEndTime());
        settings.setWeekdaysArray(request.getWeekdays());
        settings.setAllowUrgent(request.getAllowUrgent());
        settings.setAllowMentions(request.getAllowMentions());
        
        NotificationDndSettings updated = notificationService.updateDndSettings(request.getUserId(), settings);
        return Result.success(updated);
    }

    /**
     * 启用临时免打扰
     */
    @PostMapping("/dnd/enable")
    public Result<Void> enableDnd(@RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        Integer duration = request.get("duration") != null ? ((Number) request.get("duration")).intValue() : -1;
        notificationService.enableTempDnd(userId, duration);
        return Result.success();
    }

    /**
     * 关闭免打扰
     */
    @PostMapping("/dnd/disable")
    public Result<Void> disableDnd(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        notificationService.disableDnd(userId);
        return Result.success();
    }

    /**
     * 检查免打扰状态
     */
    @GetMapping("/dnd/status")
    public Result<Map<String, Object>> checkDndStatus(@RequestParam(value = "userId") Long userId) {
        Map<String, Object> status = notificationService.checkDndStatus(userId);
        return Result.success(status);
    }

    // ==================== 订阅管理 (NT-011) ====================

    /**
     * 获取订阅列表
     */
    @GetMapping("/subscriptions")
    public Result<List<NotificationSubscription>> getSubscriptions(@RequestParam(value = "userId") Long userId) {
        List<NotificationSubscription> subscriptions = notificationService.getSubscriptions(userId);
        return Result.success(subscriptions);
    }

    /**
     * 创建订阅规则
     */
    @PostMapping("/subscriptions")
    public Result<NotificationSubscription> createSubscription(@RequestBody NotificationSubscription subscription) {
        NotificationSubscription created = notificationService.createSubscription(subscription);
        return Result.success(created);
    }

    /**
     * 更新订阅规则
     */
    @PutMapping("/subscriptions/{id}")
    public Result<NotificationSubscription> updateSubscription(
            @PathVariable("id") Long id,
            @RequestBody NotificationSubscription subscription) {
        NotificationSubscription updated = notificationService.updateSubscription(id, subscription);
        return Result.success(updated);
    }

    /**
     * 删除订阅规则
     */
    @DeleteMapping("/subscriptions/{id}")
    public Result<Void> deleteSubscription(@PathVariable("id") Long id) {
        notificationService.deleteSubscription(id);
        return Result.success();
    }

    /**
     * 批量更新订阅状态
     */
    @PutMapping("/subscriptions/batch")
    public Result<Void> batchUpdateSubscriptions(@RequestBody BatchSubscriptionRequest request) {
        notificationService.batchUpdateSubscriptions(
                request.getUserId(),
                request.getCategory(),
                request.getEnabled(),
                request.getEmailEnabled(),
                request.getPushEnabled()
        );
        return Result.success();
    }

    // ==================== 通知偏好设置 ====================

    /**
     * 获取通知偏好设置
     */
    @GetMapping("/preferences")
    public Result<NotificationPreferences> getPreferences(@RequestParam(value = "userId") Long userId) {
        NotificationPreferences preferences = notificationService.getPreferences(userId);
        return Result.success(preferences);
    }

    /**
     * 更新通知偏好设置
     */
    @PutMapping("/preferences")
    public Result<NotificationPreferences> updatePreferences(@RequestBody PreferencesRequest request) {
        NotificationPreferences preferences = new NotificationPreferences();
        preferences.setEnableAggregation(request.getEnableAggregation());
        preferences.setAggregationInterval(request.getAggregationInterval());
        preferences.setEnableAiClassification(request.getEnableAIClassification());
        preferences.setAutoCollapseThreshold(request.getAutoCollapseThreshold());
        preferences.setAutoPinUrgent(request.getAutoPinUrgent());
        preferences.setAutoPinMentions(request.getAutoPinMentions());
        preferences.setShowLowPriorityCollapsed(request.getShowLowPriorityCollapsed());
        preferences.setMaxVisibleNotifications(request.getMaxVisibleNotifications());
        
        NotificationPreferences updated = notificationService.updatePreferences(request.getUserId(), preferences);
        return Result.success(updated);
    }

    // ==================== 批量删除 ====================

    /**
     * 批量删除通知（POST方式，用于前端兼容）
     */
    @PostMapping("/batch-delete")
    public Result<Void> batchDeletePost(@RequestBody List<Long> ids) {
        notificationService.deleteNotifications(ids);
        return Result.success();
    }

    // ==================== DTO类 ====================

    /**
     * 系统通知请求DTO
     */
    @lombok.Data
    public static class SystemNotificationRequest {
        private String title;
        private String content;
        private List<Long> userIds;
    }

    /**
     * 免打扰设置请求DTO
     */
    @lombok.Data
    public static class DndSettingsRequest {
        private Long userId;
        private Boolean enabled;
        private String startTime;
        private String endTime;
        private int[] weekdays;
        private Boolean allowUrgent;
        private Boolean allowMentions;
    }

    /**
     * 批量订阅更新请求DTO
     */
    @lombok.Data
    public static class BatchSubscriptionRequest {
        private Long userId;
        private String category;
        private Boolean enabled;
        private Boolean emailEnabled;
        private Boolean pushEnabled;
    }

    /**
     * 偏好设置请求DTO
     */
    @lombok.Data
    public static class PreferencesRequest {
        private Long userId;
        private Boolean enableAggregation;
        private Integer aggregationInterval;
        private Boolean enableAIClassification;
        private Integer autoCollapseThreshold;
        private Boolean autoPinUrgent;
        private Boolean autoPinMentions;
        private Boolean showLowPriorityCollapsed;
        private Integer maxVisibleNotifications;
    }
}