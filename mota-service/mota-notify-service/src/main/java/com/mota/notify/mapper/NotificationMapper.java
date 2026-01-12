package com.mota.notify.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.notify.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通知Mapper
 */
@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {

    /**
     * 查询用户未读通知数量
     */
    Long countUnread(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 查询用户未读通知数量（按类型）
     */
    Long countUnreadByType(@Param("tenantId") Long tenantId, @Param("userId") Long userId, @Param("type") String type);

    /**
     * 批量标记已读
     */
    int batchMarkRead(@Param("tenantId") Long tenantId, @Param("userId") Long userId, @Param("ids") List<Long> ids);

    /**
     * 标记全部已读
     */
    int markAllRead(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 标记指定类型全部已读
     */
    int markAllReadByType(@Param("tenantId") Long tenantId, @Param("userId") Long userId, @Param("type") String type);

    /**
     * 查询用户通知列表
     */
    List<Notification> selectByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId,
                                    @Param("type") String type, @Param("isRead") Integer isRead);

    /**
     * 查询待发送的通知
     */
    List<Notification> selectPendingSend(@Param("channel") String channel, @Param("limit") int limit);

    /**
     * 查询需要重试的通知
     */
    List<Notification> selectNeedRetry(@Param("maxRetry") int maxRetry, @Param("limit") int limit);

    /**
     * 查询可聚合的通知
     */
    List<Notification> selectForAggregation(@Param("tenantId") Long tenantId, @Param("userId") Long userId,
                                            @Param("type") String type, @Param("since") LocalDateTime since);

    /**
     * 删除过期通知
     */
    int deleteExpired(@Param("before") LocalDateTime before);

    /**
     * 归档旧通知
     */
    int archiveOld(@Param("before") LocalDateTime before);
}