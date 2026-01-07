package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.CalendarSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 日历订阅Mapper
 */
@Mapper
public interface CalendarSubscriptionMapper extends BaseMapper<CalendarSubscription> {
    
    /**
     * 获取用户的所有订阅
     */
    @Select("SELECT * FROM calendar_subscription WHERE user_id = #{userId} AND deleted = 0 ORDER BY created_at DESC")
    List<CalendarSubscription> findByUserId(@Param("userId") Long userId);
    
    /**
     * 获取需要同步的订阅（同步状态为pending或超过同步频率）
     */
    @Select("SELECT * FROM calendar_subscription WHERE deleted = 0 " +
            "AND (sync_status = 'pending' OR (last_sync_at IS NULL OR TIMESTAMPDIFF(MINUTE, last_sync_at, NOW()) >= sync_frequency))")
    List<CalendarSubscription> findNeedSync();
}