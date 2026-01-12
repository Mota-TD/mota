package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AIBudgetConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * AI预算配置Mapper
 */
@Mapper
public interface AIBudgetConfigMapper extends BaseMapper<AIBudgetConfig> {

    /**
     * 查询租户的所有预算配置
     */
    @Select("SELECT * FROM ai_budget_config WHERE tenant_id = #{tenantId} AND deleted = 0")
    List<AIBudgetConfig> selectByTenant(@Param("tenantId") Long tenantId);

    /**
     * 查询租户的启用预算配置
     */
    @Select("SELECT * FROM ai_budget_config WHERE tenant_id = #{tenantId} AND is_enabled = 1 AND deleted = 0")
    List<AIBudgetConfig> selectEnabledByTenant(@Param("tenantId") Long tenantId);

    /**
     * 按预算类型查询
     */
    @Select("SELECT * FROM ai_budget_config WHERE tenant_id = #{tenantId} AND budget_type = #{budgetType} AND is_enabled = 1 AND deleted = 0 LIMIT 1")
    AIBudgetConfig selectByType(@Param("tenantId") Long tenantId, @Param("budgetType") String budgetType);

    /**
     * 查询需要预警的预算
     */
    @Select("SELECT * FROM ai_budget_config WHERE is_enabled = 1 AND alert_enabled = 1 AND deleted = 0 " +
            "AND (used_amount / budget_amount * 100 >= alert_threshold OR used_tokens / token_budget * 100 >= alert_threshold)")
    List<AIBudgetConfig> selectNeedAlert();

    /**
     * 查询租户需要预警的预算
     */
    @Select("SELECT * FROM ai_budget_config WHERE tenant_id = #{tenantId} AND is_enabled = 1 AND alert_enabled = 1 AND deleted = 0 " +
            "AND (used_amount / budget_amount * 100 >= alert_threshold OR used_tokens / token_budget * 100 >= alert_threshold)")
    List<AIBudgetConfig> selectNeedingAlert(@Param("tenantId") Long tenantId);
}