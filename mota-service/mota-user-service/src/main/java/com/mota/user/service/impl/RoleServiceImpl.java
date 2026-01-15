package com.mota.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.exception.BusinessException;
import com.mota.user.dto.RoleCreateRequest;
import com.mota.user.dto.RoleQueryRequest;
import com.mota.user.dto.RoleUpdateRequest;
import com.mota.user.dto.RoleVO;
import com.mota.user.entity.Role;
import com.mota.user.entity.RolePermission;
import com.mota.user.mapper.RoleMapper;
import com.mota.user.mapper.RolePermissionMapper;
import com.mota.user.mapper.UserRoleMapper;
import com.mota.user.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色服务实现
 * 
 * @author mota
 */
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleMapper roleMapper;
    private final RolePermissionMapper rolePermissionMapper;
    private final UserRoleMapper userRoleMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createRole(RoleCreateRequest request) {
        // 检查角色编码是否已存在
        if (existsByCode(request.getCode())) {
            throw new BusinessException("角色编码已存在");
        }

        Role role = new Role();
        BeanUtils.copyProperties(request, role);
        role.setStatus(1); // 默认启用
        role.setIsSystem(0); // 非系统内置
        
        roleMapper.insert(role);

        // 分配权限
        if (!CollectionUtils.isEmpty(request.getPermissionIds())) {
            assignPermissions(role.getId(), request.getPermissionIds());
        }

        return role.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRole(Long roleId, RoleUpdateRequest request) {
        Role role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        // 系统内置角色不允许修改编码
        if (role.getIsSystem() == 1 && StringUtils.hasText(request.getCode()) 
                && !role.getCode().equals(request.getCode())) {
            throw new BusinessException("系统内置角色不允许修改编码");
        }

        // 检查角色编码是否已存在
        if (StringUtils.hasText(request.getCode()) && existsByCodeExcludeId(request.getCode(), roleId)) {
            throw new BusinessException("角色编码已存在");
        }

        if (StringUtils.hasText(request.getName())) {
            role.setName(request.getName());
        }
        if (StringUtils.hasText(request.getCode())) {
            role.setCode(request.getCode());
        }
        if (request.getSort() != null) {
            role.setSort(request.getSort());
        }
        if (request.getDataScope() != null) {
            role.setDataScope(request.getDataScope());
        }
        if (request.getStatus() != null) {
            role.setStatus(request.getStatus());
        }
        if (request.getRemark() != null) {
            role.setRemark(request.getRemark());
        }

        roleMapper.updateById(role);

        // 更新权限
        if (request.getPermissionIds() != null) {
            assignPermissions(roleId, request.getPermissionIds());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRole(Long roleId) {
        Role role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }

        // 系统内置角色不允许删除
        if (role.getIsSystem() == 1) {
            throw new BusinessException("系统内置角色不允许删除");
        }

        // 检查是否有用户关联
        Long userCount = userRoleMapper.countByRoleId(roleId);
        if (userCount > 0) {
            throw new BusinessException("该角色下存在用户，无法删除");
        }

        // 删除角色权限关联
        rolePermissionMapper.deleteByRoleId(roleId);

        // 逻辑删除角色
        roleMapper.deleteById(roleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRoles(List<Long> roleIds) {
        for (Long roleId : roleIds) {
            deleteRole(roleId);
        }
    }

    @Override
    public RoleVO getRoleById(Long roleId) {
        Role role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        return convertToVO(role);
    }

    @Override
    public IPage<RoleVO> pageRoles(RoleQueryRequest request) {
        Page<Role> page = new Page<>(request.getPageNum(), request.getPageSize());
        
        LambdaQueryWrapper<Role> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(request.getName()), Role::getName, request.getName())
               .like(StringUtils.hasText(request.getCode()), Role::getCode, request.getCode())
               .eq(request.getStatus() != null, Role::getStatus, request.getStatus())
               .orderByAsc(Role::getSort)
               .orderByDesc(Role::getCreatedAt);

        IPage<Role> rolePage = roleMapper.selectPage(page, wrapper);
        
        return rolePage.convert(this::convertToVO);
    }

    @Override
    public List<RoleVO> listAllEnabled() {
        List<Role> roles = roleMapper.findAllEnabled();
        return roles.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public void enableRole(Long roleId) {
        Role role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        role.setStatus(1);
        roleMapper.updateById(role);
    }

    @Override
    public void disableRole(Long roleId) {
        Role role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在");
        }
        
        // 系统内置角色不允许禁用
        if (role.getIsSystem() == 1) {
            throw new BusinessException("系统内置角色不允许禁用");
        }
        
        role.setStatus(0);
        roleMapper.updateById(role);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignPermissions(Long roleId, List<Long> permissionIds) {
        // 先删除原有权限
        rolePermissionMapper.deleteByRoleId(roleId);

        // 添加新权限
        if (!CollectionUtils.isEmpty(permissionIds)) {
            List<RolePermission> rolePermissions = new ArrayList<>();
            for (Long permissionId : permissionIds) {
                RolePermission rp = new RolePermission();
                rp.setRoleId(roleId);
                rp.setPermissionId(permissionId);
                rolePermissions.add(rp);
            }
            // 批量插入
            for (RolePermission rp : rolePermissions) {
                rolePermissionMapper.insert(rp);
            }
        }
    }

    @Override
    public List<Long> getRolePermissionIds(Long roleId) {
        return rolePermissionMapper.findPermissionIdsByRoleId(roleId);
    }

    @Override
    public boolean existsByCode(String code) {
        Role role = roleMapper.findByCode(code);
        return role != null;
    }

    @Override
    public boolean existsByCodeExcludeId(String code, Long excludeId) {
        Role role = roleMapper.findByCode(code);
        return role != null && !role.getId().equals(excludeId);
    }

    private RoleVO convertToVO(Role role) {
        RoleVO vo = new RoleVO();
        BeanUtils.copyProperties(role, vo);
        
        // 获取权限ID列表
        List<Long> permissionIds = rolePermissionMapper.findPermissionIdsByRoleId(role.getId());
        vo.setPermissionIds(permissionIds);
        
        // 获取用户数量
        Long userCount = userRoleMapper.countByRoleId(role.getId());
        vo.setUserCount(userCount != null ? userCount.intValue() : 0);
        
        return vo;
    }
}