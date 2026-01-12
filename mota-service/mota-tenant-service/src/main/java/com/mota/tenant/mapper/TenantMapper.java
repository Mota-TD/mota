package com.mota.tenant.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.tenant.entity.Tenant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 租户Mapper接口
 * 
 * @author mota
 */
@Mapper
public interface TenantMapper extends BaseMapper<Tenant> {

    /**
     * 根据租户编码查询租户
     */
    @Select("SELECT * FROM sys_tenant WHERE tenant_code = #{tenantCode} AND deleted = 0")
    Tenant selectByTenantCode(@Param("tenantCode") String tenantCode);

    /**
     * 根据自定义域名查询租户
     */
    @Select("SELECT * FROM sys_tenant WHERE custom_domain = #{domain} AND deleted = 0")
    Tenant selectByCustomDomain(@Param("domain") String domain);

    /**
     * 查询即将过期的租户（指定天数内）
     */
    @Select("SELECT * FROM sys_tenant WHERE status = 1 AND end_date <= DATE_ADD(CURDATE(), INTERVAL #{days} DAY) AND deleted = 0")
    List<Tenant> selectExpiringTenants(@Param("days") int days);

    /**
     * 查询已过期的租户
     */
    @Select("SELECT * FROM sys_tenant WHERE status = 1 AND end_date < CURDATE() AND deleted = 0")
    List<Tenant> selectExpiredTenants();

    /**
     * 查询试用即将结束的租户
     */
    @Select("SELECT * FROM sys_tenant WHERE status = 0 AND trial_end_date <= DATE_ADD(CURDATE(), INTERVAL #{days} DAY) AND deleted = 0")
    List<Tenant> selectTrialExpiringTenants(@Param("days") int days);
}