package com.mota.user.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.user.dto.UserCreateRequest;
import com.mota.user.dto.UserQueryRequest;
import com.mota.user.dto.UserUpdateRequest;
import com.mota.user.dto.UserVO;
import com.mota.user.entity.User;

import java.util.List;

/**
 * 用户服务接口
 * 
 * @author mota
 */
public interface UserService {

    /**
     * 创建用户
     */
    Long createUser(UserCreateRequest request);

    /**
     * 更新用户
     */
    void updateUser(Long userId, UserUpdateRequest request);

    /**
     * 删除用户
     */
    void deleteUser(Long userId);

    /**
     * 批量删除用户
     */
    void deleteUsers(List<Long> userIds);

    /**
     * 获取用户详情
     */
    UserVO getUserById(Long userId);

    /**
     * 根据用户名获取用户
     */
    User getByUsername(String username);

    /**
     * 根据邮箱获取用户
     */
    User getByEmail(String email);

    /**
     * 根据手机号获取用户
     */
    User getByPhone(String phone);

    /**
     * 分页查询用户
     */
    IPage<UserVO> pageUsers(UserQueryRequest request);

    /**
     * 根据部门ID查询用户列表
     */
    List<UserVO> listByDeptId(Long deptId);

    /**
     * 根据角色ID查询用户列表
     */
    List<UserVO> listByRoleId(Long roleId);

    /**
     * 启用用户
     */
    void enableUser(Long userId);

    /**
     * 禁用用户
     */
    void disableUser(Long userId);

    /**
     * 重置密码
     */
    void resetPassword(Long userId, String newPassword);

    /**
     * 修改密码
     */
    void changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 更新用户头像
     */
    void updateAvatar(Long userId, String avatarUrl);

    /**
     * 分配角色
     */
    void assignRoles(Long userId, List<Long> roleIds);

    /**
     * 获取用户角色ID列表
     */
    List<Long> getUserRoleIds(Long userId);

    /**
     * 获取用户权限标识列表
     */
    List<String> getUserPermissions(Long userId);

    /**
     * 更新最后登录信息
     */
    void updateLastLogin(Long userId, String ip);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 检查手机号是否存在
     */
    boolean existsByPhone(String phone);
}