package com.mota.search.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.search.entity.SearchHotword;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 搜索热词Mapper
 * 
 * @author mota
 */
@Mapper
public interface SearchHotwordMapper extends BaseMapper<SearchHotword> {

    /**
     * 获取推荐热词
     */
    @Select("SELECT * FROM search_hotword " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND recommended = true " +
            "ORDER BY sort_order ASC, hot_score DESC LIMIT #{limit}")
    List<SearchHotword> selectRecommendedHotwords(@Param("tenantId") Long tenantId,
                                                   @Param("limit") int limit);

    /**
     * 获取热门搜索词
     */
    @Select("SELECT * FROM search_hotword " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND period = #{period} " +
            "ORDER BY hot_score DESC LIMIT #{limit}")
    List<SearchHotword> selectTopHotwords(@Param("tenantId") Long tenantId,
                                           @Param("period") String period,
                                           @Param("limit") int limit);

    /**
     * 根据关键词查找热词
     */
    @Select("SELECT * FROM search_hotword " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "AND keyword = #{keyword} AND period = #{period}")
    SearchHotword selectByKeyword(@Param("tenantId") Long tenantId,
                                   @Param("keyword") String keyword,
                                   @Param("period") String period);
    
    /**
     * 获取所有热词
     */
    @Select("SELECT * FROM search_hotword " +
            "WHERE (tenant_id = #{tenantId} OR tenant_id IS NULL) " +
            "ORDER BY hot_score DESC")
    List<SearchHotword> selectAll(@Param("tenantId") Long tenantId);
}