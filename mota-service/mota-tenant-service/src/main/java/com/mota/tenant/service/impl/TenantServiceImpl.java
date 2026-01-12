package com.mota.tenant.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.tenant.dto.TenantCreateRequest;
import com.mota.tenant.dto.TenantVO;
import com.mota.tenant.entity.Tenant;
import com.mota.tenant.entity.TenantPackage;
import com.mota.tenant.mapper.TenantMapper;
import com.mota.tenant.mapper.TenantPackageMapper;
import com.mota.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 租户服务实现类
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TenantServiceImpl extends ServiceImpl<TenantMapper, Tenant> implements TenantService {

    private final TenantMapper tenantMapper;
    private final TenantPackageMapper packageMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createTenant(TenantCreateRequest request) {
        // 检查租户编码是否已存在
        Tenant existingTenant = tenantMapper.selectByTenantCode(request.getTenantCode());
        if (existingTenant != null) {
            throw new BusinessException("租户编码已存在");
        }

        // 创建租户
        Tenant tenant = new Tenant();
        BeanUtil.copyProperties(request, tenant);

        // 设置试用期
        LocalDate now = LocalDate.now();
        tenant.setTrialStartDate(now);
        tenant.setTrialEndDate(now.plusDays(request.getTrialDays()));
        tenant.setStatus(Tenant.Status.TRIAL.getCode());

        // 设置默认配额（如果有套餐则使用套餐配额）
        if (request.getPackageId() != null) {
            TenantPackage tenantPackage = packageMapper.selectById(request.getPackageId());
            if (tenantPackage != null) {
                tenant.setUserLimit(tenantPackage.getUserLimit());
                tenant.setStorageLimit(tenantPackage.getStorageLimit());
                tenant.setProjectLimit(tenantPackage.getProjectLimit());
                tenant.setAiCallLimit(tenantPackage.getAiCallLimit());
                tenant.setAiEnabled(tenantPackage.getAiEnabled());
                tenant.setKnowledgeEnabled(tenantPackage.getKnowledgeEnabled());
                tenant.setAdvancedReportEnabled(tenantPackage.getAdvancedReportEnabled());
            }
        } else {
            // 默认免费版配额
            tenant.setUserLimit(5);
            tenant.setStorageLimit(1024L); // 1GB
            tenant.setProjectLimit(3);
            tenant.setAiCallLimit(100);
            tenant.setAiEnabled(true);
            tenant.setKnowledgeEnabled(false);
            tenant.setAdvancedReportEnabled(false);
        }

        // 初始化使用量
        tenant.setUserCount(0);
        tenant.setProjectCount(0);
        tenant.setStorageUsed(0L);
        tenant.setAiCallCount(0);

        tenantMapper.insert(tenant);

        log.info("创建租户成功: tenantId={}, tenantCode={}", tenant.getId(), tenant.getTenantCode());

        return tenant.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTenant(Long tenantId, TenantCreateRequest request) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        // 检查租户编码是否被其他租户使用
        if (!tenant.getTenantCode().equals(request.getTenantCode())) {
            Tenant existingTenant = tenantMapper.selectByTenantCode(request.getTenantCode());
            if (existingTenant != null) {
                throw new BusinessException("租户编码已被使用");
            }
        }

        BeanUtil.copyProperties(request, tenant, "packageId", "trialDays");
        tenantMapper.updateById(tenant);

        log.info("更新租户成功: tenantId={}", tenantId);
    }

    @Override
    public TenantVO getTenantDetail(Long tenantId) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }
        return convertToVO(tenant);
    }

    @Override
    public TenantVO getTenantByCode(String tenantCode) {
        Tenant tenant = tenantMapper.selectByTenantCode(tenantCode);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }
        return convertToVO(tenant);
    }

    @Override
    public IPage<TenantVO> pageTenants(int page, int size, String tenantName, Integer status) {
        Page<Tenant> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Tenant> wrapper = new LambdaQueryWrapper<>();
        
        if (StrUtil.isNotBlank(tenantName)) {
            wrapper.like(Tenant::getTenantName, tenantName);
        }
        if (status != null) {
            wrapper.eq(Tenant::getStatus, status);
        }
        wrapper.orderByDesc(Tenant::getCreateTime);

        IPage<Tenant> tenantPage = tenantMapper.selectPage(pageParam, wrapper);
        
        return tenantPage.convert(this::convertToVO);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void enableTenant(Long tenantId) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }
        if (tenant.getStatus() != Tenant.Status.DISABLED.getCode()) {
            throw new BusinessException("只有已禁用的租户才能启用");
        }

        tenant.setStatus(Tenant.Status.ACTIVE.getCode());
        tenantMapper.updateById(tenant);

        log.info("启用租户成功: tenantId={}", tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void disableTenant(Long tenantId) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        tenant.setStatus(Tenant.Status.DISABLED.getCode());
        tenantMapper.updateById(tenant);

        log.info("禁用租户成功: tenantId={}", tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void activateTenant(Long tenantId, Long packageId, int months) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        TenantPackage tenantPackage = packageMapper.selectById(packageId);
        if (tenantPackage == null) {
            throw new BusinessException("套餐不存在");
        }

        // 更新租户状态和套餐
        LocalDate now = LocalDate.now();
        tenant.setStatus(Tenant.Status.ACTIVE.getCode());
        tenant.setPackageId(packageId);
        tenant.setStartDate(now);
        tenant.setEndDate(now.plusMonths(months));

        // 更新配额
        tenant.setUserLimit(tenantPackage.getUserLimit());
        tenant.setStorageLimit(tenantPackage.getStorageLimit());
        tenant.setProjectLimit(tenantPackage.getProjectLimit());
        tenant.setAiCallLimit(tenantPackage.getAiCallLimit());
        tenant.setAiEnabled(tenantPackage.getAiEnabled());
        tenant.setKnowledgeEnabled(tenantPackage.getKnowledgeEnabled());
        tenant.setAdvancedReportEnabled(tenantPackage.getAdvancedReportEnabled());

        tenantMapper.updateById(tenant);

        log.info("激活租户成功: tenantId={}, packageId={}, months={}", tenantId, packageId, months);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void renewTenant(Long tenantId, int months) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        LocalDate currentEndDate = tenant.getEndDate();
        LocalDate now = LocalDate.now();
        
        // 如果已过期，从今天开始计算；否则从当前结束日期开始计算
        LocalDate newEndDate;
        if (currentEndDate == null || currentEndDate.isBefore(now)) {
            tenant.setStartDate(now);
            newEndDate = now.plusMonths(months);
        } else {
            newEndDate = currentEndDate.plusMonths(months);
        }
        
        tenant.setEndDate(newEndDate);
        tenant.setStatus(Tenant.Status.ACTIVE.getCode());
        tenantMapper.updateById(tenant);

        log.info("续费租户成功: tenantId={}, months={}, newEndDate={}", tenantId, months, newEndDate);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void upgradePackage(Long tenantId, Long packageId) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        TenantPackage tenantPackage = packageMapper.selectById(packageId);
        if (tenantPackage == null) {
            throw new BusinessException("套餐不存在");
        }

        // 更新套餐和配额
        tenant.setPackageId(packageId);
        tenant.setUserLimit(tenantPackage.getUserLimit());
        tenant.setStorageLimit(tenantPackage.getStorageLimit());
        tenant.setProjectLimit(tenantPackage.getProjectLimit());
        tenant.setAiCallLimit(tenantPackage.getAiCallLimit());
        tenant.setAiEnabled(tenantPackage.getAiEnabled());
        tenant.setKnowledgeEnabled(tenantPackage.getKnowledgeEnabled());
        tenant.setAdvancedReportEnabled(tenantPackage.getAdvancedReportEnabled());

        tenantMapper.updateById(tenant);

        log.info("升级套餐成功: tenantId={}, packageId={}", tenantId, packageId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateQuotaUsage(Long tenantId, Integer userCount, Integer projectCount, Long storageUsed) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        if (userCount != null) {
            tenant.setUserCount(userCount);
        }
        if (projectCount != null) {
            tenant.setProjectCount(projectCount);
        }
        if (storageUsed != null) {
            tenant.setStorageUsed(storageUsed);
        }

        tenantMapper.updateById(tenant);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void incrementAiCallCount(Long tenantId, int count) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        tenant.setAiCallCount(tenant.getAiCallCount() + count);
        tenantMapper.updateById(tenant);
    }

    @Override
    public boolean checkQuotaExceeded(Long tenantId, String quotaType) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            return true;
        }

        return switch (quotaType) {
            case "user" -> tenant.getUserLimit() != -1 && tenant.getUserCount() >= tenant.getUserLimit();
            case "project" -> tenant.getProjectLimit() != -1 && tenant.getProjectCount() >= tenant.getProjectLimit();
            case "storage" -> tenant.getStorageLimit() != -1 && tenant.getStorageUsed() >= tenant.getStorageLimit();
            case "ai" -> tenant.getAiCallLimit() != -1 && tenant.getAiCallCount() >= tenant.getAiCallLimit();
            default -> false;
        };
    }

    @Override
    public List<TenantVO> getExpiringTenants(int days) {
        List<Tenant> tenants = tenantMapper.selectExpiringTenants(days);
        return tenants.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processExpiredTenants() {
        List<Tenant> expiredTenants = tenantMapper.selectExpiredTenants();
        for (Tenant tenant : expiredTenants) {
            tenant.setStatus(Tenant.Status.EXPIRED.getCode());
            tenantMapper.updateById(tenant);
            log.info("租户已过期: tenantId={}, tenantCode={}", tenant.getId(), tenant.getTenantCode());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void initializeTenantData(Long tenantId) {
        Tenant tenant = tenantMapper.selectById(tenantId);
        if (tenant == null) {
            throw new BusinessException("租户不存在");
        }

        // TODO: 初始化租户默认数据
        // 1. 创建默认部门
        // 2. 创建默认角色
        // 3. 创建管理员用户
        // 4. 创建示例项目

        log.info("初始化租户数据成功: tenantId={}", tenantId);
    }

    @Override
    public boolean validateDataIsolation(Long tenantId) {
        // TODO: 实现数据隔离验证逻辑
        // 1. 检查用户数据是否正确隔离
        // 2. 检查项目数据是否正确隔离
        // 3. 检查文件数据是否正确隔离
        return true;
    }

    /**
     * 转换为VO对象
     */
    private TenantVO convertToVO(Tenant tenant) {
        TenantVO vo = new TenantVO();
        BeanUtil.copyProperties(tenant, vo);

        // 设置状态描述
        for (Tenant.Status status : Tenant.Status.values()) {
            if (status.getCode() == tenant.getStatus()) {
                vo.setStatusDesc(status.getDesc());
                break;
            }
        }

        // 获取套餐名称
        if (tenant.getPackageId() != null) {
            TenantPackage tenantPackage = packageMapper.selectById(tenant.getPackageId());
            if (tenantPackage != null) {
                vo.setPackageName(tenantPackage.getPackageName());
            }
        }

        // 计算剩余天数
        LocalDate endDate = tenant.getStatus() == Tenant.Status.TRIAL.getCode() 
            ? tenant.getTrialEndDate() 
            : tenant.getEndDate();
        if (endDate != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), endDate);
            vo.setRemainingDays((int) Math.max(0, days));
        }

        // 计算使用率
        if (tenant.getUserLimit() != null && tenant.getUserLimit() > 0) {
            vo.setUserUsageRate(tenant.getUserCount() * 100.0 / tenant.getUserLimit());
        }
        if (tenant.getStorageLimit() != null && tenant.getStorageLimit() > 0) {
            vo.setStorageUsageRate(tenant.getStorageUsed() * 100.0 / tenant.getStorageLimit());
        }
        if (tenant.getProjectLimit() != null && tenant.getProjectLimit() > 0) {
            vo.setProjectUsageRate(tenant.getProjectCount() * 100.0 / tenant.getProjectLimit());
        }
        if (tenant.getAiCallLimit() != null && tenant.getAiCallLimit() > 0) {
            vo.setAiCallUsageRate(tenant.getAiCallCount() * 100.0 / tenant.getAiCallLimit());
        }

        return vo;
    }
}