package com.mota.notify.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.notify.entity.Notification;
import com.mota.notify.mapper.NotificationMapper;
import com.mota.notify.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通知服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public Notification sendNotification(Long userId, Long enterpriseId, String type, String title,
                                          String content, String link, Long senderId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setEnterpriseId(enterpriseId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setLink(link);
        notification.setSenderId(senderId);
        notification.setIsRead(0);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setDeleted(0);
        
        notificationMapper.insert(notification);
        
        // TODO: 发送实时推送（WebSocket/SSE）
        log.info("发送通知给用户 {}: {}", userId, title);
        
        return notification;
    }

    @Override
    @Transactional
    public void sendBatchNotifications(List<Long> userIds, Long enterpriseId, String type,
                                        String title, String content, String link, Long senderId) {
        for (Long userId : userIds) {
            sendNotification(userId, enterpriseId, type, title, content, link, senderId);
        }
    }

    @Override
    public IPage<Notification> getUserNotifications(Long userId, Boolean isRead, int page, int size) {
        Page<Notification> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.eq(Notification::getUserId, userId)
               .eq(Notification::getDeleted, 0);
        
        if (isRead != null) {
            wrapper.eq(Notification::getIsRead, isRead ? 1 : 0);
        }
        
        wrapper.orderByDesc(Notification::getCreatedAt);
        
        return notificationMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public int getUnreadCount(Long userId) {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getUserId, userId)
               .eq(Notification::getIsRead, 0)
               .eq(Notification::getDeleted, 0);
        
        return Math.toIntExact(notificationMapper.selectCount(wrapper));
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null && notification.getIsRead() == 0) {
            notification.setIsRead(1);
            notification.setReadAt(LocalDateTime.now());
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getUserId, userId)
               .eq(Notification::getIsRead, 0)
               .eq(Notification::getDeleted, 0);
        
        List<Notification> notifications = notificationMapper.selectList(wrapper);
        LocalDateTime now = LocalDateTime.now();
        
        for (Notification notification : notifications) {
            notification.setIsRead(1);
            notification.setReadAt(now);
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null) {
            notification.setDeleted(1);
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void deleteNotifications(List<Long> ids) {
        for (Long id : ids) {
            deleteNotification(id);
        }
    }

    @Override
    public Notification getNotificationById(Long id) {
        return notificationMapper.selectById(id);
    }
}