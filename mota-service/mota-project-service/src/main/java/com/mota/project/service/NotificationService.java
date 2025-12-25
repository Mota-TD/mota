package com.mota.project.service;

import com.mota.project.entity.Notification;
import com.mota.project.entity.NotificationDndSettings;
import com.mota.project.entity.NotificationPreferences;
import com.mota.project.entity.NotificationSubscription;

import java.util.List;
import java.util.Map;

/**
 * 通知服务接口
 * 支持站内通知、邮件通知、通知聚合、智能分类、重要置顶、低优先级折叠、免打扰模式、订阅管理
 */
public interface NotificationService {

    // ==================== 基础通知功能 ====================

    /**
     * 创建通知
     */
    Notification createNotification(Notification notification);

    /**
     * 批量创建通知
     */
    List<Notification> createNotifications(List<Notification> notifications);

    /**
     * 获取用户通知列表（支持聚合）
     * @param userId 用户ID
     * @param category 分类筛选
     * @param isRead 已读状态筛选
     * @param aggregated 是否聚合显示
     * @param page 页码
     * @param pageSize 每页数量
     */
    Map<String, Object> getUserNotifications(Long userId, String category, Boolean isRead,
                                              boolean aggregated, int page, int pageSize);

    /**
     * 获取聚合通知的详细列表
     */
    List<Notification> getAggregatedNotificationDetails(Long userId, String groupKey);

    /**
     * 获取通知详情
     */
    Notification getNotificationById(Long id);

    /**
     * 标记通知为已读
     */
    boolean markAsRead(Long id);

    /**
     * 批量标记为已读
     */
    boolean markAsRead(List<Long> ids);

    /**
     * 标记分组通知为已读
     */
    boolean markGroupAsRead(Long userId, String groupKey);

    /**
     * 标记所有通知为已读
     */
    boolean markAllAsRead(Long userId);

    /**
     * 标记某分类的所有通知为已读
     */
    boolean markCategoryAsRead(Long userId, String category);

    /**
     * 删除通知
     */
    boolean deleteNotification(Long id);

    /**
     * 批量删除通知
     */
    boolean deleteNotifications(List<Long> ids);

    /**
     * 删除分组通知
     */
    boolean deleteGroupNotifications(Long userId, String groupKey);

    /**
     * 获取未读通知数量
     */
    Map<String, Long> getUnreadCount(Long userId);

    /**
     * 获取各分类的未读数量
     */
    Map<String, Long> getUnreadCountByCategory(Long userId);

    // ==================== 置顶功能 (NT-008) ====================

    /**
     * 置顶通知
     */
    boolean pinNotification(Long id);

    /**
     * 取消置顶
     */
    boolean unpinNotification(Long id);

    /**
     * 获取置顶通知列表
     */
    List<Notification> getPinnedNotifications(Long userId);

    // ==================== 折叠功能 (NT-009) ====================

    /**
     * 折叠通知
     */
    boolean collapseNotification(Long id);

    /**
     * 展开通知
     */
    boolean expandNotification(Long id);

    /**
     * 批量折叠低优先级通知
     */
    int collapseLowPriorityNotifications(Long userId);

    // ==================== 智能分类功能 (NT-007) ====================

    /**
     * AI智能分类通知
     */
    void classifyNotification(Notification notification);

    /**
     * 批量AI分类
     */
    void batchClassifyNotifications(List<Notification> notifications);

    /**
     * 重新分类通知
     */
    boolean reclassifyNotification(Long id, String classification);

    /**
     * 获取重要通知列表
     */
    List<Notification> getImportantNotifications(Long userId, int page, int pageSize);

    /**
     * 根据AI分类获取通知
     */
    List<Notification> getNotificationsByAiClassification(Long userId, String classification, int page, int pageSize);

    // ==================== 免打扰模式 (NT-010) ====================

    /**
     * 获取免打扰设置
     */
    NotificationDndSettings getDndSettings(Long userId);

    /**
     * 更新免打扰设置
     */
    NotificationDndSettings updateDndSettings(Long userId, NotificationDndSettings settings);

