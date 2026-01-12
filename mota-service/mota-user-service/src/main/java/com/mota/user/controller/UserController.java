package com.mota.user.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.common.core.result.Result;
import com.mota.common.security.annotation.RequiresLogin;
import com.mota.common.security.annotation.RequiresPermission;
import com.mota.common.security.util.SecurityUtils;
import com.mota.user.dto.UserCreateRequest;
import com.mota.user.dto.UserQueryRequest;
import com.mota.user.dto.UserUpdateRequest;
import com.mota.user.dto.UserVO;
import com.mota.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理控制器
 * 
 * @author mota
 */
@Tag(name = "用户管理", description = "用户CRUD、角色分配等接口")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "创建用户")
    @PostMapping
    @RequiresPermission("system:user:create")
    public Result<Long> createUser(@Valid @RequestBody UserCreateRequest request) {
        Long userId = userService.createUser(request);
        return Result.success(userId);
    }

    @Operation(summary = "更新用户")
    @PutMapping("/{userId}")
    @RequiresPermission("system:user:update")
    public Result<Void> updateUser(
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        userService.updateUser(userId, request);
        return Result.success();
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{userId}")
    @RequiresPermission("system:user:delete")
    public Result<Void> deleteUser(@Parameter(description = "用户ID") @PathVariable Long userId) {
        userService.deleteUser(userId);
        return Result.success();
    }

    @Operation(summary = "批量删除用户")
    @DeleteMapping("/batch")
    @RequiresPermission("system:user:delete")
    public Result<Void> deleteUsers(@RequestBody List<Long> userIds) {
        userService.deleteUsers(userIds);
        return Result.success();
    }

    @Operation(summary = "获取用户详情")
    @GetMapping("/{userId}")
    @RequiresPermission("system:user:query")
    public Result<UserVO> getUserById(@Parameter(description = "用户ID") @PathVariable Long userId) {
        UserVO user = userService.getUserById(userId);
        return Result.success(user);
    }

    @Operation(summary = "获取当前登录用户信息")
    @GetMapping("/me")
    @RequiresLogin
    public Result<UserVO> getCurrentUser() {
        Long userId = SecurityUtils.getUserId();
        UserVO user = userService.getUserById(userId);
        return Result.success(user);
    }

    @Operation(summary = "分页查询用户")
    @GetMapping
    @RequiresPermission("system:user:query")
    public Result<IPage<UserVO>> pageUsers(UserQueryRequest request) {
        IPage<UserVO> page = userService.pageUsers(request);
        return Result.success(page);
    }

    @Operation(summary = "根据部门ID查询用户列表")
    @GetMapping("/dept/{deptId}")
    @RequiresPermission("system:user:query")
    public Result<List<UserVO>> listByDeptId(@Parameter(description = "部门ID") @PathVariable Long deptId) {
        List<UserVO> users = userService.listByDeptId(deptId);
        return Result.success(users);
    }

    @Operation(summary = "根据角色ID查询用户列表")
    @GetMapping("/role/{roleId}")
    @RequiresPermission("system:user:query")
    public Result<List<UserVO>> listByRoleId(@Parameter(description = "角色ID") @PathVariable Long roleId) {
        List<UserVO> users = userService.listByRoleId(roleId);
        return Result.success(users);
    }

    @Operation(summary = "启用用户")
    @PutMapping("/{userId}/enable")
    @RequiresPermission("system:user:update")
    public Result<Void> enableUser(@Parameter(description = "用户ID") @PathVariable Long userId) {
        userService.enableUser(userId);
        return Result.success();
    }

    @Operation(summary = "禁用用户")
    @PutMapping("/{userId}/disable")
    @RequiresPermission("system:user:update")
    public Result<Void> disableUser(@Parameter(description = "用户ID") @PathVariable Long userId) {
        userService.disableUser(userId);
        return Result.success();
    }

    @Operation(summary = "重置密码")
    @PutMapping("/{userId}/reset-password")
    @RequiresPermission("system:user:resetPwd")
    public Result<Void> resetPassword(
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @RequestParam String newPassword) {
        userService.resetPassword(userId, newPassword);
        return Result.success();
    }

    @Operation(summary = "修改密码")
    @PutMapping("/change-password")
    @RequiresLogin
    public Result<Void> changePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        Long userId = SecurityUtils.getUserId();
        userService.changePassword(userId, oldPassword, newPassword);
        return Result.success();
    }

    @Operation(summary = "更新头像")
    @PutMapping("/avatar")
    @RequiresLogin
    public Result<Void> updateAvatar(@RequestParam String avatarUrl) {
        Long userId = SecurityUtils.getUserId();
        userService.updateAvatar(userId, avatarUrl);
        return Result.success();
    }

    @Operation(summary = "分配角色")
    @PutMapping("/{userId}/roles")
    @RequiresPermission("system:user:assignRole")
    public Result<Void> assignRoles(
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @RequestBody List<Long> roleIds) {
        userService.assignRoles(userId, roleIds);
        return Result.success();
    }

    @Operation(summary = "获取用户角色ID列表")
    @GetMapping("/{userId}/roles")
    @RequiresPermission("system:user:query")
    public Result<List<Long>> getUserRoleIds(@Parameter(description = "用户ID") @PathVariable Long userId) {
        List<Long> roleIds = userService.getUserRoleIds(userId);
        return Result.success(roleIds);
    }

    @Operation(summary = "获取用户权限标识列表")
    @GetMapping("/{userId}/permissions")
    @RequiresPermission("system:user:query")
    public Result<List<String>> getUserPermissions(@Parameter(description = "用户ID") @PathVariable Long userId) {
        List<String> permissions = userService.getUserPermissions(userId);
        return Result.success(permissions);
    }

    @Operation(summary = "检查用户名是否存在")
    @GetMapping("/exists/username")
    public Result<Boolean> existsByUsername(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        return Result.success(exists);
    }

    @Operation(summary = "检查邮箱是否存在")
    @GetMapping("/exists/email")
    public Result<Boolean> existsByEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return Result.success(exists);
    }

    @Operation(summary = "检查手机号是否存在")
    @GetMapping("/exists/phone")
    public Result<Boolean> existsByPhone(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        return Result.success(exists);
    }
}