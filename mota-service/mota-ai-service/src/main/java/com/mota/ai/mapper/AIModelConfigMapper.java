package com.mota.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.ai.entity.AIModelConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * AI模型配置Mapper
 */
@Mapper
public interface AIModelConfigMapper extends BaseMapper<AIModelConfig> {

    /**
     * 查询租户的所有启用模型
     */
    @Select("SELECT * FROM ai_model_config WHERE tenant_id = #{tenantId} AND is_enabled = 1 AND deleted = 0 ORDER BY priority ASC")
    List<AIModelConfig> selectEnabledByTenant(@Param("tenantId") Long tenantId);

    /**
     * 查询租户的默认模型
     */
    @Select("SELECT * FROM ai_model_config WHERE tenant_id = #{tenantId} AND is_default = 1 AND is_enabled = 1 AND deleted = 0 LIMIT 1")
    AIModelConfig selectDefaultByTenant(@Param("tenantId") Long tenantId);

    /**
     * 按提供商查询模型
     */
    @Select("SELECT * FROM ai_model_config WHERE tenant_id = #{tenantId} AND provider = #{provider} AND is_enabled = 1 AND deleted = 0")
    List<AIModelConfig> selectByProvider(@Param("tenantId") Long tenantId, @Param("provider") String provider);

    /**
     * 按模型类型查询
     */
    @Select("SELECT * FROM ai_model_config WHERE tenant_id = #{tenantId} AND model_type = #{modelType} AND is_enabled = 1 AND deleted = 0 ORDER BY priority ASC")
    List<AIModelConfig> selectByModelType(@Param("tenantId") Long tenantId, @Param("modelType") String modelType);

    /**
     * 查询健康的模型
     */
    @Select("SELECT * FROM ai_model_config WHERE tenant_id = #{tenantId} AND health_status = 'healthy' AND is_enabled = 1 AND deleted = 0 ORDER BY priority ASC")
    List<AIModelConfig> selectHealthyModels(@Param("tenantId") Long tenantId);
}