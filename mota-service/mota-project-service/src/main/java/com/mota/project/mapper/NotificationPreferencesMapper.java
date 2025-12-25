package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.NotificationPreferences;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 通知偏好设置Mapper
 */
@Mapper
public interface NotificationPreferencesMapper extends BaseMapper<NotificationPreferences> {

    /**
     * 根据用户ID获取偏好设置
     */
    NotificationPreferences selectByUserId(@Param("userId") Long userId);

    /**
     * 插入或更新设置
     */
    int insertOrUpdate(NotificationPreferences preferences);

    /**
     * 更新聚合设置
     */
    int updateAggregationSettings(
            @Param("userId") Long userId,
            @Param("enableAggregation") Boolean enableAggregation,
            @Param("aggregationInterval") Integer aggregationInterval);

    /**
     * 更新AI分类设置
     */
    int updateAiClassificationSettings(
            @Param("userId") Long userId,
            @Param("enableAiClassification") Boolean enableAiClassification,
            @Param("autoCollapseThreshold") Integer autoCollapseThreshold);

    /**
     * 更新置顶设置
     */
    int updatePinSettings(
            @Param("userId") Long userId,
            @Param("autoPinUrgent") Boolean autoPinUrgent,
            @Param("autoPinMentions") Boolean autoPinMentions);

    /**
     * 更新显示设置
     */
    int updateDisplaySettings(
            @Param("userId") Long userId,
            @Param("showLowPriorityCollapsed") Boolean showLowPriorityCollapsed,
            @Param("maxVisibleNotifications") Integer maxVisibleNotifications);

    /**
     * 更新邮件摘要设置
     */
    int updateEmailDigestSettings(
            @Param("userId") Long userId,
            @Param("emailDigestEnabled") Boolean emailDigestEnabled,
            @Param("emailDigestFrequency") String emailDigestFrequency,
            @Param("emailDigestTime") String emailDigestTime);
}