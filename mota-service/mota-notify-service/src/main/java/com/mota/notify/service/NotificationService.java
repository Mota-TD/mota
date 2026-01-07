package com.mota.notify.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.notify.entity.Notification;

import java.util.List;

/**
 * 通知服务接口
 */
public interface NotificationService {

    /**
     * 发送通知
     */
    Notification sendNotification(Long userId, Long enterpriseId, String type, String title, 
                                  String content, String link, Long senderId);

    /**
     * 批量发送通知
     */
    void sendBatchNotifications(List<Long> userIds, Long enterpriseId, String type, 
                                String title, String content, String link, Long senderId);

    /**
     * 获取用户通知列表
     */
    IPage<Notification> getUserNotifications(Long userId, Boolean isRead, int page, int size);

    /**
     * 获取未读通知数量
     */
    int getUnreadCount(Long userId);

    /**
     * 标记为已读
     */
    void markAsRead(Long id);

    /**
     * 批量标记为已读
     */
    void markAllAsRead(Long userId);

    /**
     * 删除通知
     */
    void deleteNotification(Long id);

    /**
     * 批量删除通知
     */
    void deleteNotifications(List<Long> ids);

    /**
     * 获取通知详情
     */
    Notification getNotificationById(Long id);
}