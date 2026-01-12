package com.mota.tenant.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.tenant.entity.TenantQuotaUsage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 租户配额使用Mapper接口
 * 
 * @author mota
 */
@Mapper
public interface TenantQuotaUsageMapper extends BaseMapper<TenantQuotaUsage> {

    /**
     * 查询租户指定日期的使用记录
     */
    @Select("SELECT * FROM sys_tenant_quota_usage WHERE tenant_id = #{tenantId} AND stat_date = #{statDate}")
    TenantQuotaUsage selectByTenantAndDate(@Param("tenantId") Long tenantId, @Param("statDate") LocalDate statDate);

    /**
     * 查询租户指定月份的使用记录
     */
    @Select("SELECT * FROM sys_tenant_quota_usage WHERE tenant_id = #{tenantId} AND stat_month = #{statMonth} ORDER BY stat_date ASC")
    List<TenantQuotaUsage> selectByTenantAndMonth(@Param("tenantId") Long tenantId, @Param("statMonth") String statMonth);

    /**
     * 查询租户最近N天的使用记录
     */
    @Select("SELECT * FROM sys_tenant_quota_usage WHERE tenant_id = #{tenantId} AND stat_date >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) ORDER BY stat_date ASC")
    List<TenantQuotaUsage> selectRecentDays(@Param("tenantId") Long tenantId, @Param("days") int days);

    /**
     * 统计租户当月AI调用总次数
     */
    @Select("SELECT COALESCE(SUM(ai_call_count), 0) FROM sys_tenant_quota_usage WHERE tenant_id = #{tenantId} AND stat_month = #{statMonth}")
    Integer sumMonthlyAiCallCount(@Param("tenantId") Long tenantId, @Param("statMonth") String statMonth);
}