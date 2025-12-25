package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchLog;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 搜索日志Mapper
 */
@Mapper
public interface SearchLogMapper extends BaseMapper<SearchLog> {
    
    /**
     * 根据用户ID查询搜索历史
     */
    @Select("SELECT * FROM search_log WHERE user_id = #{userId} ORDER BY created_at DESC LIMIT #{limit}")
    List<SearchLog> findByUserId(@Param("userId") Long userId, @Param("limit") int limit);
    
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