package com.mota.notify.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.notify.entity.NotificationSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通知订阅Mapper
 */
@Mapper
public interface NotificationSubscriptionMapper extends BaseMapper<NotificationSubscription> {

    /**
     * 查询用户的订阅列表
     */
    List<NotificationSubscription> selectByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    /**
     * 查询用户指定类型的订阅
     */
    NotificationSubscription selectByUserAndType(@Param("tenantId") Long tenantId,
                                                  @Param("userId") Long userId,
                                                  @Param("subscribeType") String subscribeType,
                                                  @Param("channel") String channel);

    /**
     * 查询用户指定业务的订阅
     */
    NotificationSubscription selectByUserAndBiz(@Param("tenantId") Long tenantId,
                                                 @Param("userId") Long userId,
                                                 @Param("bizType") String bizType,
                                                 @Param("bizId") Long bizId,
                                                 @Param("channel") String channel);

    /**
     * 查询订阅了指定业务的用户列表
     */
    List<Long> selectSubscribedUsers(@Param("tenantId") Long tenantId,
                                     @Param("bizType") String bizType,
                                     @Param("bizId") Long bizId,
                                     @Param("channel") String channel);

    /**
     * 删除用户的所有订阅
     */
    int deleteByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);
}