package com.mota.user.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.user.dto.RoleCreateRequest;
import com.mota.user.dto.RoleQueryRequest;
import com.mota.user.dto.RoleUpdateRequest;
import com.mota.user.dto.RoleVO;

import java.util.List;

/**
 * 角色服务接口
 * 
 * @author mota
 */
public interface RoleService {

    /**
     * 创建角色
     */
    Long createRole(RoleCreateRequest request);

    /**
     * 更新角色
     */
    void updateRole(Long roleId, RoleUpdateRequest request);

    /**
     * 删除角色
     */
    void deleteRole(Long roleId);

    /**
     * 批量删除角色
     */
    void deleteRoles(List<Long> roleIds);

    /**
     * 获取角色详情
     */
    RoleVO getRoleById(Long roleId);

    /**
     * 分页查询角色
     */
    IPage<RoleVO> pageRoles(RoleQueryRequest request);

    /**
     * 获取所有启用的角色
     */
    List<RoleVO> listAllEnabled();

    /**
     * 启用角色
     */
    void enableRole(Long roleId);

    /**
     * 禁用角色
     */
    void disableRole(Long roleId);

    /**
     * 分配权限
     */
    void assignPermissions(Long roleId, List<Long> permissionIds);

    /**
     * 获取角色权限ID列表
     */
    List<Long> getRolePermissionIds(Long roleId);

    /**
     * 检查角色编码是否存在
     */
    boolean existsByCode(String code);

    /**
     * 检查角色编码是否存在（排除指定ID）
     */
    boolean existsByCodeExcludeId(String code, Long excludeId);
}