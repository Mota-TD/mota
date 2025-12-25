package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.SearchLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 搜索记录Mapper
 */
@Mapper
public interface SearchLogMapper extends BaseMapper<SearchLog> {

    /**
     * 获取搜索统计
     */
    Map<String, Object> getSearchStats(@Param("projectId") Long projectId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    /**
     * 获取搜索趋势
     */
    List<Map<String, Object>> getSearchTrend(@Param("projectId") Long projectId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    /**
     * 获取无结果搜索
     */
    List<Map<String, Object>> getNoResultSearches(@Param("projectId") Long projectId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate,
                                                   @Param("limit") Integer limit);

    /**
     * 获取搜索成功率
     */
    Double getSearchSuccessRate(@Param("projectId") Long projectId,
                                @Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);
}