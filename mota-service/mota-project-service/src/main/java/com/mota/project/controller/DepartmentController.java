package com.mota.project.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.result.Result;
import com.mota.project.entity.Department;
import com.mota.project.mapper.DepartmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 部门控制器
 */
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentMapper departmentMapper;

    /**
     * 获取部门列表
     */
    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam(value = "orgId", required = false) String orgId,
            @RequestParam(value = "status", required = false) Integer status) {
        
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        
        if (orgId != null && !orgId.isEmpty()) {
            wrapper.eq(Department::getOrgId, orgId);
        }
        if (status != null) {
            wrapper.eq(Department::getStatus, status);
        }
        
        wrapper.orderByAsc(Department::getSortOrder);
        
        List<Department> departments = departmentMapper.selectList(wrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("list", departments);
        result.put("total", departments.size());
        
        return Result.success(result);
    }

    /**
     * 根据组织ID获取部门列表
     */
    @GetMapping("/org/{orgId}")
    public Result<List<Department>> getByOrgId(@PathVariable("orgId") String orgId) {
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Department::getOrgId, orgId);
        wrapper.orderByAsc(Department::getSortOrder);
        
        List<Department> departments = departmentMapper.selectList(wrapper);
        return Result.success(departments);
    }

    /**
     * 获取部门树形结构
     */
    @GetMapping("/tree/{orgId}")
    public Result<List<Map<String, Object>>> getTree(@PathVariable("orgId") String orgId) {
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Department::getOrgId, orgId);
        wrapper.orderByAsc(Department::getSortOrder);
        
        List<Department> departments = departmentMapper.selectList(wrapper);
        
        // 构建树形结构
        List<Map<String, Object>> tree = buildTree(departments, null);
        
        return Result.success(tree);
    }

    /**
     * 获取部门详情
     */
    @GetMapping("/{id}")
    public Result<Department> detail(@PathVariable("id") Long id) {
        Department department = departmentMapper.selectById(id);
        return Result.success(department);
    }

    /**
     * 创建部门
     */
    @PostMapping
    public Result<Department> create(@RequestBody Department department) {
        if (department.getSortOrder() == null) {
            department.setSortOrder(0);
        }
        if (department.getStatus() == null) {
            department.setStatus(1);
        }
        departmentMapper.insert(department);
        return Result.success(department);
    }

    /**
     * 更新部门
     */
    @PutMapping("/{id}")
    public Result<Department> update(@PathVariable("id") Long id, @RequestBody Department department) {
        department.setId(id);
        departmentMapper.updateById(department);
        Department updated = departmentMapper.selectById(id);
        return Result.success(updated);
    }

    /**
     * 删除部门
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        departmentMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 获取部门成员列表
     */
    @GetMapping("/{departmentId}/members")
    public Result<List<Map<String, Object>>> getMembers(@PathVariable("departmentId") Long departmentId) {
        // 返回模拟数据
        List<Map<String, Object>> members = new ArrayList<>();
        members.add(Map.of(
            "id", 1,
            "name", "张三",
            "avatar", "",
            "role", "部门经理",
            "email", "zhangsan@example.com"
        ));
        members.add(Map.of(
            "id", 2,
            "name", "李四",
            "avatar", "",
            "role", "开发工程师",
            "email", "lisi@example.com"
        ));
        members.add(Map.of(
            "id", 3,
            "name", "王五",
            "avatar", "",
            "role", "测试工程师",
            "email", "wangwu@example.com"
        ));
        
        return Result.success(members);
    }

    /**
     * 构建树形结构
     */
    private List<Map<String, Object>> buildTree(List<Department> departments, Long parentId) {
        return departments.stream()
            .filter(dept -> {
                if (parentId == null) {
                    return dept.getParentId() == null || dept.getParentId() == 0;
                }
                return parentId.equals(dept.getParentId());
            })
            .map(dept -> {
                Map<String, Object> node = new HashMap<>();
                node.put("id", dept.getId());
                node.put("orgId", dept.getOrgId());
                node.put("name", dept.getName());
                node.put("description", dept.getDescription());
                node.put("managerId", dept.getManagerId());
                node.put("parentId", dept.getParentId());
                node.put("sortOrder", dept.getSortOrder());
                node.put("status", dept.getStatus() == 1 ? "active" : "inactive");
                
                List<Map<String, Object>> children = buildTree(departments, dept.getId());
                if (!children.isEmpty()) {
                    node.put("children", children);
                }
                
                return node;
            })
            .collect(Collectors.toList());
    }
}