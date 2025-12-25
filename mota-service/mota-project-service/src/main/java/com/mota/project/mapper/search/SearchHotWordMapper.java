package com.mota.project.mapper.search;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.search.SearchHotWord;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 搜索热词Mapper
 */
@Mapper
public interface SearchHotWordMapper extends BaseMapper<SearchHotWord> {
    
    /**
     * 查询热门搜索词
     */
    @Select("SELECT * FROM search_hot_word WHERE period_type = #{periodType} AND period_date = #{periodDate} " +
            "ORDER BY search_count DESC LIMIT #{limit}")
    List<SearchHotWord> findTopHotWords(@Param("periodType") String periodType, 
                                         @Param("periodDate") LocalDate periodDate,
                                         @Param("limit") int limit);
    
    /**
     * 根据前缀查询热词
     */
    @Select("SELECT * FROM search_hot_word WHERE word LIKE CONCAT(#{prefix}, '%') " +
            "AND period_type = 'daily' ORDER BY search_count DESC LIMIT #{limit}")
    List<SearchHotWord> findByPrefix(@Param("prefix") String prefix, @Param("limit") int limit);
    
    /**
     * 根据词和周期查询
     */
    @Select("SELECT * FROM search_hot_word WHERE word = #{word} AND period_type = #{periodType} AND period_date = #{periodDate}")
    SearchHotWord findByWordAndPeriod(@Param("word") String word, 
                                       @Param("periodType") String periodType,
                                       @Param("periodDate") LocalDate periodDate);
    
    /**
     * 更新搜索次数
     */
    @Update("UPDATE search_hot_word SET search_count = search_count + 1 WHERE id = #{id}")
    void incrementSearchCount(@Param("id") Long id);
    
    /**
     * 查询趋势热词
     */
    @Select("SELECT * FROM search_hot_word WHERE is_trending = true AND period_type = #{periodType} " +
            "ORDER BY trend_score DESC LIMIT #{limit}")
    List<SearchHotWord> findTrendingWords(@Param("periodType") String periodType, @Param("limit") int limit);
}