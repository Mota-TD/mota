package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AIUsageStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * AI使用统计Mapper
 */
@Mapper
public interface AIUsageStatsMapper extends BaseMapper<AIUsageStats> {

    /**
     * 查询租户某日的使用统计
     */
    @Select("SELECT * FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date = #{statsDate}")
    List<AIUsageStats> selectByTenantAndDate(@Param("tenantId") Long tenantId, @Param("statsDate") LocalDate statsDate);

    /**
     * 查询用户某日的使用统计
     */
    @Select("SELECT * FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND user_id = #{userId} AND stats_date = #{statsDate}")
    List<AIUsageStats> selectByUserAndDate(@Param("tenantId") Long tenantId, @Param("userId") Long userId, @Param("statsDate") LocalDate statsDate);

    /**
     * 查询租户日期范围内的使用统计
     */
    @Select("SELECT * FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate} ORDER BY stats_date")
    List<AIUsageStats> selectByDateRange(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 按模型统计使用量
     */
    @Select("SELECT model_name, SUM(request_count) as total_requests, SUM(total_tokens) as total_tokens, SUM(cost) as total_cost " +
            "FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY model_name ORDER BY total_requests DESC")
    List<Map<String, Object>> statsByModel(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 按用户统计使用量
     */
    @Select("SELECT user_id, SUM(request_count) as total_requests, SUM(total_tokens) as total_tokens, SUM(cost) as total_cost " +
            "FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY user_id ORDER BY total_cost DESC")
    List<Map<String, Object>> statsByUser(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 按日期统计使用量
     */
    @Select("SELECT stats_date, SUM(request_count) as total_requests, SUM(total_tokens) as total_tokens, SUM(cost) as total_cost " +
            "FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY stats_date ORDER BY stats_date")
    List<Map<String, Object>> statsByDate(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 获取租户总使用量
     */
    @Select("SELECT SUM(request_count) as total_requests, SUM(total_tokens) as total_tokens, SUM(cost) as total_cost " +
            "FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    Map<String, Object> getTotalUsage(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 按模型和日期查询
     */
    @Select("SELECT * FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND model_config_id = #{modelConfigId} AND stats_date = #{statsDate} LIMIT 1")
    AIUsageStats selectByModelAndDate(@Param("tenantId") Long tenantId, @Param("modelConfigId") Long modelConfigId, @Param("statsDate") LocalDate statsDate);

    /**
     * 按模型和日期范围查询
     */
    @Select("SELECT * FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND model_config_id = #{modelConfigId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    List<AIUsageStats> selectByModelAndDateRange(@Param("tenantId") Long tenantId, @Param("modelConfigId") Long modelConfigId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 按用户和日期范围查询
     */
    @Select("SELECT * FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND user_id = #{userId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    List<AIUsageStats> selectByUserAndDateRange(@Param("tenantId") Long tenantId, @Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 统计请求总数
     */
    @Select("SELECT SUM(request_count) FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    Long sumRequestCount(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 统计输入Token总数
     */
    @Select("SELECT SUM(input_tokens) FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    Long sumInputTokens(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 统计输出Token总数
     */
    @Select("SELECT SUM(output_tokens) FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    Long sumOutputTokens(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * 统计费用总数
     */
    @Select("SELECT SUM(cost) FROM ai_usage_stats WHERE tenant_id = #{tenantId} AND stats_date BETWEEN #{startDate} AND #{endDate}")
    java.math.BigDecimal sumCost(@Param("tenantId") Long tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}