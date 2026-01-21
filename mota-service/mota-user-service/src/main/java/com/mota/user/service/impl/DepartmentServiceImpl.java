package com.mota.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.user.entity.Department;
import com.mota.user.mapper.DepartmentMapper;
import com.mota.user.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 部门服务实现
 * 
 * @author mota
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentMapper departmentMapper;

    @Override
    public Department getById(Long id) {
        return departmentMapper.selectById(id);
    }

    @Override
    public List<Department> listAll() {
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Department::getDeleted, 0)
               .orderByAsc(Department::getSort);
        return departmentMapper.selectList(wrapper);
    }

    @Override
    public List<Department> listByOrgId(String orgId) {
        // 如果是 "default"，返回当前用户所属组织的部门
        if ("default".equals(orgId)) {
            orgId = UserContext.getOrgId();
        }
        
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Department::getDeleted, 0)
               .orderByAsc(Department::getSort);
        
        // 如果有租户ID，会自动过滤
        return departmentMapper.selectList(wrapper);
    }

    @Override
    public List<Department> listTopLevel() {
        return departmentMapper.findTopLevel();
    }

    @Override
    public List<Department> listByParentId(Long parentId) {
        return departmentMapper.findByParentId(parentId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Department create(Department department) {
        // 设置默认值
        if (department.getParentId() == null) {
            department.setParentId(0L);
        }
        if (department.getLevel() == null) {
            department.setLevel(1);
        }
        if (department.getSort() == null) {
            department.setSort(0);
        }
        if (department.getStatus() == null) {
            department.setStatus(1);
        }
        
        // 设置祖级列表
        if (department.getParentId() == 0L) {
            department.setAncestors("0");
        } else {
            Department parent = departmentMapper.selectById(department.getParentId());
            if (parent == null) {
                throw new BusinessException("父部门不存在");
            }
            department.setAncestors(parent.getAncestors() + "," + parent.getId());
            department.setLevel(parent.getLevel() + 1);
        }
        
        departmentMapper.insert(department);
        return department;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Department update(Department department) {
        Department existing = departmentMapper.selectById(department.getId());
        if (existing == null) {
            throw new BusinessException("部门不存在");
        }
        
        departmentMapper.updateById(department);
        return departmentMapper.selectById(department.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        // 检查是否有子部门
        List<Department> children = departmentMapper.findByParentId(id);
        if (!children.isEmpty()) {
            throw new BusinessException("存在子部门，无法删除");
        }
        
        departmentMapper.deleteById(id);
    }

    @Override
    public List<Department> getDepartmentTree() {
        List<Department> allDepts = listAll();
        return buildTree(allDepts);
    }

    /**
     * 构建部门树
     */
    private List<Department> buildTree(List<Department> departments) {
        Map<Long, List<Department>> parentMap = departments.stream()
                .collect(Collectors.groupingBy(Department::getParentId));
        
        List<Department> roots = parentMap.getOrDefault(0L, new ArrayList<>());
        
        // 递归设置子部门（这里简化处理，实际可能需要DTO来包含children字段）
        return roots;
    }
}