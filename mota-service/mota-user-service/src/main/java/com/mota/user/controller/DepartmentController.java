package com.mota.user.controller;

import com.mota.common.core.result.Result;
import com.mota.user.entity.Department;
import com.mota.user.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 部门管理控制器
 * 
 * @author mota
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "部门管理", description = "部门管理相关接口")
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    @Operation(summary = "获取部门列表")
    public Result<List<Department>> list() {
        List<Department> departments = departmentService.listAll();
        return Result.success(departments);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取部门详情")
    public Result<Department> getById(
            @Parameter(description = "部门ID") @PathVariable Long id) {
        Department department = departmentService.getById(id);
        return Result.success(department);
    }

    @GetMapping("/org/{orgId}")
    @Operation(summary = "根据组织ID获取部门列表")
    public Result<List<Department>> listByOrgId(
            @Parameter(description = "组织ID，传 'default' 表示当前用户所属组织") @PathVariable String orgId) {
        List<Department> departments = departmentService.listByOrgId(orgId);
        return Result.success(departments);
    }

    @GetMapping("/top-level")
    @Operation(summary = "获取顶级部门列表")
    public Result<List<Department>> listTopLevel() {
        List<Department> departments = departmentService.listTopLevel();
        return Result.success(departments);
    }

    @GetMapping("/parent/{parentId}")
    @Operation(summary = "根据父ID获取子部门列表")
    public Result<List<Department>> listByParentId(
            @Parameter(description = "父部门ID") @PathVariable Long parentId) {
        List<Department> departments = departmentService.listByParentId(parentId);
        return Result.success(departments);
    }

    @GetMapping("/tree")
    @Operation(summary = "获取部门树形结构")
    public Result<List<Department>> getDepartmentTree() {
        List<Department> tree = departmentService.getDepartmentTree();
        return Result.success(tree);
    }

    @PostMapping
    @Operation(summary = "创建部门")
    public Result<Department> create(@RequestBody Department department) {
        Department created = departmentService.create(department);
        return Result.success(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新部门")
    public Result<Department> update(
            @Parameter(description = "部门ID") @PathVariable Long id,
            @RequestBody Department department) {
        department.setId(id);
        Department updated = departmentService.update(department);
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除部门")
    public Result<Void> delete(
            @Parameter(description = "部门ID") @PathVariable Long id) {
        departmentService.delete(id);
        return Result.success();
    }
}