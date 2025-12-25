package com.mota.project.controller;

import com.mota.project.entity.UserViewConfig;
import com.mota.project.service.UserViewConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<UserViewConfig> createViewConfig(@RequestBody UserViewConfig config) {
        return ResponseEntity.ok(userViewConfigService.createViewConfig(config));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserViewConfig> updateViewConfig(
            @PathVariable Long id,
            @RequestBody UserViewConfig config) {
        return ResponseEntity.ok(userViewConfigService.updateViewConfig(id, config));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteViewConfig(@PathVariable Long id) {
        return ResponseEntity.ok(userViewConfigService.deleteViewConfig(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserViewConfig> getViewConfig(@PathVariable Long id) {
        return ResponseEntity.ok(userViewConfigService.getViewConfigById(id));
    }

    // ========== 视图配置查询 ==========

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserViewConfig>> getUserViewConfigs(@PathVariable Long userId) {
        return ResponseEntity.ok(userViewConfigService.getUserViewConfigs(userId));
    }

    @GetMapping("/user/{userId}/type/{viewType}")
    public ResponseEntity<List<UserViewConfig>> getUserViewConfigsByType(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        return ResponseEntity.ok(userViewConfigService.getUserViewConfigsByType(userId, viewType));
    }

    @GetMapping("/user/{userId}/type/{viewType}/default")
    public ResponseEntity<UserViewConfig> getDefaultViewConfig(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        return ResponseEntity.ok(userViewConfigService.getDefaultViewConfig(userId, viewType));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<UserViewConfig>> getProjectViewConfigs(@PathVariable Long projectId) {
        return ResponseEntity.ok(userViewConfigService.getProjectViewConfigs(projectId));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<UserViewConfig>> getSharedViewConfigs(
            @RequestParam(required = false) String viewType) {
        return ResponseEntity.ok(userViewConfigService.getSharedViewConfigs(viewType));
    }

    // ========== 视图配置管理 ==========

    @PutMapping("/{id}/default")
    public ResponseEntity<Void> setDefaultViewConfig(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String viewType) {
        userViewConfigService.setDefaultViewConfig(id, userId, viewType);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/user/{userId}/type/{viewType}/default")
    public ResponseEntity<Void> unsetDefaultViewConfig(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        userViewConfigService.unsetDefaultViewConfig(userId, viewType);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/shared")
    public ResponseEntity<Void> setViewConfigShared(
            @PathVariable Long id,
            @RequestParam boolean isShared) {
        userViewConfigService.setViewConfigShared(id, isShared);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-name")
    public ResponseEntity<Boolean> isViewNameExists(
            @RequestParam Long userId,
            @RequestParam String name) {
        return ResponseEntity.ok(userViewConfigService.isViewNameExists(userId, name));
    }

    // ========== 视图配置快捷操作 ==========

    @PostMapping("/save-current")
    public ResponseEntity<UserViewConfig> saveCurrentView(
            @RequestParam Long userId,
            @RequestParam String viewType,
            @RequestParam String name,
            @RequestBody Map<String, Object> config) {
        return ResponseEntity.ok(userViewConfigService.saveCurrentView(userId, viewType, name, config));
    }

    @GetMapping("/{id}/apply")
    public ResponseEntity<Map<String, Object>> applyViewConfig(@PathVariable Long id) {
        return ResponseEntity.ok(userViewConfigService.applyViewConfig(id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<UserViewConfig> duplicateViewConfig(
            @PathVariable Long id,
            @RequestParam(required = false) String newName) {
        return ResponseEntity.ok(userViewConfigService.duplicateViewConfig(id, newName));
    }

    @DeleteMapping("/user/{userId}/type/{viewType}/reset")
    public ResponseEntity<Void> resetToDefault(
            @PathVariable Long userId,
            @PathVariable String viewType) {
        userViewConfigService.resetToDefault(userId, viewType);
        return ResponseEntity.ok().build();
    }
}