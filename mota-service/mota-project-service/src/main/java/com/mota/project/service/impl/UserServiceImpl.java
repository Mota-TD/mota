package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.User;
import com.mota.project.mapper.UserMapper;
import com.mota.project.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 用户服务实现类
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public IPage<User> listUsers(String keyword, Integer status, Integer page, Integer pageSize, Long enterpriseId) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        
        // 按企业ID过滤
        if (enterpriseId != null) {
            queryWrapper.eq(User::getEnterpriseId, enterpriseId);
        }
        
        // 关键词搜索
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like(User::getUsername, keyword)
                .or()
                .like(User::getNickname, keyword)
                .or()
                .like(User::getEmail, keyword)
                .or()
                .like(User::getPhone, keyword)
            );
        }
        
        // 状态过滤
        if (status != null) {
            queryWrapper.eq(User::getStatus, status);
        }
        
        // 按创建时间倒序
        queryWrapper.orderByDesc(User::getCreatedAt);
        
        return page(new Page<>(page, pageSize), queryWrapper);
    }

    @Override
    public User getUserById(Long id) {
        User user = getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    @Override
    public User createUser(User user) {
        // 检查用户名是否已存在
        if (StringUtils.hasText(user.getUsername())) {
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getUsername, user.getUsername());
            if (user.getEnterpriseId() != null) {
                queryWrapper.eq(User::getEnterpriseId, user.getEnterpriseId());
            }
            if (count(queryWrapper) > 0) {
                throw new BusinessException("用户名已存在");
            }
        }
        
        // 处理空邮箱 - 设置为 null 而不是空字符串，避免唯一索引冲突
        if (!StringUtils.hasText(user.getEmail())) {
            user.setEmail(null);
        } else {
            // 检查邮箱是否已存在
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getEmail, user.getEmail());
            if (user.getEnterpriseId() != null) {
                queryWrapper.eq(User::getEnterpriseId, user.getEnterpriseId());
            }
            if (count(queryWrapper) > 0) {
                throw new BusinessException("邮箱已存在");
            }
        }
        
        // 设置默认状态
        if (user.getStatus() == null) {
            user.setStatus(1); // 默认启用
        }
        
        // 设置默认角色
        if (!StringUtils.hasText(user.getRole())) {
            user.setRole("member");
        }
        
        save(user);
        return user;
    }

    @Override
    public User updateUser(User user) {
        User existingUser = getById(user.getId());
        if (existingUser == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 检查用户名是否已被其他用户使用
        if (StringUtils.hasText(user.getUsername()) && !user.getUsername().equals(existingUser.getUsername())) {
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getUsername, user.getUsername());
            queryWrapper.ne(User::getId, user.getId());
            if (existingUser.getEnterpriseId() != null) {
                queryWrapper.eq(User::getEnterpriseId, existingUser.getEnterpriseId());
            }
            if (count(queryWrapper) > 0) {
                throw new BusinessException("用户名已存在");
            }
        }
        
        // 检查邮箱是否已被其他用户使用
        if (StringUtils.hasText(user.getEmail()) && !user.getEmail().equals(existingUser.getEmail())) {
            LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getEmail, user.getEmail());
            queryWrapper.ne(User::getId, user.getId());
            if (existingUser.getEnterpriseId() != null) {
                queryWrapper.eq(User::getEnterpriseId, existingUser.getEnterpriseId());
            }
            if (count(queryWrapper) > 0) {
                throw new BusinessException("邮箱已存在");
            }
        }
        
        updateById(user);
        return getById(user.getId());
    }

    @Override
    public void deleteUser(Long id) {
        User user = getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        removeById(id);
    }
}