package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.NotificationSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通知订阅Mapper
 */
@Mapper
public interface NotificationSubscriptionMapper extends BaseMapper<NotificationSubscription> {

    /**
     * 获取用户的所有订阅规则
     */
    List<NotificationSubscription> selectByUserId(@Param("userId") Long userId);

    /**
     * 获取用户对特定分类的订阅
     */
    NotificationSubscription selectByUserAndCategory(
            @Param("userId") Long userId,
            @Param("category") String category);

    /**
     * 获取用户对特定分类和类型的订阅
     */
    NotificationSubscription selectByUserCategoryAndType(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("type") String type);

    /**
     * 批量更新订阅状态
     */
    int batchUpdateEnabled(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("enabled") Boolean enabled);

    /**
     * 批量更新邮件通知状态
     */
    int batchUpdateEmailEnabled(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("emailEnabled") Boolean emailEnabled);

    /**
     * 批量更新推送通知状态
     */
    int batchUpdatePushEnabled(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("pushEnabled") Boolean pushEnabled);

    /**
     * 删除用户的所有订阅
     */
    int deleteByUserId(@Param("userId") Long userId);

    /**
     * 初始化用户默认订阅
     */
    int insertDefaultSubscriptions(@Param("userId") Long userId);
}