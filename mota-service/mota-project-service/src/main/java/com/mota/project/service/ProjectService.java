package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.Project;

import java.util.List;

/**
 * 项目服务接口
 */
public interface ProjectService extends IService<Project> {

    /**
     * 获取项目列表
     */
    List<Project> getProjectList(String keyword, String status);

    /**
     * 获取项目详情
     */
    Project getProjectDetail(Long id);

    /**
     * 创建项目
     */
    Project createProject(Project project);

    /**
     * 更新项目
     */
    Project updateProject(Long id, Project project);

    /**
     * 删除项目
     */
    void deleteProject(Long id);

    /**
     * 切换收藏状态
     */
    void toggleStar(Long id);
}