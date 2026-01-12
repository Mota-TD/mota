package com.mota.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.user.entity.Permission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 权限Mapper
 * 
 * @author mota
 */
@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {

    /**
     * 根据权限编码查询
     */
    @Select("SELECT * FROM sys_permission WHERE code = #{code} AND deleted = 0")
    Permission findByCode(@Param("code") String code);

    /**
     * 根据角色ID查询权限列表
     */
    @Select("SELECT p.* FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "WHERE rp.role_id = #{roleId} AND p.deleted = 0")
    List<Permission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 根据用户ID查询权限列表
     */
    @Select("SELECT DISTINCT p.* FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "INNER JOIN sys_user_role ur ON rp.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND p.deleted = 0")
    List<Permission> findByUserId(@Param("userId") Long userId);

    /**
     * 根据父ID查询子权限列表
     */
    @Select("SELECT * FROM sys_permission WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort")
    List<Permission> findByParentId(@Param("parentId") Long parentId);

    /**
     * 查询所有菜单权限（type = 1 或 2）
     */
    @Select("SELECT * FROM sys_permission WHERE type IN (1, 2) AND deleted = 0 ORDER BY sort")
    List<Permission> findAllMenus();

    /**
     * 根据用户ID查询权限标识列表
     */
    @Select("SELECT DISTINCT p.perms FROM sys_permission p " +
            "INNER JOIN sys_role_permission rp ON p.id = rp.permission_id " +
            "INNER JOIN sys_user_role ur ON rp.role_id = ur.role_id " +
            "WHERE ur.user_id = #{userId} AND p.deleted = 0 AND p.perms IS NOT NULL AND p.perms != ''")
    List<String> findPermsByUserId(@Param("userId") Long userId);
}