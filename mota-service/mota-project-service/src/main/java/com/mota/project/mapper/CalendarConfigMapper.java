package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.CalendarConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 日历配置Mapper接口
 */
@Mapper
public interface CalendarConfigMapper extends BaseMapper<CalendarConfig> {
    
    /**
     * 根据用户ID查询日历配置列表
     */
    @Select("SELECT * FROM calendar_config WHERE user_id = #{userId} ORDER BY is_default DESC, created_at ASC")
    List<CalendarConfig> selectByUserId(@Param("userId") Long userId);
    
    /**
     * 查询用户的默认日历配置
     */
    @Select("SELECT * FROM calendar_config WHERE user_id = #{userId} AND is_default = true LIMIT 1")
    CalendarConfig selectDefaultByUserId(@Param("userId") Long userId);
}