package com.mota.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.core.util.StringUtils;
import com.mota.user.dto.UserCreateRequest;
import com.mota.user.dto.UserQueryRequest;
import com.mota.user.dto.UserUpdateRequest;
import com.mota.user.dto.UserVO;
import com.mota.user.entity.Role;
import com.mota.user.entity.User;
import com.mota.user.entity.UserRole;
import com.mota.user.mapper.DepartmentMapper;
import com.mota.user.mapper.PermissionMapper;
import com.mota.user.mapper.RoleMapper;
import com.mota.user.mapper.UserMapper;
import com.mota.user.mapper.UserRoleMapper;
import com.mota.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户服务实现
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final PermissionMapper permissionMapper;
    private final DepartmentMapper departmentMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createUser(UserCreateRequest request) {
        // 检查用户名是否存在
        if (existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }
        
        // 检查邮箱是否存在
        if (StringUtils.isNotBlank(request.getEmail()) && existsByEmail(request.getEmail())) {
            throw new BusinessException("邮箱已被使用");
        }
        
        // 检查手机号是否存在
        if (StringUtils.isNotBlank(request.getPhone()) && existsByPhone(request.getPhone())) {
            throw new BusinessException("手机号已被使用");
        }
        
        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setNickname(request.getNickname());
        user.setRealName(request.getRealName());
        user.setGender(request.getGender() != null ? request.getGender() : 0);
        user.setDeptId(request.getDeptId());
        user.setPostId(request.getPostId());
        user.setStatus(1);
        user.setUserType(1);
        user.setLoginFailCount(0);
        user.setRemark(request.getRemark());
        
        userMapper.insert(user);
        
        // 分配角色
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            assignRoles(user.getId(), request.getRoleIds());
        }
        
        log.info("创建用户成功: userId={}, username={}", user.getId(), user.getUsername());
        return user.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(Long userId, UserUpdateRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 检查邮箱是否被其他用户使用
        if (StringUtils.isNotBlank(request.getEmail()) && !request.getEmail().equals(user.getEmail())) {
            User existUser = userMapper.findByEmail(request.getEmail());
            if (existUser != null && !existUser.getId().equals(userId)) {
                throw new BusinessException("邮箱已被使用");
            }
            user.setEmail(request.getEmail());
        }
        
        // 检查手机号是否被其他用户使用
        if (StringUtils.isNotBlank(request.getPhone()) && !request.getPhone().equals(user.getPhone())) {
            User existUser = userMapper.findByPhone(request.getPhone());
            if (existUser != null && !existUser.getId().equals(userId)) {
                throw new BusinessException("手机号已被使用");
            }
            user.setPhone(request.getPhone());
        }
        
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getRealName() != null) {
            user.setRealName(request.getRealName());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getDeptId() != null) {
            user.setDeptId(request.getDeptId());
        }
        if (request.getPostId() != null) {
            user.setPostId(request.getPostId());
        }
        if (request.getRemark() != null) {
            user.setRemark(request.getRemark());
        }
        
        userMapper.updateById(user);
        log.info("更新用户成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 删除用户角色关联
        userRoleMapper.deleteByUserId(userId);
        
        // 逻辑删除用户
        userMapper.deleteById(userId);
        log.info("删除用户成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUsers(List<Long> userIds) {
        for (Long userId : userIds) {
            deleteUser(userId);
        }
    }

    @Override
    public UserVO getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return convertToVO(user);
    }

    @Override
    public User getByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    @Override
    public User getByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    @Override
    public User getByPhone(String phone) {
        return userMapper.findByPhone(phone);
    }

    @Override
    public IPage<UserVO> pageUsers(UserQueryRequest request) {
        Page<User> page = new Page<>(request.getPageNum(), request.getPageSize());
        
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.isNotBlank(request.getUsername())) {
            wrapper.like(User::getUsername, request.getUsername());
        }
        if (StringUtils.isNotBlank(request.getNickname())) {
            wrapper.like(User::getNickname, request.getNickname());
        }
        if (StringUtils.isNotBlank(request.getRealName())) {
            wrapper.like(User::getRealName, request.getRealName());
        }
        if (StringUtils.isNotBlank(request.getPhone())) {
            wrapper.eq(User::getPhone, request.getPhone());
        }
        if (StringUtils.isNotBlank(request.getEmail())) {
            wrapper.eq(User::getEmail, request.getEmail());
        }
        if (request.getStatus() != null) {
            wrapper.eq(User::getStatus, request.getStatus());
        }
        if (request.getDeptId() != null) {
            if (Boolean.TRUE.equals(request.getIncludeChildDept())) {
                List<Long> deptIds = departmentMapper.findChildDeptIds(request.getDeptId());
                wrapper.in(User::getDeptId, deptIds);
            } else {
                wrapper.eq(User::getDeptId, request.getDeptId());
            }
        }
        
        wrapper.orderByDesc(User::getCreatedAt);
        
        IPage<User> userPage = userMapper.selectPage(page, wrapper);
        
        return userPage.convert(this::convertToVO);
    }

    @Override
    public List<UserVO> listByDeptId(Long deptId) {
        List<User> users = userMapper.findByDeptId(deptId);
        return users.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public List<UserVO> listByRoleId(Long roleId) {
        List<User> users = userMapper.findByRoleId(roleId);
        return users.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void enableUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setStatus(1);
        userMapper.updateById(user);
        log.info("启用用户成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void disableUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setStatus(0);
        userMapper.updateById(user);
        log.info("禁用用户成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resetPassword(Long userId, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setLoginFailCount(0);
        user.setLockTime(null);
        userMapper.updateById(user);
        log.info("重置密码成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BusinessException("原密码错误");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
        log.info("修改密码成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAvatar(Long userId, String avatarUrl) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setAvatar(avatarUrl);
        userMapper.updateById(user);
        log.info("更新头像成功: userId={}", userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignRoles(Long userId, List<Long> roleIds) {
        // 删除原有角色
        userRoleMapper.deleteByUserId(userId);
        
        // 分配新角色
        if (roleIds != null && !roleIds.isEmpty()) {
            for (Long roleId : roleIds) {
                UserRole userRole = new UserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(roleId);
                userRoleMapper.insert(userRole);
            }
        }
        log.info("分配角色成功: userId={}, roleIds={}", userId, roleIds);
    }

    @Override
    public List<Long> getUserRoleIds(Long userId) {
        List<Role> roles = roleMapper.findByUserId(userId);
        return roles.stream().map(Role::getId).collect(Collectors.toList());
    }

    @Override
    public List<String> getUserPermissions(Long userId) {
        return permissionMapper.findPermsByUserId(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateLastLogin(Long userId, String ip) {
        userMapper.updateLastLogin(userId, ip);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userMapper.findByUsername(username) != null;
    }

    @Override
    public boolean existsByEmail(String email) {
        return userMapper.findByEmail(email) != null;
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userMapper.findByPhone(phone) != null;
    }

    /**
     * 转换为VO
     */
    private UserVO convertToVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setEmail(user.getEmail());
        vo.setPhone(user.getPhone());
        vo.setNickname(user.getNickname());
        vo.setRealName(user.getRealName());
        vo.setAvatar(user.getAvatar());
        vo.setGender(user.getGender());
        vo.setStatus(user.getStatus());
        vo.setDeptId(user.getDeptId());
        vo.setPostId(user.getPostId());
        vo.setUserType(user.getUserType());
        vo.setLastLoginAt(user.getLastLoginAt());
        vo.setLastLoginIp(user.getLastLoginIp());
        vo.setRemark(user.getRemark());
        vo.setCreateTime(user.getCreatedAt());
        vo.setUpdateTime(user.getUpdatedAt());
        
        // 获取部门名称
        if (user.getDeptId() != null) {
            var dept = departmentMapper.selectById(user.getDeptId());
            if (dept != null) {
                vo.setDeptName(dept.getName());
            }
        }
        
        // 获取角色列表
        List<Role> roles = roleMapper.findByUserId(user.getId());
        if (roles != null && !roles.isEmpty()) {
            List<UserVO.RoleVO> roleVOs = new ArrayList<>();
            for (Role role : roles) {
                UserVO.RoleVO roleVO = new UserVO.RoleVO();
                roleVO.setId(role.getId());
                roleVO.setName(role.getName());
                roleVO.setCode(role.getCode());
                roleVOs.add(roleVO);
            }
            vo.setRoles(roleVOs);
        }
        
        return vo;
    }
}