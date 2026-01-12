package com.mota.search.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.search.entity.SearchHistory;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 搜索历史Mapper
 * 
 * @author mota
 */
@Mapper
public interface SearchHistoryMapper extends BaseMapper<SearchHistory> {

    /**
     * 获取用户最近搜索记录
     */
    @Select("SELECT DISTINCT keyword FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} " +
            "ORDER BY created_at DESC LIMIT #{limit}")
    List<String> selectRecentKeywords(@Param("tenantId") Long tenantId,
                                       @Param("userId") Long userId,
                                       @Param("limit") int limit);

    /**
     * 统计关键词搜索次数
     */
    @Select("SELECT keyword, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime} " +
            "GROUP BY keyword ORDER BY count DESC LIMIT #{limit}")
    List<Map<String, Object>> selectKeywordStats(@Param("tenantId") Long tenantId,
                                                  @Param("startTime") LocalDateTime startTime,
                                                  @Param("endTime") LocalDateTime endTime,
                                                  @Param("limit") int limit);

    /**
     * 统计搜索类型分布
     */
    @Select("SELECT search_type, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime} " +
            "GROUP BY search_type")
    List<Map<String, Object>> selectTypeDistribution(@Param("tenantId") Long tenantId,
                                                      @Param("startTime") LocalDateTime startTime,
                                                      @Param("endTime") LocalDateTime endTime);

    /**
     * 统计搜索趋势（按天）
     */
    @Select("SELECT DATE(created_at) as date, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime} " +
            "GROUP BY DATE(created_at) ORDER BY date")
    List<Map<String, Object>> selectDailyTrend(@Param("tenantId") Long tenantId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);

