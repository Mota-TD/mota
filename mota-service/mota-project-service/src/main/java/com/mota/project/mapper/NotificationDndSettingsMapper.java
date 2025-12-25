package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.NotificationDndSettings;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

/**
 * 免打扰设置Mapper
 */
@Mapper
public interface NotificationDndSettingsMapper extends BaseMapper<NotificationDndSettings> {

    /**
     * 根据用户ID获取免打扰设置
     */
    NotificationDndSettings selectByUserId(@Param("userId") Long userId);

    /**
     * 更新定时免打扰设置
     */
    int updateScheduledDnd(
            @Param("userId") Long userId,
            @Param("enabled") Boolean enabled,
            @Param("startTime") String startTime,
            @Param("endTime") String endTime,
            @Param("weekdays") String weekdays,
            @Param("allowUrgent") Boolean allowUrgent,
            @Param("allowMentions") Boolean allowMentions);

    /**
     * 启用临时免打扰
     */
    int enableTempDnd(
            @Param("userId") Long userId,
            @Param("tempEndTime") LocalDateTime tempEndTime);

    /**
     * 关闭临时免打扰
     */
    int disableTempDnd(@Param("userId") Long userId);

    /**
     * 检查用户是否在免打扰时段
     */
    boolean checkDndActive(@Param("userId") Long userId);

    /**
     * 插入或更新设置
     */
    int insertOrUpdate(NotificationDndSettings settings);
}