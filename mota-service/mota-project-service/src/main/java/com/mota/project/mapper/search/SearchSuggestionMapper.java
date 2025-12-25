package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchSuggestion;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 搜索建议Mapper
 */
@Mapper
public interface SearchSuggestionMapper extends BaseMapper<SearchSuggestion> {
    
    /**
     * 根据前缀查询建议
     */
    @Select("SELECT * FROM search_suggestion WHERE suggestion_text LIKE CONCAT(#{prefix}, '%') " +
            "AND is_active = true ORDER BY frequency DESC, score DESC LIMIT #{limit}")
    List<SearchSuggestion> findByPrefix(@Param("prefix") String prefix, @Param("limit") int limit);
    
    /**
     * 根据类型查询建议
     */
    @Select("SELECT * FROM search_suggestion WHERE suggestion_type = #{type} " +
            "AND is_active = true ORDER BY frequency DESC LIMIT #{limit}")
    List<SearchSuggestion> findByType(@Param("type") String type, @Param("limit") int limit);
    
    /**
     * 更新使用频率
     */
    @Update("UPDATE search_suggestion SET frequency = frequency + 1 WHERE id = #{id}")
    void incrementFrequency(@Param("id") Long id);
}