    /**
     * 统计点击率
     */
    @Select("SELECT " +
            "COUNT(*) as total_searches, " +
            "SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END) as clicked_searches, " +
            "AVG(CASE WHEN clicked = true THEN click_position ELSE NULL END) as avg_click_position " +
            "FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime}")
    Map<String, Object> selectClickStats(@Param("tenantId") Long tenantId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    /**
     * 统计平均搜索耗时
     */
    @Select("SELECT AVG(duration) as avg_duration FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime}")
    Double selectAvgDuration(@Param("tenantId") Long tenantId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);

    /**
     * 统计无结果搜索
     */
    @Select("SELECT keyword, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND result_count = 0 " +
            "AND created_at >= #{startTime} AND created_at <= #{endTime} " +
            "GROUP BY keyword ORDER BY count DESC LIMIT #{limit}")
    List<Map<String, Object>> selectNoResultKeywords(@Param("tenantId") Long tenantId,
                                                      @Param("startTime") LocalDateTime startTime,
                                                      @Param("endTime") LocalDateTime endTime,
                                                      @Param("limit") int limit);
    
    // ========== 统计服务需要的方法 ==========
    
    /**
     * 按日期范围统计搜索次数
     */
    @Select("SELECT COUNT(*) FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Long countByDateRange(@Param("tenantId") Long tenantId,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);
    
    /**
     * 统计唯一用户数
     */
    @Select("SELECT COUNT(DISTINCT user_id) FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Long countUniqueUsers(@Param("tenantId") Long tenantId,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);
    
    /**
     * 统计零结果搜索次数
     */
    @Select("SELECT COUNT(*) FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND result_count = 0 " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Long countZeroResultSearches(@Param("tenantId") Long tenantId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);
    
    /**
     * 统计有点击的搜索次数
     */
    @Select("SELECT COUNT(*) FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND clicked = true " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Long countClickedSearches(@Param("tenantId") Long tenantId,
                               @Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);
    
    /**
     * 平均响应时间
     */
    @Select("SELECT AVG(duration) FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Double avgResponseTime(@Param("tenantId") Long tenantId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);
    
    /**
     * 获取每日统计
     */
    @Select("SELECT DATE(created_at) as date, COUNT(*) as count, " +
            "SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END) as clicked_count " +
            "FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY DATE(created_at) ORDER BY date")
    List<Map<String, Object>> getDailyStats(@Param("tenantId") Long tenantId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);
    
    /**
     * 获取类型分布
     */
    @Select("SELECT search_type as type, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY search_type")
    List<Map<String, Object>> getTypeDistribution(@Param("tenantId") Long tenantId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    /**
     * 获取热门关键词
     */
    @Select("SELECT keyword, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY keyword ORDER BY count DESC LIMIT #{limit}")
    List<Map<String, Object>> getTopKeywords(@Param("tenantId") Long tenantId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate,
                                              @Param("limit") int limit);
    
    /**
     * 获取零结果关键词
     */
    @Select("SELECT keyword, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND result_count = 0 " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY keyword ORDER BY count DESC LIMIT #{limit}")
    List<Map<String, Object>> getZeroResultKeywords(@Param("tenantId") Long tenantId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate,
                                                     @Param("limit") int limit);
    
    /**
     * 获取点击位置统计
     */
    @Select("SELECT click_position as position, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND clicked = true " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY click_position ORDER BY position")
    List<Map<String, Object>> getClickPositionStats(@Param("tenantId") Long tenantId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
    
    /**
     * 平均点击位置
     */
    @Select("SELECT AVG(click_position) FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND clicked = true " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Double avgClickPosition(@Param("tenantId") Long tenantId,
                            @Param("startDate") LocalDate startDate,
                            @Param("endDate") LocalDate endDate);
    
    /**
     * 按用户和日期范围统计
     */
    @Select("SELECT COUNT(*) FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Long countByUserAndDateRange(@Param("tenantId") Long tenantId,
                                  @Param("userId") Long userId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);
    
    /**
     * 获取用户热门关键词
     */
    @Select("SELECT keyword, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY keyword ORDER BY count DESC LIMIT #{limit}")
    List<Map<String, Object>> getUserTopKeywords(@Param("tenantId") Long tenantId,
                                                  @Param("userId") Long userId,
                                                  @Param("startDate") LocalDate startDate,
                                                  @Param("endDate") LocalDate endDate,
                                                  @Param("limit") int limit);
    
    /**
     * 获取用户类型偏好
     */
    @Select("SELECT search_type as type, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY search_type ORDER BY count DESC")
    List<Map<String, Object>> getUserTypePreference(@Param("tenantId") Long tenantId,
                                                     @Param("userId") Long userId,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);
    
    /**
     * 统计用户点击搜索次数
     */
    @Select("SELECT COUNT(*) FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} AND clicked = true " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate}")
    Long countUserClickedSearches(@Param("tenantId") Long tenantId,
                                   @Param("userId") Long userId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
    
    /**
     * 获取用户小时分布
     */
    @Select("SELECT HOUR(created_at) as hour, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY HOUR(created_at) ORDER BY hour")
    List<Map<String, Object>> getUserHourlyDistribution(@Param("tenantId") Long tenantId,
                                                         @Param("userId") Long userId,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);
    
    /**
     * 获取搜索模式分布
     */
    @Select("SELECT search_mode as mode, COUNT(*) as count FROM search_history " +
            "WHERE tenant_id = #{tenantId} " +
            "AND DATE(created_at) >= #{startDate} AND DATE(created_at) <= #{endDate} " +
            "GROUP BY search_mode")
    List<Map<String, Object>> getModeDistribution(@Param("tenantId") Long tenantId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    /**
     * 获取用户最近搜索记录
     */
    @Select("SELECT * FROM search_history " +
            "WHERE tenant_id = #{tenantId} AND user_id = #{userId} " +
            "ORDER BY created_at DESC LIMIT #{limit}")
    List<SearchHistory> selectRecentByUser(@Param("tenantId") Long tenantId,
                                            @Param("userId") Long userId,
                                            @Param("limit") int limit);
    
    /**
     * 删除用户搜索历史
     */
    @Delete("DELETE FROM search_history WHERE tenant_id = #{tenantId} AND user_id = #{userId}")
    int deleteByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);
    
    /**
     * 删除用户指定关键词的搜索历史
     */
    @Delete("DELETE FROM search_history WHERE tenant_id = #{tenantId} AND user_id = #{userId} AND keyword = #{keyword}")
    int deleteByUserAndKeyword(@Param("tenantId") Long tenantId,
                                @Param("userId") Long userId,
                                @Param("keyword") String keyword);
}