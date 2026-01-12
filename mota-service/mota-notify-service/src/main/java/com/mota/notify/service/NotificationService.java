package com.mota.notify.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.notify.entity.Notification;

import java.util.List;
import java.util.Map;

/**
 * 通知服务接口
 */
public interface NotificationService {

    // ==================== 通知发送 ====================

    /**
     * 发送通知
     */
    Notification send(Notification notification);

    /**
     * 发送通知（带参数）
     */
    Notification sendNotification(Long userId, Long tenantId, String type, String title, String content, String link, Long senderId);

    /**
     * 批量发送通知
     */
    List<Notification> batchSend(List<Notification> notifications);

    /**
     * 批量发送通知（带参数）
     */
    void sendBatchNotifications(List<Long> userIds, Long tenantId, String type, String title, String content, String link, Long senderId);

    /**
     * 使用模板发送通知
     */
    Notification sendByTemplate(String templateCode, Long userId, Map<String, Object> variables);

    /**
     * 使用模板发送通知（带参数）
     */
    Notification sendWithTemplate(Long userId, Long tenantId, String templateCode, Map<String, Object> variables, String link, Long senderId);

    /**
     * 发送系统通知（给所有用户）
     */
    void sendSystemNotification(String title, String content, String link);

    /**
     * 发送项目通知（给项目成员）
     */
    void sendProjectNotification(Long projectId, String type, String title, String content, Map<String, Object> extra);

    /**
     * 发送任务通知
     */
    void sendTaskNotification(Long taskId, String type, String title, String content, List<Long> userIds);

    /**
     * 发送@提醒通知
     */
    void sendMentionNotification(Long senderId, List<Long> mentionedUserIds, String bizType, Long bizId, String content);

    // ==================== 通知查询 ====================

    /**
     * 获取通知详情
     */
    Notification getById(Long id);

    /**
     * 获取通知详情（别名）
     */
    Notification getNotificationById(Long id);

    /**
     * 分页查询用户通知
     */
    IPage<Notification> pageByUser(Long userId, String type, Integer isRead, int page, int size);

    /**
     * 获取用户通知列表
     */
    IPage<Notification> getUserNotifications(Long userId, Boolean isRead, int page, int size);

    /**
     * 按类型获取通知
     */
    IPage<Notification> getNotificationsByType(Long userId, String type, int page, int size);

    /**
     * 获取用户未读通知数量
     */
    Long countUnread(Long userId);

    /**
     * 获取未读通知数量（别名）
     */
    int getUnreadCount(Long userId);

    /**
     * 获取用户未读通知数量（按类型分组）
     */
    Map<String, Long> countUnreadByType(Long userId);

    /**
     * 按类型获取未读数量（别名）
     */
    Map<String, Integer> getUnreadCountByType(Long userId);

    /**
     * 获取用户最新通知
     */
    List<Notification> getLatest(Long userId, int limit);

    // ==================== 通知操作 ====================

    /**
     * 标记已读
     */
    void markRead(Long id);

    /**
     * 标记已读（别名）
     */
    void markAsRead(Long id);

    /**
     * 批量标记已读
     */
    void batchMarkRead(List<Long> ids);

    /**
     * 批量标记已读（别名）
     */
    void batchMarkAsRead(List<Long> ids);

    /**
     * 标记全部已读
     */
    void markAllRead(Long userId);

    /**
     * 标记全部已读（别名）
     */
    void markAllAsRead(Long userId);

    /**
     * 标记指定类型全部已读
     */
    void markAllReadByType(Long userId, String type);

    /**
     * 按类型标记已读（别名）
     */
    void markAsReadByType(Long userId, String type);

    /**
     * 删除通知
     */
    void delete(Long id);

    /**
     * 删除通知（别名）
     */
    void deleteNotification(Long id);

    /**
     * 批量删除通知
     */
    void batchDelete(List<Long> ids);

    /**
     * 批量删除通知（别名）
     */
    void deleteNotifications(List<Long> ids);

    /**
     * 置顶通知
     */
    void pin(Long id);

    /**
     * 取消置顶
     */
    void unpin(Long id);

    /**
     * 归档通知
     */
    void archive(Long id);

    // ==================== 通知聚合 ====================

    /**
     * 聚合通知
     */
    void aggregateNotifications(Long userId, String type);

    /**
     * 获取聚合通知详情
     */
    List<Notification> getAggregatedDetails(String aggregationGroupId);

    // ==================== 通知统计 ====================

    /**
     * 获取通知统计
     */
    Map<String, Object> getStatistics(Long userId);

    // ==================== 通知重试和清理 ====================

    /**
     * 重试发送失败的通知
     */
    void retryFailed();

    /**
     * 清理过期通知
     */
    void cleanExpired(int retentionDays);

    /**
     * 清理过期通知（别名）
     */
    int cleanupExpiredNotifications(int days);
}