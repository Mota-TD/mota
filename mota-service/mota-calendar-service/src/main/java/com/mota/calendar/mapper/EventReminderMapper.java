package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.EventReminder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 事件提醒Mapper
 */
@Mapper
public interface EventReminderMapper extends BaseMapper<EventReminder> {

    /**
     * 获取事件的所有提醒
     */
    @Select("SELECT * FROM event_reminder WHERE event_id = #{eventId} ORDER BY remind_time ASC")
    List<EventReminder> selectByEventId(@Param("eventId") Long eventId);

    /**
     * 获取待发送的提醒
     */
    @Select("""
        SELECT * FROM event_reminder 
        WHERE status = 'pending' 
        AND remind_time <= #{time}
        ORDER BY remind_time ASC
        LIMIT #{limit}
        """)
    List<EventReminder> selectPendingReminders(@Param("time") LocalDateTime time, @Param("limit") int limit);

    /**
     * 更新提醒状态
     */
    @Update("UPDATE event_reminder SET status = #{status}, sent_time = #{sentTime} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status, @Param("sentTime") LocalDateTime sentTime);

    /**
     * 删除事件的所有提醒
     */
    @Update("DELETE FROM event_reminder WHERE event_id = #{eventId}")
    int deleteByEventId(@Param("eventId") Long eventId);
}