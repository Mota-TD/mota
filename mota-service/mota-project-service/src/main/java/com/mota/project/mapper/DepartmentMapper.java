package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 部门 Mapper 接口
 */
@Mapper
public interface DepartmentMapper extends BaseMapper<Department> {

    /**
     * 根据组织ID查询部门列表
     */
    List<Department> selectByOrgId(@Param("orgId") String orgId);

    /**
     * 根据负责人ID查询部门列表
     */
    List<Department> selectByManagerId(@Param("managerId") Long managerId);
}