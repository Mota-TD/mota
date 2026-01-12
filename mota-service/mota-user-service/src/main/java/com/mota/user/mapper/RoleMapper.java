package com.mota.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.user.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 角色Mapper
 * 
 * @author mota
 */
@Mapper
public interface RoleMapper extends BaseMapper<Role> {

    /**
     * 根据角色编码查询
     */
    @Select("SELECT * FROM sys_role WHERE code = #{code} AND deleted = 0")
    Role findByCode(@Param("code") String code);

    /**
     * 根据用户ID查询角色列表
     */
    @Select("SELECT r.* FROM sys_role r " +
            "INNER JOIN sys_user_role ur ON r.id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND r.deleted = 0")
    List<Role> findByUserId(@Param("userId") Long userId);

    /**
     * 查询所有启用的角色
     */
    @Select("SELECT * FROM sys_role WHERE status = 1 AND deleted = 0 ORDER BY sort")
    List<Role> findAllEnabled();
}