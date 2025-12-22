package com.mota.auth.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.auth.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 用户Mapper
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
     * 更新最后登录时间
     */
    @Update("UPDATE sys_user SET last_login_at = NOW() WHERE id = #{userId}")
    void updateLastLoginTime(@Param("userId") Long userId);
}