package com.mota.tenant.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.tenant.entity.TenantBilling;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

/**
 * 租户账单Mapper接口
 * 
 * @author mota
 */
@Mapper
public interface TenantBillingMapper extends BaseMapper<TenantBilling> {

    /**
     * 根据账单编号查询账单
     */
    @Select("SELECT * FROM sys_tenant_billing WHERE bill_no = #{billNo} AND deleted = 0")
    TenantBilling selectByBillNo(@Param("billNo") String billNo);

    /**
     * 查询租户的待支付账单
     */
    @Select("SELECT * FROM sys_tenant_billing WHERE tenant_id = #{tenantId} AND pay_status = 0 AND deleted = 0 ORDER BY create_time DESC")
    List<TenantBilling> selectPendingBills(@Param("tenantId") Long tenantId);

    /**
     * 统计租户的总消费金额
     */
    @Select("SELECT COALESCE(SUM(pay_amount), 0) FROM sys_tenant_billing WHERE tenant_id = #{tenantId} AND pay_status = 1 AND deleted = 0")
    BigDecimal sumTotalPayAmount(@Param("tenantId") Long tenantId);

    /**
     * 查询指定月份的账单
     */
    @Select("SELECT * FROM sys_tenant_billing WHERE tenant_id = #{tenantId} AND DATE_FORMAT(create_time, '%Y%m') = #{month} AND deleted = 0 ORDER BY create_time DESC")
    List<TenantBilling> selectByMonth(@Param("tenantId") Long tenantId, @Param("month") String month);
}