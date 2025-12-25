package com.mota.project.service.impl;

import com.mota.project.entity.UserViewConfig;
import com.mota.project.mapper.UserViewConfigMapper;
import com.mota.project.service.UserViewConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户视图配置服务实现类
 */
@Service
@RequiredArgsConstructor
public class UserViewConfigServiceImpl implements UserViewConfigService {

    private final UserViewConfigMapper userViewConfigMapper;

    // ========== 视图配置CRUD ==========

    @Override
    @Transactional
    public UserViewConfig createViewConfig(UserViewConfig config) {
        // 检查名称是否已存在
        if (isViewNameExists(config.getUserId(), config.getName())) {
            throw new RuntimeException("视图名称已存在");
        }
        
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        
        // 如果设置为默认，先取消其他默认视图
        if (config.getIsDefault() != null && config.getIsDefault()) {
            unsetDefaultViewConfig(config.getUserId(), config.getViewType());
        }
        
        userViewConfigMapper.insert(config);
        return config;
    }

    @Override
    @Transactional
    public UserViewConfig updateViewConfig(Long id, UserViewConfig config) {
        UserViewConfig existing = userViewConfigMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("视图配置不存在");
        }
        
        // 如果修改了名称，检查新名称是否已存在
        if (config.getName() != null && !config.getName().equals(existing.getName())) {
            if (isViewNameExists(existing.getUserId(), config.getName())) {
                throw new RuntimeException("视图名称已存在");
            }
        }
        
        config.setId(id);
        config.setUserId(existing.getUserId());
        config.setViewType(existing.getViewType());
        config.setUpdatedAt(LocalDateTime.now());
        
        // 如果设置为默认，先取消其他默认视图
        if (config.getIsDefault() != null && config.getIsDefault()) {
            unsetDefaultViewConfig(existing.getUserId(), existing.getViewType());
        }
        
        userViewConfigMapper.updateById(config);
        return userViewConfigMapper.selectById(id);
    }

    @Override
    @Transactional
    public boolean deleteViewConfig(Long id) {
        return userViewConfigMapper.deleteById(id) > 0;
    }

    @Override
    public UserViewConfig getViewConfigById(Long id) {
        return userViewConfigMapper.selectById(id);
    }

    // ========== 视图配置查询 ==========

    @Override
    public List<UserViewConfig> getUserViewConfigs(Long userId) {
        return userViewConfigMapper.selectByUserId(userId);
    }

    @Override
    public List<UserViewConfig> getUserViewConfigsByType(Long userId, String viewType) {
        return userViewConfigMapper.selectByUserIdAndType(userId, viewType);
    }

    @Override
    public UserViewConfig getDefaultViewConfig(Long userId, String viewType) {
        return userViewConfigMapper.selectDefaultView(userId, viewType);
    }

    @Override
    public List<UserViewConfig> getProjectViewConfigs(Long projectId) {
        return userViewConfigMapper.selectByProjectId(projectId);
    }

    @Override
    public List<UserViewConfig> getSharedViewConfigs(String viewType) {
        return userViewConfigMapper.selectSharedViews(viewType);
    }

    // ========== 视图配置管理 ==========

    @Override
    @Transactional
    public void setDefaultViewConfig(Long id, Long userId, String viewType) {
        userViewConfigMapper.setDefaultView(id, userId, viewType);
    }

    @Override
    @Transactional
    public void unsetDefaultViewConfig(Long userId, String viewType) {
        userViewConfigMapper.unsetDefaultView(userId, viewType);
    }

    @Override
    @Transactional
    public void setViewConfigShared(Long id, boolean isShared) {
        UserViewConfig config = userViewConfigMapper.selectById(id);
        if (config != null) {
            config.setIsShared(isShared);
            config.setUpdatedAt(LocalDateTime.now());
            userViewConfigMapper.updateById(config);
        }
    }

    @Override
    public boolean isViewNameExists(Long userId, String name) {
        return userViewConfigMapper.countByUserIdAndName(userId, name) > 0;
    }

    // ========== 视图配置快捷操作 ==========

    @Override
    @Transactional
    public UserViewConfig saveCurrentView(Long userId, String viewType, String name, Map<String, Object> config) {
        UserViewConfig viewConfig = new UserViewConfig();
        viewConfig.setUserId(userId);
        viewConfig.setViewType(viewType);
        viewConfig.setName(name);
        viewConfig.setConfig(config);
        viewConfig.setIsDefault(false);
        viewConfig.setIsShared(false);
        
        return createViewConfig(viewConfig);
    }

    @Override
    public Map<String, Object> applyViewConfig(Long id) {
        UserViewConfig config = userViewConfigMapper.selectById(id);
        if (config == null) {
            throw new RuntimeException("视图配置不存在");
        }
        return config.getConfig();
    }

    @Override
    @Transactional
    public UserViewConfig duplicateViewConfig(Long id, String newName) {
        UserViewConfig original = userViewConfigMapper.selectById(id);
        if (original == null) {
            throw new RuntimeException("视图配置不存在");
        }
        
        UserViewConfig copy = new UserViewConfig();
        copy.setUserId(original.getUserId());
        copy.setViewType(original.getViewType());
        copy.setName(newName != null ? newName : original.getName() + " (副本)");
        copy.setDescription(original.getDescription());
        copy.setConfig(new HashMap<>(original.getConfig()));
        copy.setIsDefault(false);
        copy.setIsShared(false);
        copy.setProjectId(original.getProjectId());
        
        return createViewConfig(copy);
    }

    @Override
    @Transactional
    public void resetToDefault(Long userId, String viewType) {
        // 获取用户该类型的所有视图配置
        List<UserViewConfig> configs = getUserViewConfigsByType(userId, viewType);
        
        // 删除所有非共享的视图配置
        for (UserViewConfig config : configs) {
            if (config.getIsShared() == null || !config.getIsShared()) {
                deleteViewConfig(config.getId());
            }
        }
    }
}