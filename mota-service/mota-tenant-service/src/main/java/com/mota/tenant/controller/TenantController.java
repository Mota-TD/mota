package com.mota.tenant.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.tenant.dto.TenantCreateRequest;
import com.mota.tenant.dto.TenantVO;
import com.mota.tenant.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 租户管理控制器
 * 
 * @author mota
 */
@Tag(name = "租户管理", description = "租户CRUD、状态管理、配额管理等接口")
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @Operation(summary = "创建租户")
    @PostMapping
    public Result<Long> createTenant(@Valid @RequestBody TenantCreateRequest request) {
        Long tenantId = tenantService.createTenant(request);
        return Result.success(tenantId);
    }

    @Operation(summary = "更新租户")
    @PutMapping("/{tenantId}")
    public Result<Void> updateTenant(
            @Parameter(description = "租户ID") @PathVariable Long tenantId,
            @Valid @RequestBody TenantCreateRequest request) {
        tenantService.updateTenant(tenantId, request);
        return Result.success();
    }

    @Operation(summary = "获取租户详情")
    @GetMapping("/{tenantId}")
    public Result<TenantVO> getTenantDetail(
            @Parameter(description = "租户ID") @PathVariable Long tenantId) {
        TenantVO tenant = tenantService.getTenantDetail(tenantId);
        return Result.success(tenant);
    }

    @Operation(summary = "根据租户编码获取租户")
    @GetMapping("/code/{tenantCode}")
    public Result<TenantVO> getTenantByCode(
            @Parameter(description = "租户编码") @PathVariable String tenantCode) {
        TenantVO tenant = tenantService.getTenantByCode(tenantCode);
        return Result.success(tenant);
    }

    @Operation(summary = "分页查询租户")
    @GetMapping
    public Result<IPage<TenantVO>> pageTenants(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "租户名称") @RequestParam(required = false) String tenantName,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        IPage<TenantVO> result = tenantService.pageTenants(page, size, tenantName, status);
        return Result.success(result);
    }

    @Operation(summary = "启用租户")
    @PutMapping("/{tenantId}/enable")
    public Result<Void> enableTenant(
            @Parameter(description = "租户ID") @PathVariable Long tenantId) {
        tenantService.enableTenant(tenantId);
        return Result.success();
    }

    @Operation(summary = "禁用租户")
    @PutMapping("/{tenantId}/disable")
    public Result<Void> disableTenant(
            @Parameter(description = "租户ID") @PathVariable Long tenantId) {
        tenantService.disableTenant(tenantId);
        return Result.success();
    }

    @Operation(summary = "激活租户（试用转正式）")
    @PostMapping("/{tenantId}/activate")
    public Result<Void> activateTenant(
            @Parameter(description = "租户ID") @PathVariable Long tenantId,
            @Parameter(description = "套餐ID") @RequestParam Long packageId,
            @Parameter(description = "订阅月数") @RequestParam(defaultValue = "12") int months) {
        tenantService.activateTenant(tenantId, packageId, months);
        return Result.success();
    }

    @Operation(summary = "续费租户")
    @PostMapping("/{tenantId}/renew")
    public Result<Void> renewTenant(
            @Parameter(description = "租户ID") @PathVariable Long tenantId,
            @Parameter(description = "续费月数") @RequestParam int months) {
        tenantService.renewTenant(tenantId, months);
        return Result.success();
    }

    @Operation(summary = "升级套餐")
    @PostMapping("/{tenantId}/upgrade")
    public Result<Void> upgradePackage(
            @Parameter(description = "租户ID") @PathVariable Long tenantId,
            @Parameter(description = "新套餐ID") @RequestParam Long packageId) {
        tenantService.upgradePackage(tenantId, packageId);
        return Result.success();
    }

    @Operation(summary = "检查配额是否超限")
    @GetMapping("/{tenantId}/quota/check")
    public Result<Boolean> checkQuotaExceeded(
            @Parameter(description = "租户ID") @PathVariable Long tenantId,
            @Parameter(description = "配额类型（user/project/storage/ai）") @RequestParam String quotaType) {
        boolean exceeded = tenantService.checkQuotaExceeded(tenantId, quotaType);
        return Result.success(exceeded);
    }

    @Operation(summary = "获取即将过期的租户列表")
    @GetMapping("/expiring")
    public Result<List<TenantVO>> getExpiringTenants(
            @Parameter(description = "天数") @RequestParam(defaultValue = "7") int days) {
        List<TenantVO> tenants = tenantService.getExpiringTenants(days);
        return Result.success(tenants);
    }

    @Operation(summary = "初始化租户数据")
    @PostMapping("/{tenantId}/initialize")
    public Result<Void> initializeTenantData(
            @Parameter(description = "租户ID") @PathVariable Long tenantId) {
        tenantService.initializeTenantData(tenantId);
        return Result.success();
    }

    @Operation(summary = "验证租户数据隔离")
    @GetMapping("/{tenantId}/validate-isolation")
    public Result<Boolean> validateDataIsolation(
            @Parameter(description = "租户ID") @PathVariable Long tenantId) {
        boolean valid = tenantService.validateDataIsolation(tenantId);
        return Result.success(valid);
    }
}