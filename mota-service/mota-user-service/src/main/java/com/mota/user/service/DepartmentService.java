package com.mota.user.service;

import com.mota.user.entity.Department;

import java.util.List;

/**
 * 部门服务接口
 * 
 * @author mota
 */
public interface DepartmentService {

    /**
     * 根据ID查询部门
     */
    Department getById(Long id);

    /**
     * 查询所有部门列表
     */
    List<Department> listAll();

    /**
     * 根据组织ID查询部门列表
     */
    List<Department> listByOrgId(String orgId);

    /**
     * 查询顶级部门列表
     */
    List<Department> listTopLevel();

    /**
     * 根据父ID查询子部门列表
     */
    List<Department> listByParentId(Long parentId);

    /**
     * 创建部门
     */
    Department create(Department department);

    /**
     * 更新部门
     */
    Department update(Department department);

    /**
     * 删除部门
     */
    void delete(Long id);

    /**
     * 获取部门树形结构
     */
    List<Department> getDepartmentTree();
}