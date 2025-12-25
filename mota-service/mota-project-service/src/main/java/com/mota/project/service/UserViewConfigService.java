package com.mota.project.service;

import com.mota.project.entity.UserViewConfig;

import java.util.List;
import java.util.Map;

/**
 * 用户视图配置服务接口
 */
public interface UserViewConfigService {

    // ========== 视图配置CRUD ==========

    /**
     * 创建视图配置
     */
    UserViewConfig createViewConfig(UserViewConfig config);

    /**
     * 更新视图配置
     */
    UserViewConfig updateViewConfig(Long id, UserViewConfig config);

    /**
     * 删除视图配置
     */
    boolean deleteViewConfig(Long id);

    /**
     * 获取视图配置详情
     */
    UserViewConfig getViewConfigById(Long id);

    // ========== 视图配置查询 ==========

    /**
     * 获取用户的所有视图配置
     */
    List<UserViewConfig> getUserViewConfigs(Long userId);

    /**
     * 获取用户指定类型的视图配置
     */
    List<UserViewConfig> getUserViewConfigsByType(Long userId, String viewType);

    /**
     * 获取用户的默认视图
     */
    UserViewConfig getDefaultViewConfig(Long userId, String viewType);

    /**
     * 获取项目相关的视图配置
     */
    List<UserViewConfig> getProjectViewConfigs(Long projectId);

    /**
     * 获取共享的视图配置
     */
    List<UserViewConfig> getSharedViewConfigs(String viewType);

    // ========== 视图配置管理 ==========

    /**
     * 设置默认视图
     */
    void setDefaultViewConfig(Long id, Long userId, String viewType);

    /**
     * 取消默认视图
     */
    void unsetDefaultViewConfig(Long userId, String viewType);

    /**
     * 设置视图共享状态
     */
    void setViewConfigShared(Long id, boolean isShared);

    /**
     * 检查视图名称是否存在
     */
    boolean isViewNameExists(Long userId, String name);

    // ========== 视图配置快捷操作 ==========

    /**
     * 保存当前视图配置
     */
    UserViewConfig saveCurrentView(Long userId, String viewType, String name, Map<String, Object> config);

    /**
     * 快速应用视图配置
     */
    Map<String, Object> applyViewConfig(Long id);

    /**
     * 复制视图配置
     */
    UserViewConfig duplicateViewConfig(Long id, String newName);

    /**
     * 重置为默认配置
     */
    void resetToDefault(Long userId, String viewType);
}