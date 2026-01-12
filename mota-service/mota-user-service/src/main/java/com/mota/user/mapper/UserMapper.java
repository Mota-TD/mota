package com.mota.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 用户Mapper
 * 
 * @author mota
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户名查询
     */
    @Select("SELECT * FROM sys_user WHERE username = #{username} AND deleted = 0")
    User findByUsername(@Param("username") String username);

    /**
     * 根据邮箱查询
     */
    @Select("SELECT * FROM sys_user WHERE email = #{email} AND deleted = 0")
    User findByEmail(@Param("email") String email);

    /**
     * 根据手机号查询
     */
    @Select("SELECT * FROM sys_user WHERE phone = #{phone} AND deleted = 0")
    User findByPhone(@Param("phone") String phone);

    /**
     * 更新最后登录时间和IP
     */
    @Update("UPDATE sys_user SET last_login_at = NOW(), last_login_ip = #{ip} WHERE id = #{userId}")
    void updateLastLogin(@Param("userId") Long userId, @Param("ip") String ip);

    /**
     * 更新登录失败次数
     */
    @Update("UPDATE sys_user SET login_fail_count = #{count} WHERE id = #{userId}")
    void updateLoginFailCount(@Param("userId") Long userId, @Param("count") Integer count);

    /**
     * 锁定账号
     */
    @Update("UPDATE sys_user SET lock_time = NOW() WHERE id = #{userId}")
    void lockUser(@Param("userId") Long userId);

    /**
     * 解锁账号
     */
    @Update("UPDATE sys_user SET lock_time = NULL, login_fail_count = 0 WHERE id = #{userId}")
    void unlockUser(@Param("userId") Long userId);

    /**
     * 根据部门ID查询用户列表
     */
    @Select("SELECT * FROM sys_user WHERE dept_id = #{deptId} AND deleted = 0")
    List<User> findByDeptId(@Param("deptId") Long deptId);

    /**
     * 根据角色ID查询用户列表
     */
    @Select("SELECT u.* FROM sys_user u " +
            "INNER JOIN sys_user_role ur ON u.id = ur.user_id " +
            "WHERE ur.role_id = #{roleId} AND u.deleted = 0")
    List<User> findByRoleId(@Param("roleId") Long roleId);
}