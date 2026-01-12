package com.mota.tenant.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.tenant.entity.TenantPackage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 租户套餐Mapper接口
 * 
 * @author mota
 */
@Mapper
public interface TenantPackageMapper extends BaseMapper<TenantPackage> {

    /**
     * 根据套餐编码查询套餐
     */
    @Select("SELECT * FROM sys_tenant_package WHERE package_code = #{packageCode} AND deleted = 0")
    TenantPackage selectByPackageCode(@Param("packageCode") String packageCode);

    /**
     * 查询所有启用的套餐
     */
    @Select("SELECT * FROM sys_tenant_package WHERE status = 1 AND deleted = 0 ORDER BY sort_order ASC")
    List<TenantPackage> selectEnabledPackages();

    /**
     * 查询推荐套餐
     */
    @Select("SELECT * FROM sys_tenant_package WHERE status = 1 AND recommended = 1 AND deleted = 0 ORDER BY sort_order ASC")
    List<TenantPackage> selectRecommendedPackages();
}