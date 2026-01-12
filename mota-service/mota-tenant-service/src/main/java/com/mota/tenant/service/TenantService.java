package com.mota.tenant.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.tenant.dto.TenantCreateRequest;
import com.mota.tenant.dto.TenantVO;
import com.mota.tenant.entity.Tenant;

import java.util.List;

/**
 * 租户服务接口
 * 
 * @author mota
 */
public interface TenantService extends IService<Tenant> {

    /**
     * 创建租户
     *
     * @param request 创建请求
     * @return 租户ID
     */
    Long createTenant(TenantCreateRequest request);

    /**
     * 更新租户信息
     *
     * @param tenantId 租户ID
     * @param request 更新请求
     */
    void updateTenant(Long tenantId, TenantCreateRequest request);

    /**
     * 获取租户详情
     *
     * @param tenantId 租户ID
     * @return 租户详情
     */
    TenantVO getTenantDetail(Long tenantId);

    /**
     * 根据租户编码获取租户
     *
     * @param tenantCode 租户编码
     * @return 租户详情
     */
    TenantVO getTenantByCode(String tenantCode);

    /**
     * 分页查询租户
     *
     * @param page 页码
     * @param size 每页大小
     * @param tenantName 租户名称（模糊查询）
     * @param status 状态
     * @return 分页结果
     */
    IPage<TenantVO> pageTenants(int page, int size, String tenantName, Integer status);

    /**
     * 启用租户
     *
     * @param tenantId 租户ID
     */
    void enableTenant(Long tenantId);

    /**
     * 禁用租户
     *
     * @param tenantId 租户ID
     */
    void disableTenant(Long tenantId);

    /**
     * 激活租户（试用转正式）
     *
     * @param tenantId 租户ID
     * @param packageId 套餐ID
     * @param months 订阅月数
     */
    void activateTenant(Long tenantId, Long packageId, int months);

    /**
     * 续费租户
     *
     * @param tenantId 租户ID
     * @param months 续费月数
     */
    void renewTenant(Long tenantId, int months);

    /**
     * 升级套餐
     *
     * @param tenantId 租户ID
     * @param packageId 新套餐ID
     */
    void upgradePackage(Long tenantId, Long packageId);

    /**
     * 更新配额使用量
     *
     * @param tenantId 租户ID
     * @param userCount 用户数量
     * @param projectCount 项目数量
     * @param storageUsed 存储使用量
     */
    void updateQuotaUsage(Long tenantId, Integer userCount, Integer projectCount, Long storageUsed);

    /**
     * 增加AI调用次数
     *
     * @param tenantId 租户ID
     * @param count 调用次数
     */
    void incrementAiCallCount(Long tenantId, int count);

    /**
     * 检查配额是否超限
     *
     * @param tenantId 租户ID
     * @param quotaType 配额类型（user/project/storage/ai）
     * @return 是否超限
     */
    boolean checkQuotaExceeded(Long tenantId, String quotaType);

    /**
     * 获取即将过期的租户列表
     *
     * @param days 天数
     * @return 租户列表
     */
    List<TenantVO> getExpiringTenants(int days);

    /**
     * 处理过期租户
     */
    void processExpiredTenants();

    /**
     * 初始化租户数据
     *
     * @param tenantId 租户ID
     */
    void initializeTenantData(Long tenantId);

    /**
     * 验证租户数据隔离
     *
     * @param tenantId 租户ID
     * @return 是否通过验证
     */
    boolean validateDataIsolation(Long tenantId);
}