package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchCompletion;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 搜索补全Mapper
 */
@Mapper
public interface SearchCompletionMapper extends BaseMapper<SearchCompletion> {
    
    /**
     * 根据前缀查询补全建议
     */
    @Select("SELECT * FROM search_completion WHERE prefix LIKE CONCAT(#{prefix}, '%') " +
            "AND is_active = true ORDER BY weight DESC, frequency DESC LIMIT #{limit}")
    List<SearchCompletion> findByPrefix(@Param("prefix") String prefix, @Param("limit") int limit);
    
    /**
     * 根据补全类型查询
     */
    @Select("SELECT * FROM search_completion WHERE completion_type = #{type} " +
            "AND is_active = true ORDER BY weight DESC LIMIT #{limit}")
    List<SearchCompletion> findByType(@Param("type") String type, @Param("limit") int limit);
    
    /**
     * 更新使用频率
     */
    @Update("UPDATE search_completion SET frequency = frequency + 1 WHERE id = #{id}")
    void incrementFrequency(@Param("id") Long id);
}