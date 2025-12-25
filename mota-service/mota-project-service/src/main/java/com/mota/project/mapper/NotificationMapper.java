package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 通知Mapper
 * 支持通知聚合、智能分类、置顶、折叠等功能
 */
@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {

    /**
     * 获取用户的聚合通知列表
     */
    List<Notification> selectAggregatedNotifications(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("isRead") Integer isRead,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    /**
     * 获取聚合通知的总数
     */
    Long countAggregatedNotifications(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("isRead") Integer isRead
    );

    /**
     * 获取分组内的所有通知
     */
    List<Notification> selectByGroupKey(
            @Param("userId") Long userId,
            @Param("groupKey") String groupKey
    );

    /**
     * 获取各分类的未读数量
     */
    List<Map<String, Object>> selectUnreadCountByCategory(@Param("userId") Long userId);

    /**
     * 批量标记为已读
     */
    int markAsReadByIds(@Param("ids") List<Long> ids);

    /**
     * 标记分组通知为已读
     */
    int markGroupAsRead(
            @Param("userId") Long userId,
            @Param("groupKey") String groupKey
    );

    /**
     * 标记某分类的所有通知为已读
     */
    int markCategoryAsRead(
            @Param("userId") Long userId,
            @Param("category") String category
    );

    /**
     * 标记用户所有通知为已读
     */
    int markAllAsRead(@Param("userId") Long userId);

    /**
     * 删除分组通知
     */
    int deleteByGroupKey(
            @Param("userId") Long userId,
            @Param("groupKey") String groupKey
    );

    /**
     * 删除过期通知
     */
    int deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * 更新聚合计数
     */
    int updateAggregatedCount(
            @Param("userId") Long userId,
            @Param("groupKey") String groupKey
    );

    /**
     * 批量插入通知
     */
    int batchInsert(@Param("notifications") List<Notification> notifications);

    // ==================== 置顶功能 ====================

    /**
     * 置顶通知
     */
    int pinNotification(@Param("id") Long id);

    /**
     * 取消置顶
     */
    int unpinNotification(@Param("id") Long id);

    /**
     * 获取置顶通知列表
     */
    List<Notification> selectPinnedNotifications(@Param("userId") Long userId);

    // ==================== 折叠功能 ====================

    /**
     * 折叠通知
     */
    int collapseNotification(@Param("id") Long id);

    /**
     * 展开通知
     */
    int expandNotification(@Param("id") Long id);

    /**
     * 批量折叠低优先级通知
     */
    int collapseLowPriorityNotifications(@Param("userId") Long userId);

    // ==================== AI分类功能 ====================

    /**
     * 更新AI分类
     */
    int updateAiClassification(
            @Param("id") Long id,
            @Param("aiClassification") String aiClassification,
            @Param("aiScore") Integer aiScore
    );

    /**
     * 批量更新AI分类
     */
    int batchUpdateAiClassification(@Param("classifications") List<Map<String, Object>> classifications);

    /**
     * 根据AI分类获取通知
     */
    List<Notification> selectByAiClassification(
            @Param("userId") Long userId,
            @Param("aiClassification") String aiClassification,
            @Param("isRead") Integer isRead,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    /**
     * 获取重要通知
     */
    List<Notification> selectImportantNotifications(
            @Param("userId") Long userId,
            @Param("isRead") Integer isRead,
            @Param("offset") int offset,
            @Param("limit") int limit
    );

    // ==================== 邮件/推送功能 ====================

    /**
     * 标记邮件已发送
     */
    int markEmailSent(@Param("id") Long id);

    /**
     * 标记推送已发送
     */
    int markPushSent(@Param("id") Long id);

    /**
     * 获取需要发送邮件的通知
     */
    List<Notification> selectPendingEmailNotifications(@Param("limit") int limit);

    /**
     * 获取需要发送推送的通知
     */
    List<Notification> selectPendingPushNotifications(@Param("limit") int limit);
}