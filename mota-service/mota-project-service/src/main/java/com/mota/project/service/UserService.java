package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.User;

/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {

    /**
     * 分页查询用户列表
     * @param keyword 关键词
     * @param status 状态
     * @param page 页码
     * @param pageSize 每页大小
     * @param enterpriseId 企业ID
     * @return 用户分页数据
     */
    IPage<User> listUsers(String keyword, Integer status, Integer page, Integer pageSize, Long enterpriseId);

    /**
     * 根据ID获取用户
     * @param id 用户ID
     * @return 用户信息
     */
    User getUserById(Long id);

    /**
     * 创建用户
     * @param user 用户信息
     * @return 创建的用户
     */
    User createUser(User user);

    /**
     * 更新用户
     * @param user 用户信息
     * @return 更新后的用户
     */
    User updateUser(User user);

    /**
     * 删除用户
     * @param id 用户ID
     */
    void deleteUser(Long id);
}