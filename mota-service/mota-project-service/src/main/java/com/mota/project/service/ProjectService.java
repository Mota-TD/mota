package com.mota.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.dto.request.CreateProjectRequest;
import com.mota.project.dto.request.ProjectQueryRequest;
import com.mota.project.dto.request.UpdateProjectRequest;
import com.mota.project.dto.response.ProjectDetailResponse;
import com.mota.project.dto.response.ProjectListResponse;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.Project;
import com.mota.project.entity.ProjectMember;

import java.util.List;

/**
 * 项目服务接口
 */
public interface ProjectService extends IService<Project> {

    // ==================== 项目基础操作 ====================

    /**
     * 获取项目列表（简单查询，兼容旧接口）
     */
    List<Project> getProjectList(String keyword, String status);

    /**
     * 获取项目列表（高级查询）
     */
    ProjectListResponse getProjectList(ProjectQueryRequest query);

    /**
     * 获取项目详情（简单）
     */
    Project getProjectDetail(Long id);

    /**
     * 获取项目详情（完整信息）
     */
    ProjectDetailResponse getProjectDetailFull(Long id);

    /**
     * 创建项目（简单，兼容旧接口）
     */
    Project createProject(Project project);

    /**
     * 创建项目（完整流程）
     */
    Project createProject(CreateProjectRequest request);

    /**
     * 更新项目（简单，兼容旧接口）
     */
    Project updateProject(Long id, Project project);

    /**
     * 更新项目（完整）
     */
    Project updateProject(Long id, UpdateProjectRequest request);

    /**
     * 删除项目
     */
    void deleteProject(Long id);

    /**
     * 切换收藏状态
     */
    void toggleStar(Long id);

    // ==================== 项目生命周期管理 ====================

    /**
     * 归档项目
     */
    void archiveProject(Long id);

    /**
     * 恢复归档项目
     */
    void restoreProject(Long id);

    /**
     * 更新项目状态
     */
    void updateProjectStatus(Long id, String status);

    /**
     * 更新项目进度
     */
    void updateProjectProgress(Long id, Integer progress);

    /**
     * 获取归档项目列表
     */
    List<Project> getArchivedProjects();

    // ==================== 项目成员管理 ====================

    /**
     * 获取项目成员列表
     */
    List<ProjectMember> getProjectMembers(Long projectId);

    /**
     * 添加项目成员
     */
    void addProjectMember(Long projectId, Long userId, String role, Long departmentId);

    /**
     * 批量添加项目成员
     */
    void addProjectMembers(Long projectId, List<Long> userIds, String role);

    /**
     * 移除项目成员
     */
    void removeProjectMember(Long projectId, Long userId);

    /**
     * 更新成员角色
     */
    void updateMemberRole(Long projectId, Long userId, String role);

    /**
     * 检查用户是否是项目成员
     */
    boolean isProjectMember(Long projectId, Long userId);

    /**
     * 获取用户在项目中的角色
     */
    String getUserProjectRole(Long projectId, Long userId);

    // ==================== 项目里程碑管理 ====================

    /**
     * 获取项目里程碑列表
     */
    List<Milestone> getProjectMilestones(Long projectId);

    /**
     * 添加里程碑
     */
    Milestone addMilestone(Long projectId, Milestone milestone);

    /**
     * 更新里程碑
     */
    Milestone updateMilestone(Long milestoneId, Milestone milestone);

    /**
     * 删除里程碑
     */
    void deleteMilestone(Long milestoneId);

    /**
     * 完成里程碑
     */
    void completeMilestone(Long milestoneId);

    // ==================== 项目统计 ====================

    /**
     * 获取项目统计信息
     */
    ProjectDetailResponse.ProjectStatistics getProjectStatistics(Long projectId);

    /**
     * 获取用户参与的项目列表
     */
    List<Project> getUserProjects(Long userId);

    /**
     * 获取收藏的项目列表
     */
    List<Project> getStarredProjects();

    /**
     * 获取最近访问的项目
     */
    List<Project> getRecentProjects(Integer limit);

    /**
     * 刷新项目成员数量
     */
    void refreshMemberCount(Long projectId);

    /**
     * 刷新项目任务数量
     */
    void refreshIssueCount(Long projectId);

    /**
     * 获取下一个项目标识
     * 格式：AF-0000，从0001开始递增
     */
    String getNextProjectKey();
}