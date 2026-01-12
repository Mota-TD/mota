package com.mota.notify.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.notify.entity.Notification;
import com.mota.notify.entity.NotificationTemplate;
import com.mota.notify.mapper.NotificationMapper;
import com.mota.notify.mapper.NotificationTemplateMapper;
import com.mota.notify.service.DoNotDisturbService;
import com.mota.notify.service.NotificationService;
import com.mota.notify.service.NotificationSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 通知服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationTemplateMapper templateMapper;
    private final DoNotDisturbService dndService;
    private final NotificationSubscriptionService subscriptionService;

    @Override
    @Transactional
    public Notification send(Notification notification) {
        Long tenantId = TenantContext.getTenantId();
        notification.setTenantId(tenantId);
        notification.setSendStatus("pending");
        notification.setRetryCount(0);
        notification.setIsRead(0);
        notification.setIsPinned(false);
        notification.setIsArchived(false);
        notification.setIsAggregated(false);
        
        // 检查免打扰设置
        if (dndService.isInDoNotDisturb(notification.getUserId())) {
            // 如果在免打扰时间内，只保存不推送
            notification.setSendStatus("deferred");
        }
        
        notificationMapper.insert(notification);
        
        // 异步发送
        if ("pending".equals(notification.getSendStatus())) {
            asyncSend(notification);
        }
        
        return notification;
    }

    @Override
    @Transactional
    public List<Notification> batchSend(List<Notification> notifications) {
        Long tenantId = TenantContext.getTenantId();
        
        for (Notification notification : notifications) {
            notification.setTenantId(tenantId);
            notification.setSendStatus("pending");
            notification.setRetryCount(0);
            notification.setIsRead(0);
            notification.setIsPinned(false);
            notification.setIsArchived(false);
            notification.setIsAggregated(false);
        }
        
        // 批量插入
        for (Notification notification : notifications) {
            notificationMapper.insert(notification);
        }
        
        // 异步发送
        for (Notification notification : notifications) {
            if ("pending".equals(notification.getSendStatus())) {
                asyncSend(notification);
            }
        }
        
        return notifications;
    }

    @Override
    @Transactional
    public Notification sendByTemplate(String templateCode, Long userId, Map<String, Object> variables) {
        Long tenantId = TenantContext.getTenantId();
        
        // 查找模板
        NotificationTemplate template = templateMapper.selectByCode(tenantId, templateCode);
        if (template == null) {
            // 尝试查找系统模板
            template = templateMapper.selectByCode(0L, templateCode);
        }
        
        if (template == null || !template.getIsEnabled()) {
            log.warn("通知模板不存在或未启用: {}", templateCode);
            return null;
        }
        
        // 渲染模板
        String title = renderTemplate(template.getTitleTemplate(), variables);
        String content = renderTemplate(template.getContentTemplate(), variables);
        String summary = template.getSummaryTemplate() != null ? 
            renderTemplate(template.getSummaryTemplate(), variables) : null;
        
        // 创建通知
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(template.getNotifyType());
        notification.setCategory(template.getDefaultCategory());
        notification.setTitle(title);
        notification.setContent(content);
        notification.setSummary(summary);
        notification.setChannel(template.getChannel());
        
        // 设置业务关联
        if (variables.containsKey("bizType")) {
            notification.setBizType((String) variables.get("bizType"));
        }
        if (variables.containsKey("bizId")) {
            notification.setBizId((Long) variables.get("bizId"));
        }
        if (variables.containsKey("link")) {
            notification.setLink((String) variables.get("link"));
        }
        if (variables.containsKey("senderId")) {
            notification.setSenderId((Long) variables.get("senderId"));
        }
        if (variables.containsKey("senderName")) {
            notification.setSenderName((String) variables.get("senderName"));
        }
        
        return send(notification);
    }

    @Override
    public void sendSystemNotification(String title, String content, String link) {
        // TODO: 获取所有用户并发送系统通知
        log.info("发送系统通知: {}", title);
    }

    @Override
    public void sendProjectNotification(Long projectId, String type, String title, String content, Map<String, Object> extra) {
        // TODO: 获取项目成员并发送通知
        log.info("发送项目通知: projectId={}, type={}", projectId, type);
    }

    @Override
    public void sendTaskNotification(Long taskId, String type, String title, String content, List<Long> userIds) {
        List<Notification> notifications = new ArrayList<>();
        
        for (Long userId : userIds) {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setBizType("task");
            notification.setBizId(taskId);
            notification.setChannel("app");
            notifications.add(notification);
        }
        
        batchSend(notifications);
    }

    @Override
    public void sendMentionNotification(Long senderId, List<Long> mentionedUserIds, String bizType, Long bizId, String content) {
        List<Notification> notifications = new ArrayList<>();
        
        for (Long userId : mentionedUserIds) {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setSenderId(senderId);
            notification.setType("mention");
            notification.setCategory("important");
            notification.setTitle("有人@了你");
            notification.setContent(content);
            notification.setBizType(bizType);
            notification.setBizId(bizId);
            notification.setChannel("app");
            notifications.add(notification);
        }
        
        batchSend(notifications);
    }

    @Override
    public Notification getById(Long id) {
        return notificationMapper.selectById(id);
    }

    @Override
    public IPage<Notification> pageByUser(Long userId, String type, Integer isRead, int page, int size) {
        Long tenantId = TenantContext.getTenantId();
        
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getTenantId, tenantId)
               .eq(Notification::getUserId, userId)
               .eq(type != null, Notification::getType, type)
               .eq(isRead != null, Notification::getIsRead, isRead)
               .eq(Notification::getIsArchived, false)
               .orderByDesc(Notification::getIsPinned)
               .orderByDesc(Notification::getCreateTime);
        
        return notificationMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public Long countUnread(Long userId) {
        Long tenantId = TenantContext.getTenantId();
        return notificationMapper.countUnread(tenantId, userId);
    }

    @Override
    public Map<String, Long> countUnreadByType(Long userId) {
        Long tenantId = TenantContext.getTenantId();
        
        // 查询各类型未读数量
        Map<String, Long> result = new HashMap<>();
        String[] types = {"system", "task", "project", "document", "comment", "mention", "reminder"};
        
        for (String type : types) {
            Long count = notificationMapper.countUnreadByType(tenantId, userId, type);
            result.put(type, count != null ? count : 0L);
        }
        
        return result;
    }

    @Override
    public List<Notification> getLatest(Long userId, int limit) {
        Long tenantId = TenantContext.getTenantId();
        
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getTenantId, tenantId)
               .eq(Notification::getUserId, userId)
               .eq(Notification::getIsArchived, false)
               .orderByDesc(Notification::getCreateTime)
               .last("LIMIT " + limit);
        
        return notificationMapper.selectList(wrapper);
    }

    @Override
    @Transactional
    public void markRead(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null && notification.getIsRead() == 0) {
            notification.setIsRead(1);
            notification.setReadAt(LocalDateTime.now());
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void batchMarkRead(List<Long> ids) {
        Long tenantId = TenantContext.getTenantId();
        Long userId = UserContext.getUserId();
        notificationMapper.batchMarkRead(tenantId, userId, ids);
    }

    @Override
    @Transactional
    public void markAllRead(Long userId) {
        Long tenantId = TenantContext.getTenantId();
        notificationMapper.markAllRead(tenantId, userId);
    }

    @Override
    @Transactional
    public void markAllReadByType(Long userId, String type) {
        Long tenantId = TenantContext.getTenantId();
        notificationMapper.markAllReadByType(tenantId, userId, type);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        notificationMapper.deleteById(id);
    }

    @Override
    @Transactional
    public void batchDelete(List<Long> ids) {
        notificationMapper.deleteBatchIds(ids);
    }

    @Override
    @Transactional
    public void pin(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null) {
            notification.setIsPinned(true);
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void unpin(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null) {
            notification.setIsPinned(false);
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void archive(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null) {
            notification.setIsArchived(true);
            notification.setArchivedAt(LocalDateTime.now());
            notificationMapper.updateById(notification);
        }
    }

    @Override
    @Transactional
    public void aggregateNotifications(Long userId, String type) {
        Long tenantId = TenantContext.getTenantId();
        LocalDateTime since = LocalDateTime.now().minusMinutes(5);
        
        List<Notification> notifications = notificationMapper.selectForAggregation(tenantId, userId, type, since);
        
        if (notifications.size() > 3) {
            // 创建聚合通知
            String groupId = UUID.randomUUID().toString();
            
            Notification aggregated = new Notification();
            aggregated.setTenantId(tenantId);
            aggregated.setUserId(userId);
            aggregated.setType(type);
            aggregated.setTitle("你有 " + notifications.size() + " 条新通知");
            aggregated.setContent("点击查看详情");
            aggregated.setIsAggregated(true);
            aggregated.setAggregationGroupId(groupId);
            aggregated.setAggregationCount(notifications.size());
            aggregated.setChannel("app");
            aggregated.setSendStatus("sent");
            aggregated.setIsRead(0);
            aggregated.setIsPinned(false);
            aggregated.setIsArchived(false);
            
            notificationMapper.insert(aggregated);
            
            // 更新原通知的聚合组ID
            for (Notification n : notifications) {
                n.setAggregationGroupId(groupId);
                notificationMapper.updateById(n);
            }
        }
    }

    @Override
    public List<Notification> getAggregatedDetails(String aggregationGroupId) {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getAggregationGroupId, aggregationGroupId)
               .eq(Notification::getIsAggregated, false)
               .orderByDesc(Notification::getCreateTime);
        
        return notificationMapper.selectList(wrapper);
    }

    @Override
    @Scheduled(fixedRate = 60000) // 每分钟执行一次
    public void retryFailed() {
        List<Notification> failedNotifications = notificationMapper.selectNeedRetry(3, 100);
        
        for (Notification notification : failedNotifications) {
            try {
                asyncSend(notification);
            } catch (Exception e) {
                log.error("重试发送通知失败: {}", notification.getId(), e);
            }
        }
    }

    @Override
    @Scheduled(cron = "0 0 3 * * ?") // 每天凌晨3点执行
    @Transactional
    public void cleanExpired(int retentionDays) {
        LocalDateTime before = LocalDateTime.now().minusDays(retentionDays > 0 ? retentionDays : 90);
        int deleted = notificationMapper.deleteExpired(before);
        log.info("清理过期通知: {} 条", deleted);
    }

    // ==================== 新增接口方法实现（别名方法） ====================

    @Override
    @Transactional
    public Notification sendNotification(Long userId, Long tenantId, String type, String title, String content, String link, Long senderId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTenantId(tenantId != null ? tenantId : TenantContext.getTenantId());
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setLink(link);
        notification.setSenderId(senderId);
        notification.setChannel("app");
        return send(notification);
    }

    @Override
    @Transactional
    public void sendBatchNotifications(List<Long> userIds, Long tenantId, String type, String title, String content, String link, Long senderId) {
        List<Notification> notifications = new ArrayList<>();
        Long effectiveTenantId = tenantId != null ? tenantId : TenantContext.getTenantId();
        
        for (Long userId : userIds) {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setTenantId(effectiveTenantId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setLink(link);
            notification.setSenderId(senderId);
            notification.setChannel("app");
            notifications.add(notification);
        }
        
        batchSend(notifications);
    }

    @Override
    @Transactional
    public Notification sendWithTemplate(Long userId, Long tenantId, String templateCode, Map<String, Object> variables, String link, Long senderId) {
        // 设置租户上下文
        if (tenantId != null) {
            TenantContext.setTenantId(tenantId);
        }
        
        // 添加额外变量
        if (variables == null) {
            variables = new HashMap<>();
        }
        if (link != null) {
            variables.put("link", link);
        }
        if (senderId != null) {
            variables.put("senderId", senderId);
        }
        
        return sendByTemplate(templateCode, userId, variables);
    }

    @Override
    public Notification getNotificationById(Long id) {
        return getById(id);
    }

    @Override
    public IPage<Notification> getUserNotifications(Long userId, Boolean isRead, int page, int size) {
        Integer isReadInt = isRead != null ? (isRead ? 1 : 0) : null;
        return pageByUser(userId, null, isReadInt, page, size);
    }

    @Override
    public IPage<Notification> getNotificationsByType(Long userId, String type, int page, int size) {
        return pageByUser(userId, type, null, page, size);
    }

    @Override
    public int getUnreadCount(Long userId) {
        Long count = countUnread(userId);
        return count != null ? count.intValue() : 0;
    }

    @Override
    public Map<String, Integer> getUnreadCountByType(Long userId) {
        Map<String, Long> longMap = countUnreadByType(userId);
        Map<String, Integer> result = new HashMap<>();
        for (Map.Entry<String, Long> entry : longMap.entrySet()) {
            result.put(entry.getKey(), entry.getValue().intValue());
        }
        return result;
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        markRead(id);
    }

    @Override
    @Transactional
    public void batchMarkAsRead(List<Long> ids) {
        batchMarkRead(ids);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        markAllRead(userId);
    }

    @Override
    @Transactional
    public void markAsReadByType(Long userId, String type) {
        markAllReadByType(userId, type);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        delete(id);
    }

    @Override
    @Transactional
    public void deleteNotifications(List<Long> ids) {
        batchDelete(ids);
    }

    @Override
    public Map<String, Object> getStatistics(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Long tenantId = TenantContext.getTenantId();
        
        // 总通知数
        LambdaQueryWrapper<Notification> totalWrapper = new LambdaQueryWrapper<>();
        totalWrapper.eq(Notification::getTenantId, tenantId)
                   .eq(Notification::getUserId, userId);
        long total = notificationMapper.selectCount(totalWrapper);
        stats.put("total", total);
        
        // 未读数
        int unread = getUnreadCount(userId);
        stats.put("unread", unread);
        
        // 已读数
        stats.put("read", total - unread);
        
        // 按类型统计
        stats.put("byType", getUnreadCountByType(userId));
        
        return stats;
    }

    @Override
    @Transactional
    public int cleanupExpiredNotifications(int days) {
        LocalDateTime before = LocalDateTime.now().minusDays(days > 0 ? days : 30);
        int deleted = notificationMapper.deleteExpired(before);
        log.info("清理过期通知: {} 条", deleted);
        return deleted;
    }

    // ==================== 辅助方法 ====================

    /**
     * 异步发送通知
     */
    @Async
    protected void asyncSend(Notification notification) {
        try {
            // 根据渠道发送
            switch (notification.getChannel()) {
                case "app":
                    sendAppNotification(notification);
                    break;
                case "email":
                    sendEmailNotification(notification);
                    break;
                case "sms":
                    sendSmsNotification(notification);
                    break;
                case "wechat":
                    sendWechatNotification(notification);
                    break;
                case "dingtalk":
                    sendDingtalkNotification(notification);
                    break;
                default:
                    sendAppNotification(notification);
            }
            
            notification.setSendStatus("sent");
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("发送通知失败: {}", notification.getId(), e);
            notification.setSendStatus("failed");
            notification.setFailReason(e.getMessage());
            notification.setRetryCount(notification.getRetryCount() + 1);
        }
        
        notificationMapper.updateById(notification);
    }

    /**
     * 发送App通知（WebSocket推送）
     */
    private void sendAppNotification(Notification notification) {
        // TODO: 通过WebSocket推送到客户端
        log.debug("发送App通知: userId={}, title={}", notification.getUserId(), notification.getTitle());
    }

    /**
     * 发送邮件通知
     */
    private void sendEmailNotification(Notification notification) {
        // TODO: 调用邮件服务发送
        log.debug("发送邮件通知: userId={}, title={}", notification.getUserId(), notification.getTitle());
    }

    /**
     * 发送短信通知
     */
    private void sendSmsNotification(Notification notification) {
        // TODO: 调用短信服务发送
        log.debug("发送短信通知: userId={}, title={}", notification.getUserId(), notification.getTitle());
    }

    /**
     * 发送企业微信通知
     */
    private void sendWechatNotification(Notification notification) {
        // TODO: 调用企业微信API发送
        log.debug("发送企业微信通知: userId={}, title={}", notification.getUserId(), notification.getTitle());
    }

    /**
     * 发送钉钉通知
     */
    private void sendDingtalkNotification(Notification notification) {
        // TODO: 调用钉钉API发送
        log.debug("发送钉钉通知: userId={}, title={}", notification.getUserId(), notification.getTitle());
    }

    /**
     * 渲染模板
     */
    private String renderTemplate(String template, Map<String, Object> variables) {
        if (template == null || variables == null) {
            return template;
        }
        
        String result = template;
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "${" + entry.getKey() + "}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replace(placeholder, value);
        }
        
        return result;
    }
}