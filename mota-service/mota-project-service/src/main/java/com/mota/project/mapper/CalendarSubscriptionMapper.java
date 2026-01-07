package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.CalendarSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 日历订阅Mapper接口
 */
@Mapper
public interface CalendarSubscriptionMapper extends BaseMapper<CalendarSubscription> {
    
    /**
     * 根据用户ID查询订阅列表
     */
    @Select("SELECT * FROM calendar_subscription WHERE user_id = #{userId} AND deleted = 0 ORDER BY created_at DESC")
    List<CalendarSubscription> selectByUserId(@Param("userId") Long userId);
    
    /**
     * 查询需要同步的订阅（同步状态为pending或超过同步频率）
     */
    @Select("SELECT * FROM calendar_subscription WHERE deleted = 0 " +
            "AND (sync_status = 'pending' OR (last_sync_at IS NULL OR TIMESTAMPDIFF(MINUTE, last_sync_at, NOW()) >= sync_frequency))")
    List<CalendarSubscription> selectNeedSync();
    
    /**
     * 更新同步状态
     */
    @Update("UPDATE calendar_subscription SET last_sync_at = NOW(), sync_status = #{syncStatus}, " +
            "sync_error = #{syncError}, updated_at = NOW() WHERE id = #{id}")
    int updateSyncStatus(@Param("id") Long id, @Param("syncStatus") String syncStatus, @Param("syncError") String syncError);
}