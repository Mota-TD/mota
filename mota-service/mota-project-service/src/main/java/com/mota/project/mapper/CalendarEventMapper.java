package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.CalendarEvent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历事件Mapper
 */
@Mapper
public interface CalendarEventMapper extends BaseMapper<CalendarEvent> {
    
    /**
     * 根据用户ID查询事件列表
     */
    List<CalendarEvent> selectByUserId(@Param("userId") Long userId,
                                        @Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * 根据项目ID查询事件列表
     */
    List<CalendarEvent> selectByProjectId(@Param("projectId") Long projectId,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查询用户在指定时间范围内的所有事件(包括参与的事件)
     */
    List<CalendarEvent> selectUserEventsInRange(@Param("userId") Long userId,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查询事件详情(包含参与者信息)
     */
    CalendarEvent selectWithAttendees(@Param("id") Long id);
    
    /**
     * 查询即将到来的事件(用于提醒)
     */
    List<CalendarEvent> selectUpcomingEvents(@Param("userId") Long userId,
                                              @Param("minutes") Integer minutes);
    
    /**
     * 根据任务ID查询关联事件
     */
    List<CalendarEvent> selectByTaskId(@Param("taskId") Long taskId);
    
    /**
     * 根据里程碑ID查询关联事件
     */
    List<CalendarEvent> selectByMilestoneId(@Param("milestoneId") Long milestoneId);
    
    /**
     * 批量删除事件
     */
    int deleteByIds(@Param("ids") List<Long> ids);
    
    /**
     * 取消事件
     */
    int cancelEvent(@Param("id") Long id);
}