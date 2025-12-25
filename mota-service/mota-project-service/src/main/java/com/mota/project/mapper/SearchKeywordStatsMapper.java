package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.SearchKeywordStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 搜索热词统计Mapper
 */
@Mapper
public interface SearchKeywordStatsMapper extends BaseMapper<SearchKeywordStats> {

    /**
     * 获取热门搜索词
     */
    List<SearchKeywordStats> getHotKeywords(@Param("projectId") Long projectId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             @Param("limit") Integer limit);

    /**
     * 获取搜索词趋势
     */
    List<Map<String, Object>> getKeywordTrend(@Param("keyword") String keyword,
                                               @Param("projectId") Long projectId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    /**
     * 更新或插入热词统计
     */
    void upsertKeywordStats(SearchKeywordStats stats);

    /**
     * 获取关键词云数据
     */
    List<Map<String, Object>> getKeywordCloud(@Param("projectId") Long projectId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate,
                                               @Param("limit") Integer limit);

    /**
     * 获取低点击率关键词（可能的知识缺口）
     */
    List<SearchKeywordStats> getLowClickRateKeywords(@Param("projectId") Long projectId,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate,
                                                      @Param("minSearchCount") Integer minSearchCount,
                                                      @Param("maxClickRate") Double maxClickRate,
                                                      @Param("limit") Integer limit);
}