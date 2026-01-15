package com.mota.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.user.dto.RoleCreateRequest;
import com.mota.user.dto.RoleQueryRequest;
import com.mota.user.dto.RoleUpdateRequest;
import com.mota.user.dto.RoleVO;
import com.mota.user.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理控制器
 * 
 * @author mota
 */
@Tag(name = "角色管理", description = "角色CRUD、权限分配等接口")
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @Operation(summary = "创建角色")
    @PostMapping
    @RequiresPermission("system:role:create")
    public Result<Long> createRole(@Valid @RequestBody RoleCreateRequest request) {
        Long roleId = roleService.createRole(request);
        return Result.success(roleId);
    }

    @Operation(summary = "更新角色")
    @PutMapping("/{roleId}")
    @RequiresPermission("system:role:update")
    public Result<Void> updateRole(
            @Parameter(description = "角色ID") @PathVariable Long roleId,
            @Valid @RequestBody RoleUpdateRequest request) {
        roleService.updateRole(roleId, request);
        return Result.success();
    }

    @Operation(summary = "删除角色")
    @DeleteMapping("/{roleId}")
    @RequiresPermission("system:role:delete")
    public Result<Void> deleteRole(@Parameter(description = "角色ID") @PathVariable Long roleId) {
        roleService.deleteRole(roleId);
        return Result.success();
    }

    @Operation(summary = "批量删除角色")
    @DeleteMapping("/batch")
    @RequiresPermission("system:role:delete")
    public Result<Void> deleteRoles(@RequestBody List<Long> roleIds) {
        roleService.deleteRoles(roleIds);
        return Result.success();
    }

    @Operation(summary = "获取角色详情")
    @GetMapping("/{roleId}")
    @RequiresPermission("system:role:query")
    public Result<RoleVO> getRoleById(@Parameter(description = "角色ID") @PathVariable Long roleId) {
        RoleVO role = roleService.getRoleById(roleId);
        return Result.success(role);
    }

    @Operation(summary = "分页查询角色")
    @GetMapping
    @RequiresPermission("system:role:query")
    public Result<IPage<RoleVO>> pageRoles(RoleQueryRequest request) {
        IPage<RoleVO> page = roleService.pageRoles(request);
        return Result.success(page);
    }

    @Operation(summary = "获取所有启用的角色")
    @GetMapping("/enabled")
    public Result<List<RoleVO>> listAllEnabled() {
        List<RoleVO> roles = roleService.listAllEnabled();
        return Result.success(roles);
    }

    @Operation(summary = "启用角色")
    @PutMapping("/{roleId}/enable")
    @RequiresPermission("system:role:update")
    public Result<Void> enableRole(@Parameter(description = "角色ID") @PathVariable Long roleId) {
        roleService.enableRole(roleId);
        return Result.success();
    }

    @Operation(summary = "禁用角色")
    @PutMapping("/{roleId}/disable")
    @RequiresPermission("system:role:update")
    public Result<Void> disableRole(@Parameter(description = "角色ID") @PathVariable Long roleId) {
        roleService.disableRole(roleId);
        return Result.success();
    }

    @Operation(summary = "分配权限")
    @PutMapping("/{roleId}/permissions")
    @RequiresPermission("system:role:assignPermission")
    public Result<Void> assignPermissions(
            @Parameter(description = "角色ID") @PathVariable Long roleId,
            @RequestBody List<Long> permissionIds) {
        roleService.assignPermissions(roleId, permissionIds);
        return Result.success();
    }

    @Operation(summary = "获取角色权限ID列表")
    @GetMapping("/{roleId}/permissions")
    @RequiresPermission("system:role:query")
    public Result<List<Long>> getRolePermissionIds(@Parameter(description = "角色ID") @PathVariable Long roleId) {
        List<Long> permissionIds = roleService.getRolePermissionIds(roleId);
        return Result.success(permissionIds);
    }

    @Operation(summary = "检查角色编码是否存在")
    @GetMapping("/exists/code")
    public Result<Boolean> existsByCode(@RequestParam String code) {
        boolean exists = roleService.existsByCode(code);
        return Result.success(exists);
    }
}