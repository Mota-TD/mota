package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SmartSearchLog;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 智能搜索日志Mapper
 */
@Mapper
public interface SmartSearchLogMapper extends BaseMapper<SmartSearchLog> {
    
    /**
     * 根据用户ID查询搜索历史
     */
    @Select("SELECT * FROM search_log WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT #{limit}")
    List<SmartSearchLog> findByUserId(@Param("userId") Long userId, @Param("limit") int limit);
    
    /**
     * 删除用户搜索历史
     */
    @Delete("DELETE FROM search_log WHERE user_id = #{userId}")
    void deleteByUserId(@Param("userId") Long userId);
    
    /**
     * 统计搜索次数
     */
    @Select("SELECT COUNT(*) FROM search_log WHERE query_text = #{query}")
    int countByQuery(@Param("query") String query);
}