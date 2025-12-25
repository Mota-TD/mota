package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.project.entity.Notification;
import com.mota.project.entity.NotificationDndSettings;
import com.mota.project.entity.NotificationPreferences;
import com.mota.project.entity.NotificationSubscription;
import com.mota.project.mapper.NotificationDndSettingsMapper;
import com.mota.project.mapper.NotificationMapper;
import com.mota.project.mapper.NotificationPreferencesMapper;
import com.mota.project.mapper.NotificationSubscriptionMapper;
import com.mota.project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 通知服务实现类
 * 支持站内通知、邮件通知、通知聚合、智能分类、重要置顶、低优先级折叠、免打扰模式、订阅管理
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationSubscriptionMapper subscriptionMapper;
    private final NotificationDndSettingsMapper dndSettingsMapper;
    private final NotificationPreferencesMapper preferencesMapper;

    // 通知类型常量
    public static final String TYPE_TASK_ASSIGNED = "task_assigned";
    public static final String TYPE_TASK_COMPLETED = "task_completed";
    public static final String TYPE_COMMENT_ADDED = "comment_added";
    public static final String TYPE_MILESTONE_REACHED = "milestone_reached";
    public static final String TYPE_DEADLINE_REMINDER = "deadline_reminder";
    public static final String TYPE_MENTION = "mention";
    public static final String TYPE_SYSTEM = "system";
    public static final String TYPE_PLAN_SUBMITTED = "plan_submitted";
    public static final String TYPE_PLAN_APPROVED = "plan_approved";
    public static final String TYPE_PLAN_REJECTED = "plan_rejected";
    public static final String TYPE_FEEDBACK_RECEIVED = "feedback_received";

    // 分类常量
    public static final String CATEGORY_TASK = "task";
    public static final String CATEGORY_PROJECT = "project";
    public static final String CATEGORY_COMMENT = "comment";
    public static final String CATEGORY_SYSTEM = "system";
    public static final String CATEGORY_REMINDER = "reminder";
    public static final String CATEGORY_PLAN = "plan";
    public static final String CATEGORY_FEEDBACK = "feedback";

    // 优先级常量
    public static final String PRIORITY_LOW = "low";
    public static final String PRIORITY_NORMAL = "normal";
    public static final String PRIORITY_HIGH = "high";
    public static final String PRIORITY_URGENT = "urgent";

    // AI分类常量
    public static final String AI_CLASS_IMPORTANT = "important";
    public static final String AI_CLASS_NORMAL = "normal";
    public static final String AI_CLASS_LOW_PRIORITY = "low_priority";
    public static final String AI_CLASS_SPAM = "spam";

    // ==================== 基础通知功能 ====================

    @Override
    @Transactional
    public Notification createNotification(Notification notification) {
        // 设置默认值
        if (notification.getCategory() == null) {
            notification.setCategory(inferCategory(notification.getType()));
        }
        if (notification.getPriority() == null) {
            notification.setPriority(PRIORITY_NORMAL);
        }
        if (notification.getGroupKey() == null) {
            notification.setGroupKey(generateGroupKey(notification));
        }
        notification.setIsRead(0);
        notification.setIsPinned(0);
        notification.setIsCollapsed(0);
        notification.setAggregatedCount(1);
        notification.setEmailSent(0);
        notification.setPushSent(0);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        // AI智能分类
        classifyNotification(notification);

        // 检查用户偏好设置
        NotificationPreferences prefs = getOrCreatePreferences(notification.getUserId());
        
        // 自动置顶紧急通知
        if (prefs.getAutoPinUrgent() != null && prefs.getAutoPinUrgent() 
                && PRIORITY_URGENT.equals(notification.getPriority())) {
            notification.setIsPinned(1);
        }
        
        // 自动置顶@提及
        if (prefs.getAutoPinMentions() != null && prefs.getAutoPinMentions() 
                && TYPE_MENTION.equals(notification.getType())) {
            notification.setIsPinned(1);
        }
        
        // 低优先级自动折叠
        if (prefs.getShowLowPriorityCollapsed() != null && prefs.getShowLowPriorityCollapsed()
                && AI_CLASS_LOW_PRIORITY.equals(notification.getAiClassification())) {
            notification.setIsCollapsed(1);
        }

        notificationMapper.insert(notification);

        // 更新同组通知的聚合计数
        if (notification.getGroupKey() != null) {
            notificationMapper.updateAggregatedCount(notification.getUserId(), notification.getGroupKey());
        }

        return notification;
    }

    @Override
    @Transactional
    public List<Notification> createNotifications(List<Notification> notifications) {
        if (notifications == null || notifications.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : notifications) {
            if (notification.getCategory() == null) {
                notification.setCategory(inferCategory(notification.getType()));
            }
            if (notification.getPriority() == null) {
                notification.setPriority(PRIORITY_NORMAL);
            }
            if (notification.getGroupKey() == null) {
                notification.setGroupKey(generateGroupKey(notification));
            }
            notification.setIsRead(0);
            notification.setIsPinned(0);
            notification.setIsCollapsed(0);
            notification.setAggregatedCount(1);
            notification.setEmailSent(0);
            notification.setPushSent(0);
            notification.setCreatedAt(now);
            notification.setUpdatedAt(now);
            
            // AI智能分类
            classifyNotification(notification);
        }

        notificationMapper.batchInsert(notifications);

        // 更新聚合计数
        Set<String> groupKeys = notifications.stream()
                .filter(n -> n.getGroupKey() != null)
                .map(n -> n.getUserId() + ":" + n.getGroupKey())
                .collect(Collectors.toSet());

        for (String key : groupKeys) {
            String[] parts = key.split(":", 2);
            Long userId = Long.parseLong(parts[0]);
            String groupKey = parts[1];
            notificationMapper.updateAggregatedCount(userId, groupKey);
        }

        return notifications;
    }

    @Override
    public Map<String, Object> getUserNotifications(Long userId, String category, Boolean isRead,
                                                     boolean aggregated, int page, int pageSize) {
        Map<String, Object> result = new HashMap<>();
        int offset = (page - 1) * pageSize;
        Integer isReadValue = isRead == null ? null : (isRead ? 1 : 0);

        List<Notification> notifications;
        Long total;

        if (aggregated) {
            notifications = notificationMapper.selectAggregatedNotifications(
                    userId, category, isReadValue, offset, pageSize);
            total = notificationMapper.countAggregatedNotifications(userId, category, isReadValue);
        } else {
            LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Notification::getUserId, userId);
            if (category != null && !category.isEmpty()) {
                wrapper.eq(Notification::getCategory, category);
            }
            if (isRead != null) {
                wrapper.eq(Notification::getIsRead, isRead ? 1 : 0);
            }
            wrapper.orderByDesc(Notification::getIsPinned);
            wrapper.orderByDesc(Notification::getCreatedAt);
            wrapper.last("LIMIT " + pageSize + " OFFSET " + offset);

            notifications = notificationMapper.selectList(wrapper);

            LambdaQueryWrapper<Notification> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.eq(Notification::getUserId, userId);
            if (category != null && !category.isEmpty()) {
                countWrapper.eq(Notification::getCategory, category);
            }
            if (isRead != null) {
                countWrapper.eq(Notification::getIsRead, isRead ? 1 : 0);
            }
            total = notificationMapper.selectCount(countWrapper);
        }

        // 获取未读数量
        LambdaQueryWrapper<Notification> unreadWrapper = new LambdaQueryWrapper<>();
        unreadWrapper.eq(Notification::getUserId, userId);
        unreadWrapper.eq(Notification::getIsRead, 0);
        Long unreadCount = notificationMapper.selectCount(unreadWrapper);

        result.put("list", notifications);
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("unreadCount", unreadCount);

        return result;
    }

    @Override
    public List<Notification> getAggregatedNotificationDetails(Long userId, String groupKey) {
        return notificationMapper.selectByGroupKey(userId, groupKey);
    }

    @Override
    public Notification getNotificationById(Long id) {
        return notificationMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean markAsRead(Long id) {
        Notification notification = notificationMapper.selectById(id);
        if (notification != null && notification.getIsRead() == 0) {
            notification.setIsRead(1);
            notification.setUpdatedAt(LocalDateTime.now());
            return notificationMapper.updateById(notification) > 0;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean markAsRead(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return false;
        }
        return notificationMapper.markAsReadByIds(ids) > 0;
    }

    @Override
    @Transactional
    public boolean markGroupAsRead(Long userId, String groupKey) {
        return notificationMapper.markGroupAsRead(userId, groupKey) > 0;
    }

    @Override
    @Transactional
    public boolean markAllAsRead(Long userId) {
        return notificationMapper.markAllAsRead(userId) > 0;
    }

    @Override
    @Transactional
    public boolean markCategoryAsRead(Long userId, String category) {
        return notificationMapper.markCategoryAsRead(userId, category) > 0;
    }

    @Override
    @Transactional
    public boolean deleteNotification(Long id) {
        return notificationMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional
    public boolean deleteNotifications(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return false;
        }
        return notificationMapper.deleteBatchIds(ids) > 0;
    }

    @Override
    @Transactional
    public boolean deleteGroupNotifications(Long userId, String groupKey) {
        return notificationMapper.deleteByGroupKey(userId, groupKey) > 0;
    }

    @Override
    public Map<String, Long> getUnreadCount(Long userId) {
        Map<String, Long> result = new HashMap<>();

        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getUserId, userId);
        wrapper.eq(Notification::getIsRead, 0);
        Long total = notificationMapper.selectCount(wrapper);

        result.put("total", total);
        return result;
    }

    @Override
    public Map<String, Long> getUnreadCountByCategory(Long userId) {
        Map<String, Long> result = new HashMap<>();
        List<Map<String, Object>> counts = notificationMapper.selectUnreadCountByCategory(userId);

        for (Map<String, Object> count : counts) {
            String category = (String) count.get("category");
            Long countValue = ((Number) count.get("count")).longValue();
            result.put(category, countValue);
        }

        // 确保所有分类都有值
        result.putIfAbsent(CATEGORY_TASK, 0L);
        result.putIfAbsent(CATEGORY_PROJECT, 0L);
        result.putIfAbsent(CATEGORY_COMMENT, 0L);
        result.putIfAbsent(CATEGORY_SYSTEM, 0L);
        result.putIfAbsent(CATEGORY_REMINDER, 0L);
        result.putIfAbsent(CATEGORY_PLAN, 0L);
        result.putIfAbsent(CATEGORY_FEEDBACK, 0L);

        // 计算总数
        long total = result.values().stream().mapToLong(Long::longValue).sum();
        result.put("total", total);

        return result;
    }

    // ==================== 置顶功能 (NT-008) ====================

    @Override
    @Transactional
    public boolean pinNotification(Long id) {
        return notificationMapper.pinNotification(id) > 0;
    }

    @Override
    @Transactional
    public boolean unpinNotification(Long id) {
        return notificationMapper.unpinNotification(id) > 0;
    }

    @Override
    public List<Notification> getPinnedNotifications(Long userId) {
        return notificationMapper.selectPinnedNotifications(userId);
    }

    // ==================== 折叠功能 (NT-009) ====================

    @Override
    @Transactional
    public boolean collapseNotification(Long id) {
        return notificationMapper.collapseNotification(id) > 0;
    }

    @Override
    @Transactional
    public boolean expandNotification(Long id) {
        return notificationMapper.expandNotification(id) > 0;
    }

    @Override
    @Transactional
    public int collapseLowPriorityNotifications(Long userId) {
        return notificationMapper.collapseLowPriorityNotifications(userId);
    }

    // ==================== 智能分类功能 (NT-007) ====================

    @Override
    public void classifyNotification(Notification notification) {
        // 基于规则的AI分类（实际项目中可接入真正的AI模型）
        String classification = AI_CLASS_NORMAL;
        int score = 50;

        String priority = notification.getPriority();
        String type = notification.getType();

        // 根据优先级分类
        if (PRIORITY_URGENT.equals(priority)) {
            classification = AI_CLASS_IMPORTANT;
            score = 95;
        } else if (PRIORITY_HIGH.equals(priority)) {
            classification = AI_CLASS_IMPORTANT;
            score = 80;
        } else if (PRIORITY_LOW.equals(priority)) {
            classification = AI_CLASS_LOW_PRIORITY;
            score = 25;
        }

        // 根据类型调整
        if (TYPE_MENTION.equals(type)) {
            classification = AI_CLASS_IMPORTANT;
            score = Math.max(score, 85);
        } else if (TYPE_DEADLINE_REMINDER.equals(type)) {
            classification = AI_CLASS_IMPORTANT;
            score = Math.max(score, 90);
        } else if (TYPE_TASK_ASSIGNED.equals(type)) {
            score = Math.max(score, 75);
            if (score >= 75) {
                classification = AI_CLASS_IMPORTANT;
            }
        }

        notification.setAiClassification(classification);
        notification.setAiScore(score);
    }

    @Override
    public void batchClassifyNotifications(List<Notification> notifications) {
        for (Notification notification : notifications) {
            classifyNotification(notification);
        }
    }

    @Override
    @Transactional
    public boolean reclassifyNotification(Long id, String classification) {
        Notification notification = notificationMapper.selectById(id);
        if (notification == null) {
            return false;
        }
        
        int score = 50;
        switch (classification) {
            case AI_CLASS_IMPORTANT:
                score = 85;
                break;
            case AI_CLASS_NORMAL:
                score = 50;
                break;
            case AI_CLASS_LOW_PRIORITY:
                score = 25;
                break;
            case AI_CLASS_SPAM:
                score = 5;
                break;
        }
        
        return notificationMapper.updateAiClassification(id, classification, score) > 0;
    }

    @Override
    public List<Notification> getImportantNotifications(Long userId, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return notificationMapper.selectImportantNotifications(userId, null, offset, pageSize);
    }

    @Override
    public List<Notification> getNotificationsByAiClassification(Long userId, String classification, int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return notificationMapper.selectByAiClassification(userId, classification, null, offset, pageSize);
    }

    // ==================== 免打扰模式 (NT-010) ====================

    @Override
    public NotificationDndSettings getDndSettings(Long userId) {
        NotificationDndSettings settings = dndSettingsMapper.selectByUserId(userId);
        if (settings == null) {
            // 创建默认设置
            settings = new NotificationDndSettings();
            settings.setUserId(userId);
            settings.setEnabled(false);
            settings.setStartTime("22:00");
            settings.setEndTime("08:00");
            settings.setWeekdays("0,1,2,3,4,5,6");
            settings.setAllowUrgent(true);
            settings.setAllowMentions(true);
            settings.setTempEnabled(false);
            settings.setCreatedAt(LocalDateTime.now());
            settings.setUpdatedAt(LocalDateTime.now());
            dndSettingsMapper.insert(settings);
        }
        return settings;
    }

    @Override
    @Transactional
    public NotificationDndSettings updateDndSettings(Long userId, NotificationDndSettings settings) {
        settings.setUserId(userId);
        settings.setUpdatedAt(LocalDateTime.now());
        dndSettingsMapper.insertOrUpdate(settings);
        return getDndSettings(userId);
    }

    @Override
    @Transactional
    public boolean enableTempDnd(Long userId, int durationMinutes) {
        // 确保设置存在
        getDndSettings(userId);
        
        LocalDateTime endTime = null;
        if (durationMinutes > 0) {
            endTime = LocalDateTime.now().plusMinutes(durationMinutes);
        } else {
            // -1 表示直到手动关闭，设置一个很远的时间
            endTime = LocalDateTime.now().plusYears(1);
        }
        
        return dndSettingsMapper.enableTempDnd(userId, endTime) > 0;
    }

    @Override
    @Transactional
    public boolean disableDnd(Long userId) {
        return dndSettingsMapper.disableTempDnd(userId) > 0;
    }

    @Override
    public Map<String, Object> checkDndStatus(Long userId) {
        Map<String, Object> result = new HashMap<>();
        NotificationDndSettings settings = getDndSettings(userId);
        
        boolean isActive = false;
        String endTime = null;
        
        // 检查临时免打扰
        if (settings.getTempEnabled() != null && settings.getTempEnabled() 
                && settings.getTempEndTime() != null 
                && settings.getTempEndTime().isAfter(LocalDateTime.now())) {
            isActive = true;
            endTime = settings.getTempEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }
        // 检查定时免打扰
        else if (settings.getEnabled() != null && settings.getEnabled()) {
            isActive = isInDndPeriod(settings);
        }
        
        result.put("isActive", isActive);
        result.put("endTime", endTime);
        result.put("allowUrgent", settings.getAllowUrgent());
        result.put("allowMentions", settings.getAllowMentions());
        
        return result;
    }

    private boolean isInDndPeriod(NotificationDndSettings settings) {
        if (settings.getStartTime() == null || settings.getEndTime() == null) {
            return false;
        }
        
        LocalTime now = LocalTime.now();
        LocalTime start = LocalTime.parse(settings.getStartTime());
        LocalTime end = LocalTime.parse(settings.getEndTime());
        
        // 检查星期几
        int dayOfWeek = LocalDateTime.now().getDayOfWeek().getValue() % 7; // 转换为0=周日
        int[] weekdays = settings.getWeekdaysArray();
        boolean dayMatch = false;
        for (int day : weekdays) {
            if (day == dayOfWeek) {
                dayMatch = true;
                break;
            }
        }
        if (!dayMatch) {
            return false;
        }
        
        // 检查时间
        if (start.isBefore(end)) {
            // 同一天内的时间段
            return now.isAfter(start) && now.isBefore(end);
        } else {
            // 跨天的时间段（如22:00-08:00）
            return now.isAfter(start) || now.isBefore(end);
        }
    }

    // ==================== 订阅管理 (NT-011) ====================

    @Override
    public List<NotificationSubscription> getSubscriptions(Long userId) {
        List<NotificationSubscription> subscriptions = subscriptionMapper.selectByUserId(userId);
        if (subscriptions == null || subscriptions.isEmpty()) {
            // 初始化默认订阅
            initDefaultSubscriptions(userId);
            subscriptions = subscriptionMapper.selectByUserId(userId);
        }
        return subscriptions;
    }

    @Override
    @Transactional
    public NotificationSubscription createSubscription(NotificationSubscription subscription) {
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionMapper.insert(subscription);
        return subscription;
    }

    @Override
    @Transactional
    public NotificationSubscription updateSubscription(Long id, NotificationSubscription subscription) {
        subscription.setId(id);
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionMapper.updateById(subscription);
        return subscriptionMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteSubscription(Long id) {
        return subscriptionMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional
    public boolean batchUpdateSubscriptions(Long userId, String category, Boolean enabled, Boolean emailEnabled, Boolean pushEnabled) {
        int updated = 0;
        if (enabled != null) {
            updated += subscriptionMapper.batchUpdateEnabled(userId, category, enabled);
        }
        if (emailEnabled != null) {
            updated += subscriptionMapper.batchUpdateEmailEnabled(userId, category, emailEnabled);
        }
        if (pushEnabled != null) {
            updated += subscriptionMapper.batchUpdatePushEnabled(userId, category, pushEnabled);
        }
        return updated > 0;
    }

    @Override
    @Transactional
    public void initDefaultSubscriptions(Long userId) {
        subscriptionMapper.insertDefaultSubscriptions(userId);
    }

    // ==================== 通知偏好设置 ====================

    @Override
    public NotificationPreferences getPreferences(Long userId) {
        return getOrCreatePreferences(userId);
    }

    @Override
    @Transactional
    public NotificationPreferences updatePreferences(Long userId, NotificationPreferences preferences) {
        preferences.setUserId(userId);
        preferences.setUpdatedAt(LocalDateTime.now());
        preferencesMapper.insertOrUpdate(preferences);
        return getPreferences(userId);
    }

    private NotificationPreferences getOrCreatePreferences(Long userId) {
        NotificationPreferences prefs = preferencesMapper.selectByUserId(userId);
        if (prefs == null) {
            prefs = NotificationPreferences.createDefault(userId);
            preferencesMapper.insert(prefs);
        }
        return prefs;
    }

    // ==================== 邮件通知 (NT-002) ====================

    @Override
    public void sendEmailNotification(Notification notification, String email) {
        // 检查订阅设置
        NotificationSubscription subscription = subscriptionMapper.selectByUserAndCategory(
                notification.getUserId(), notification.getCategory());
        if (subscription == null || !subscription.getEmailEnabled()) {
            log.debug("Email notification disabled for user {} category {}", 
                    notification.getUserId(), notification.getCategory());
            return;
        }
        
        // 检查免打扰
        Map<String, Object> dndStatus = checkDndStatus(notification.getUserId());
        if ((Boolean) dndStatus.get("isActive")) {
            // 检查是否允许紧急通知
            if (!PRIORITY_URGENT.equals(notification.getPriority()) 
                    || !(Boolean) dndStatus.get("allowUrgent")) {
                // 检查是否允许@提及
                if (!TYPE_MENTION.equals(notification.getType()) 
                        || !(Boolean) dndStatus.get("allowMentions")) {
                    log.debug("Email notification blocked by DND for user {}", notification.getUserId());
                    return;
                }
            }
        }
        
        // TODO: 实际发送邮件逻辑
        // 这里应该调用邮件服务发送邮件
        log.info("Sending email notification to {} for notification {}", email, notification.getId());
        
        // 标记邮件已发送
        notificationMapper.markEmailSent(notification.getId());
    }

    @Override
    @Transactional
    public int processPendingEmailNotifications(int batchSize) {
        List<Notification> pendingNotifications = notificationMapper.selectPendingEmailNotifications(batchSize);
        int sent = 0;
        
        for (Notification notification : pendingNotifications) {
            try {
                // TODO: 获取用户邮箱
                String email = "user@example.com"; // 实际应从用户服务获取
                sendEmailNotification(notification, email);
                sent++;
            } catch (Exception e) {
                log.error("Failed to send email for notification {}", notification.getId(), e);
            }
        }
        
        return sent;
    }

    // ==================== 推送通知 (NT-003/004/005 预留) ====================

    @Override
    public void sendPushNotification(Notification notification, String pushType) {
        // 检查订阅设置
        NotificationSubscription subscription = subscriptionMapper.selectByUserAndCategory(
                notification.getUserId(), notification.getCategory());
        if (subscription == null || !subscription.getPushEnabled()) {
            log.debug("Push notification disabled for user {} category {}", 
                    notification.getUserId(), notification.getCategory());
            return;
        }
        
        // TODO: 实际推送逻辑（App推送、企微、钉钉等）
        log.info("Sending {} push notification for notification {}", pushType, notification.getId());
        
        // 标记推送已发送
        notificationMapper.markPushSent(notification.getId());
    }

    @Override
    @Transactional
    public int processPendingPushNotifications(int batchSize) {
        List<Notification> pendingNotifications = notificationMapper.selectPendingPushNotifications(batchSize);
        int sent = 0;
        
        for (Notification notification : pendingNotifications) {
            try {
                sendPushNotification(notification, "app");
                sent++;
            } catch (Exception e) {
                log.error("Failed to send push for notification {}", notification.getId(), e);
            }
        }
        
        return sent;
    }

    // ==================== 业务通知发送 ====================

    @Override
    @Transactional
    public void sendTaskAssignedNotification(Long taskId, Long assigneeId, Long assignerId,
                                              String taskTitle, Long projectId, String projectName) {
        Notification notification = new Notification();
        notification.setType(TYPE_TASK_ASSIGNED);
        notification.setCategory(CATEGORY_TASK);
        notification.setTitle("新任务分配");
        notification.setContent("您被分配了新任务: " + taskTitle);
        notification.setUserId(assigneeId);
        notification.setRelatedId(taskId);
        notification.setRelatedType("task");
        notification.setSenderId(assignerId);
        notification.setProjectId(projectId);
        notification.setProjectName(projectName);
        notification.setActionUrl("/tasks/" + taskId);
        notification.setPriority(PRIORITY_HIGH);
        notification.setGroupKey(CATEGORY_TASK + "_assigned_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

        createNotification(notification);
    }

    @Override
    @Transactional
    public void sendTaskCompletedNotification(Long taskId, String taskTitle, Long projectId,
                                               String projectName, List<Long> notifyUserIds) {
        List<Notification> notifications = new ArrayList<>();

        for (Long userId : notifyUserIds) {
            Notification notification = new Notification();
            notification.setType(TYPE_TASK_COMPLETED);
            notification.setCategory(CATEGORY_TASK);
            notification.setTitle("任务完成");
            notification.setContent("任务已完成: " + taskTitle);
            notification.setUserId(userId);
            notification.setRelatedId(taskId);
            notification.setRelatedType("task");
            notification.setProjectId(projectId);
            notification.setProjectName(projectName);
            notification.setActionUrl("/tasks/" + taskId);
            notification.setPriority(PRIORITY_NORMAL);
            notification.setGroupKey(CATEGORY_TASK + "_completed_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

            notifications.add(notification);
        }

        createNotifications(notifications);
    }

    @Override
    @Transactional
    public void sendCommentNotification(Long commentId, Long taskId, String taskTitle,
                                         Long commenterId, String commenterName,
                                         List<Long> notifyUserIds) {
        List<Notification> notifications = new ArrayList<>();

        for (Long userId : notifyUserIds) {
            if (userId.equals(commenterId)) {
                continue; // 不通知评论者自己
            }

            Notification notification = new Notification();
            notification.setType(TYPE_COMMENT_ADDED);
            notification.setCategory(CATEGORY_COMMENT);
            notification.setTitle("新评论");
            notification.setContent(commenterName + " 在任务 \"" + taskTitle + "\" 中添加了评论");
            notification.setUserId(userId);
            notification.setRelatedId(commentId);
            notification.setRelatedType("comment");
            notification.setSenderId(commenterId);
            notification.setSenderName(commenterName);
            notification.setActionUrl("/tasks/" + taskId + "#comment-" + commentId);
            notification.setPriority(PRIORITY_NORMAL);
            notification.setGroupKey(CATEGORY_COMMENT + "_task_" + taskId);

            notifications.add(notification);
        }

        if (!notifications.isEmpty()) {
            createNotifications(notifications);
        }
    }

    @Override
    @Transactional
    public void sendMentionNotification(Long relatedId, String relatedType, String content,
                                         Long mentionerId, String mentionerName,
                                         List<Long> mentionedUserIds) {
        List<Notification> notifications = new ArrayList<>();

        for (Long userId : mentionedUserIds) {
            if (userId.equals(mentionerId)) {
                continue;
            }

            Notification notification = new Notification();
            notification.setType(TYPE_MENTION);
            notification.setCategory(CATEGORY_COMMENT);
            notification.setTitle("有人@了您");
            notification.setContent(mentionerName + " 在评论中提到了您: " + truncateContent(content, 50));
            notification.setUserId(userId);
            notification.setRelatedId(relatedId);
            notification.setRelatedType(relatedType);
            notification.setSenderId(mentionerId);
            notification.setSenderName(mentionerName);
            notification.setPriority(PRIORITY_HIGH);
            notification.setGroupKey(CATEGORY_COMMENT + "_mention_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

            notifications.add(notification);
        }

        if (!notifications.isEmpty()) {
            createNotifications(notifications);
        }
    }

    @Override
    @Transactional
    public void sendDeadlineReminder(Long taskId, String taskTitle, Long projectId,
                                      String projectName, Long userId, int daysRemaining) {
        Notification notification = new Notification();
        notification.setType(TYPE_DEADLINE_REMINDER);
        notification.setCategory(CATEGORY_REMINDER);

        if (daysRemaining == 0) {
            notification.setTitle("任务今天截止");
            notification.setContent("任务 \"" + taskTitle + "\" 今天截止，请尽快完成");
            notification.setPriority(PRIORITY_URGENT);
        } else if (daysRemaining < 0) {
            notification.setTitle("任务已逾期");
            notification.setContent("任务 \"" + taskTitle + "\" 已逾期 " + Math.abs(daysRemaining) + " 天");
            notification.setPriority(PRIORITY_URGENT);
        } else {
            notification.setTitle("任务即将截止");
            notification.setContent("任务 \"" + taskTitle + "\" 将在 " + daysRemaining + " 天后截止");
            notification.setPriority(PRIORITY_HIGH);
        }

        notification.setUserId(userId);
        notification.setRelatedId(taskId);
        notification.setRelatedType("task");
        notification.setProjectId(projectId);
        notification.setProjectName(projectName);
        notification.setActionUrl("/tasks/" + taskId);
        notification.setGroupKey(CATEGORY_REMINDER + "_deadline_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

        createNotification(notification);
    }

    @Override
    @Transactional
    public void sendMilestoneReachedNotification(Long milestoneId, String milestoneName,
                                                  Long projectId, String projectName,
                                                  List<Long> notifyUserIds) {
        List<Notification> notifications = new ArrayList<>();

        for (Long userId : notifyUserIds) {
            Notification notification = new Notification();
            notification.setType(TYPE_MILESTONE_REACHED);
            notification.setCategory(CATEGORY_PROJECT);
            notification.setTitle("里程碑达成");
            notification.setContent("项目 \"" + projectName + "\" 达成里程碑: " + milestoneName);
            notification.setUserId(userId);
            notification.setRelatedId(milestoneId);
            notification.setRelatedType("milestone");
            notification.setProjectId(projectId);
            notification.setProjectName(projectName);
            notification.setActionUrl("/projects/" + projectId + "/milestones/" + milestoneId);
            notification.setPriority(PRIORITY_NORMAL);
            notification.setGroupKey(CATEGORY_PROJECT + "_milestone_" + projectId);

            notifications.add(notification);
        }

        createNotifications(notifications);
    }

    @Override
    @Transactional
    public void sendSystemNotification(String title, String content, List<Long> userIds) {
        List<Notification> notifications = new ArrayList<>();

        for (Long userId : userIds) {
            Notification notification = new Notification();
            notification.setType(TYPE_SYSTEM);
            notification.setCategory(CATEGORY_SYSTEM);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setUserId(userId);
            notification.setPriority(PRIORITY_NORMAL);
            notification.setGroupKey(CATEGORY_SYSTEM + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

            notifications.add(notification);
        }

        createNotifications(notifications);
    }

    @Override
    @Transactional
    public void sendPlanApprovalNotification(Long planId, String planTitle, Long userId,
                                              String status, String comment) {
        Notification notification = new Notification();
        notification.setCategory(CATEGORY_PLAN);
        notification.setUserId(userId);
        notification.setRelatedId(planId);
        notification.setRelatedType("plan");
        notification.setActionUrl("/department-tasks/" + planId);

        if ("approved".equals(status)) {
            notification.setType(TYPE_PLAN_APPROVED);
            notification.setTitle("计划审批通过");
            notification.setContent("您的计划 \"" + planTitle + "\" 已通过审批");
            notification.setPriority(PRIORITY_NORMAL);
        } else if ("rejected".equals(status)) {
            notification.setType(TYPE_PLAN_REJECTED);
            notification.setTitle("计划被驳回");
            notification.setContent("您的计划 \"" + planTitle + "\" 被驳回" + (comment != null ? ": " + comment : ""));
            notification.setPriority(PRIORITY_HIGH);
        } else {
            notification.setType(TYPE_PLAN_SUBMITTED);
            notification.setTitle("收到新计划");
            notification.setContent("收到新的工作计划: " + planTitle);
            notification.setPriority(PRIORITY_NORMAL);
        }

        notification.setGroupKey(CATEGORY_PLAN + "_" + status + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

        createNotification(notification);
    }

    @Override
    @Transactional
    public void sendFeedbackNotification(Long feedbackId, Long taskId, String taskTitle,
                                          Long senderId, String senderName, Long receiverId) {
        Notification notification = new Notification();
        notification.setType(TYPE_FEEDBACK_RECEIVED);
        notification.setCategory(CATEGORY_FEEDBACK);
        notification.setTitle("收到工作反馈");
        notification.setContent(senderName + " 对您的工作 \"" + taskTitle + "\" 进行了反馈评价");
        notification.setUserId(receiverId);
        notification.setRelatedId(feedbackId);
        notification.setRelatedType("feedback");
        notification.setSenderId(senderId);
        notification.setSenderName(senderName);
        notification.setActionUrl("/department-tasks/" + taskId);
        notification.setPriority(PRIORITY_NORMAL);
        notification.setGroupKey(CATEGORY_FEEDBACK + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));

        createNotification(notification);
    }

    // ==================== 维护功能 ====================

    @Override
    @Transactional
    public int cleanupOldNotifications(int retentionDays) {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(retentionDays);
        return notificationMapper.deleteOldNotifications(beforeDate);
    }

    @Override
    @Transactional
    public void aggregateSimilarNotifications(Long userId, String groupKey) {
        notificationMapper.updateAggregatedCount(userId, groupKey);
    }

    // ==================== 辅助方法 ====================

    /**
     * 根据通知类型推断分类
     */
    private String inferCategory(String type) {
        if (type == null) {
            return CATEGORY_SYSTEM;
        }

        switch (type) {
            case TYPE_TASK_ASSIGNED:
            case TYPE_TASK_COMPLETED:
                return CATEGORY_TASK;
            case TYPE_MILESTONE_REACHED:
                return CATEGORY_PROJECT;
            case TYPE_COMMENT_ADDED:
            case TYPE_MENTION:
                return CATEGORY_COMMENT;
            case TYPE_DEADLINE_REMINDER:
                return CATEGORY_REMINDER;
            case TYPE_PLAN_SUBMITTED:
            case TYPE_PLAN_APPROVED:
            case TYPE_PLAN_REJECTED:
                return CATEGORY_PLAN;
            case TYPE_FEEDBACK_RECEIVED:
                return CATEGORY_FEEDBACK;
            case TYPE_SYSTEM:
            default:
                return CATEGORY_SYSTEM;
        }
    }

    /**
     * 生成分组键
     */
    private String generateGroupKey(Notification notification) {
        String category = notification.getCategory();
        String type = notification.getType();
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // 根据不同类型生成不同的分组键
        if (notification.getRelatedId() != null && notification.getRelatedType() != null) {
            // 对于有关联对象的通知，按关联对象分组
            if (TYPE_COMMENT_ADDED.equals(type) || TYPE_MENTION.equals(type)) {
                return category + "_" + notification.getRelatedType() + "_" + notification.getRelatedId();
            }
        }

        // 默认按类型和日期分组
        return category + "_" + type + "_" + dateStr;
    }

    /**
     * 截断内容
     */
    private String truncateContent(String content, int maxLength) {
        if (content == null) {
            return "";
        }
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}