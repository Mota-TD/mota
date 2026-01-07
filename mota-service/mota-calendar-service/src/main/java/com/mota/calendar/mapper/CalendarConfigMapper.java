package com.mota.calendar.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.calendar.entity.CalendarConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 日历配置Mapper
 * 用于管理用户的日历显示配置（视图设置、工作时间等）
 */
@Mapper
public interface CalendarConfigMapper extends BaseMapper<CalendarConfig> {
    
    /**
     * 获取用户的日历配置
     */
    @Select("SELECT * FROM calendar_config WHERE user_id = #{userId} LIMIT 1")
    CalendarConfig findByUserId(@Param("userId") Long userId);
    
    /**
     * 获取用户在指定企业的日历配置
     */
    @Select("SELECT * FROM calendar_config WHERE user_id = #{userId} AND enterprise_id = #{enterpriseId} LIMIT 1")
    CalendarConfig findByUserIdAndEnterpriseId(@Param("userId") Long userId, @Param("enterpriseId") Long enterpriseId);
}