    /**
     * 启用临时免打扰
     * @param userId 用户ID
     * @param durationMinutes 持续时间（分钟），-1表示直到手动关闭
     */
    boolean enableTempDnd(Long userId, int durationMinutes);

    /**
     * 关闭免打扰
     */
    boolean disableDnd(Long userId);

    /**
     * 检查是否在免打扰时段
     */
    Map<String, Object> checkDndStatus(Long userId);

    // ==================== 订阅管理 (NT-011) ====================

    /**
     * 获取用户订阅列表
     */
    List<NotificationSubscription> getSubscriptions(Long userId);

    /**
     * 创建订阅规则
     */
    NotificationSubscription createSubscription(NotificationSubscription subscription);

    /**
     * 更新订阅规则
     */
    NotificationSubscription updateSubscription(Long id, NotificationSubscription subscription);

    /**
     * 删除订阅规则
     */
    boolean deleteSubscription(Long id);

    /**
     * 批量更新订阅状态
     */
    boolean batchUpdateSubscriptions(Long userId, String category, Boolean enabled, Boolean emailEnabled, Boolean pushEnabled);

    /**
     * 初始化用户默认订阅
     */
    void initDefaultSubscriptions(Long userId);

    // ==================== 通知偏好设置 ====================

    /**
     * 获取通知偏好设置
     */
    NotificationPreferences getPreferences(Long userId);

    /**
     * 更新通知偏好设置
     */
    NotificationPreferences updatePreferences(Long userId, NotificationPreferences preferences);

    // ==================== 邮件通知 (NT-002) ====================

    /**
     * 发送邮件通知
     */
    void sendEmailNotification(Notification notification, String email);

    /**
     * 批量发送待发邮件
     */
    int processPendingEmailNotifications(int batchSize);

    // ==================== 推送通知 (NT-003/004/005 预留) ====================

    /**
     * 发送推送通知
     */
    void sendPushNotification(Notification notification, String pushType);

    /**
     * 批量发送待发推送
     */
    int processPendingPushNotifications(int batchSize);

    // ==================== 业务通知发送 ====================

    /**
     * 发送任务分配通知
     */
    void sendTaskAssignedNotification(Long taskId, Long assigneeId, Long assignerId,
                                       String taskTitle, Long projectId, String projectName);

    /**
     * 发送任务完成通知
     */
    void sendTaskCompletedNotification(Long taskId, String taskTitle, Long projectId,
                                        String projectName, List<Long> notifyUserIds);

    /**
     * 发送评论通知
     */
    void sendCommentNotification(Long commentId, Long taskId, String taskTitle,
                                  Long commenterId, String commenterName,
                                  List<Long> notifyUserIds);

    /**
     * 发送@提及通知
     */
    void sendMentionNotification(Long relatedId, String relatedType, String content,
                                  Long mentionerId, String mentionerName,
                                  List<Long> mentionedUserIds);

    /**
     * 发送截止日期提醒
     */
    void sendDeadlineReminder(Long taskId, String taskTitle, Long projectId,
                               String projectName, Long userId, int daysRemaining);

    /**
     * 发送里程碑达成通知
     */
    void sendMilestoneReachedNotification(Long milestoneId, String milestoneName,
                                           Long projectId, String projectName,
                                           List<Long> notifyUserIds);

    /**
     * 发送系统通知
     */
    void sendSystemNotification(String title, String content, List<Long> userIds);

    /**
     * 发送计划审批通知
     */
    void sendPlanApprovalNotification(Long planId, String planTitle, Long userId,
                                       String status, String comment);

    /**
     * 发送工作反馈通知
     */
    void sendFeedbackNotification(Long feedbackId, Long taskId, String taskTitle,
                                   Long senderId, String senderName, Long receiverId);

    // ==================== 维护功能 ====================

    /**
     * 清理过期通知（保留最近N天的通知）
     */
    int cleanupOldNotifications(int retentionDays);

    /**
     * 聚合相似通知
     */
    void aggregateSimilarNotifications(Long userId, String groupKey);
}