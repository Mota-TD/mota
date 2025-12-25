package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchRelatedQuery;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 相关搜索Mapper
 */
@Mapper
public interface SearchRelatedQueryMapper extends BaseMapper<SearchRelatedQuery> {
    
    /**
     * 根据源查询词查询相关搜索
     */
    @Select("SELECT * FROM search_related_query WHERE source_query = #{sourceQuery} " +
            "AND is_active = true ORDER BY relevance_score DESC LIMIT #{limit}")
    List<SearchRelatedQuery> findBySourceQuery(@Param("sourceQuery") String sourceQuery, @Param("limit") int limit);
    
    /**
     * 模糊查询相关搜索
     */
    @Select("SELECT * FROM search_related_query WHERE source_query LIKE CONCAT('%', #{query}, '%') " +
            "AND is_active = true ORDER BY relevance_score DESC LIMIT #{limit}")
    List<SearchRelatedQuery> findSimilarQueries(@Param("query") String query, @Param("limit") int limit);
    
    /**
     * 根据关系类型查询
     */
    @Select("SELECT * FROM search_related_query WHERE relation_type = #{relationType} " +
            "AND is_active = true ORDER BY relevance_score DESC LIMIT #{limit}")
    List<SearchRelatedQuery> findByRelationType(@Param("relationType") String relationType, @Param("limit") int limit);
    
    /**
     * 更新点击次数
     */
    @Update("UPDATE search_related_query SET click_count = click_count + 1 WHERE id = #{id}")
    void incrementClickCount(@Param("id") Long id);
}