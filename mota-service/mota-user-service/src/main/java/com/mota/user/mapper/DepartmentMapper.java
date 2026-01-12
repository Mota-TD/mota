package com.mota.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.user.entity.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 部门Mapper
 * 
 * @author mota
 */
@Mapper
public interface DepartmentMapper extends BaseMapper<Department> {

    /**
     * 根据父ID查询子部门列表
     */
    @Select("SELECT * FROM sys_dept WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY sort")
    List<Department> findByParentId(@Param("parentId") Long parentId);

    /**
     * 根据部门编码查询
     */
    @Select("SELECT * FROM sys_dept WHERE code = #{code} AND deleted = 0")
    Department findByCode(@Param("code") String code);

    /**
     * 查询所有子部门ID（包含自身）
     */
    @Select("SELECT id FROM sys_dept WHERE FIND_IN_SET(#{deptId}, ancestors) OR id = #{deptId}")
    List<Long> findChildDeptIds(@Param("deptId") Long deptId);

    /**
     * 查询顶级部门列表
     */
    @Select("SELECT * FROM sys_dept WHERE parent_id = 0 AND deleted = 0 ORDER BY sort")
    List<Department> findTopLevel();
}