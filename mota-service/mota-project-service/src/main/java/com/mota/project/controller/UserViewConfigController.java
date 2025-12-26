package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.UserViewConfig;
import com.mota.project.service.UserViewConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户视图配置控制器
 */
@RestController
@RequestMapping("/api/view-configs")
@RequiredArgsConstructor
public class UserViewConfigController {

    private final UserViewConfigService userViewConfigService;

    // ========== 视图配置CRUD ==========

    @PostMapping
    public Result<UserViewConfig> createViewConfig(@RequestBody UserViewConfig config) {
        return Result.success(userViewConfigService.createViewConfig(config));
    }

    @PutMapping("/{id}")
    public Result<UserViewConfig> updateViewConfig(
            @PathVariable Long id,
            @RequestBody UserViewConfig config) {
        return Result.success(userViewConfigService.updateViewConfig(id, config));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteViewConfig(@PathVariable Long id) {
        return Result.success(userViewConfigService.deleteViewConfig(id));
    }

    @GetMapping("/{id}")
    public Result<UserViewConfig> getViewConfig(@PathVariable Long id) {
        return Result.success(userViewConfigService.getViewConfigById(id));
    }

    // ========== 视图配置查询 ==========

    @GetMapping("/user/{userId}")
    public Result<List<UserViewConfig>> getUserViewConfigs(@PathVariable Long userId) {
        return Result.success(userViewConfigService.getUserViewConfigs(userId));
    }

    @GetMapping("/user/{userId}/type/{viewType}")
    public Result<List<UserViewConfig>> getUserViewConfigsByType(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        return Result.success(userViewConfigService.getUserViewConfigsByType(userId, viewType));
    }

    @GetMapping("/user/{userId}/type/{viewType}/default")
    public Result<UserViewConfig> getDefaultViewConfig(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        return Result.success(userViewConfigService.getDefaultViewConfig(userId, viewType));
    }

    @GetMapping("/project/{projectId}")
    public Result<List<UserViewConfig>> getProjectViewConfigs(@PathVariable Long projectId) {
        return Result.success(userViewConfigService.getProjectViewConfigs(projectId));
    }

    @GetMapping("/shared")
    public Result<List<UserViewConfig>> getSharedViewConfigs(
            @RequestParam(required = false) String viewType) {
        return Result.success(userViewConfigService.getSharedViewConfigs(viewType));
    }

    // ========== 视图配置管理 ==========

    @PutMapping("/{id}/default")
    public Result<Void> setDefaultViewConfig(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String viewType) {
        userViewConfigService.setDefaultViewConfig(id, userId, viewType);
        return Result.success();
    }

    @DeleteMapping("/user/{userId}/type/{viewType}/default")
    public Result<Void> unsetDefaultViewConfig(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        userViewConfigService.unsetDefaultViewConfig(userId, viewType);
        return Result.success();
    }

    @PutMapping("/{id}/shared")
    public Result<Void> setViewConfigShared(
            @PathVariable Long id,
            @RequestParam boolean isShared) {
        userViewConfigService.setViewConfigShared(id, isShared);
        return Result.success();
    }

    @GetMapping("/check-name")
    public Result<Boolean> isViewNameExists(
            @RequestParam Long userId,
            @RequestParam String name) {
        return Result.success(userViewConfigService.isViewNameExists(userId, name));
    }

    // ========== 视图配置快捷操作 ==========

    @PostMapping("/save-current")
    public Result<UserViewConfig> saveCurrentView(
            @RequestParam Long userId,
            @RequestParam String viewType,
            @RequestParam String name,
            @RequestBody Map<String, Object> config) {
        return Result.success(userViewConfigService.saveCurrentView(userId, viewType, name, config));
    }

    @GetMapping("/{id}/apply")
    public Result<Map<String, Object>> applyViewConfig(@PathVariable Long id) {
        return Result.success(userViewConfigService.applyViewConfig(id));
    }

    @PostMapping("/{id}/duplicate")
    public Result<UserViewConfig> duplicateViewConfig(
            @PathVariable Long id,
            @RequestParam(required = false) String newName) {
        return Result.success(userViewConfigService.duplicateViewConfig(id, newName));
    }

    @DeleteMapping("/user/{userId}/type/{viewType}/reset")
    public Result<Void> resetToDefault(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        userViewConfigService.resetToDefault(userId, viewType);
        return Result.success();
    }
}