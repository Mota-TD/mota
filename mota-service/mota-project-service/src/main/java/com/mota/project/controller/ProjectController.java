package com.mota.project.controller;

import com.mota.common.core.result.Result;
import com.mota.project.entity.Project;
import com.mota.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 项目控制器
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * 获取项目列表
     */
    @GetMapping
    public Result<List<Project>> list(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status) {
        List<Project> projects = projectService.getProjectList(keyword, status);
        return Result.success(projects);
    }

    /**
     * 获取项目详情
     */
    @GetMapping("/{id}")
    public Result<Project> detail(@PathVariable("id") Long id) {
        Project project = projectService.getProjectDetail(id);
        return Result.success(project);
    }

    /**
     * 创建项目
     */
    @PostMapping
    public Result<Project> create(@RequestBody Project project) {
        Project created = projectService.createProject(project);
        return Result.success(created);
    }

    /**
     * 更新项目
     */
    @PutMapping("/{id}")
    public Result<Project> update(@PathVariable("id") Long id, @RequestBody Project project) {
        Project updated = projectService.updateProject(id, project);
        return Result.success(updated);
    }

    /**
     * 删除项目
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        projectService.deleteProject(id);
        return Result.success();
    }

    /**
     * 切换收藏状态
     */
    @PostMapping("/{id}/star")
    public Result<Void> toggleStar(@PathVariable("id") Long id) {
        projectService.toggleStar(id);
        return Result.success();
    }
}