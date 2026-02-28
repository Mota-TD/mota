package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.dto.request.CreateProjectRequest;
import com.mota.project.dto.request.ProjectQueryRequest;
import com.mota.project.dto.request.UpdateProjectRequest;
import com.mota.project.dto.response.ProjectDetailResponse;
import com.mota.project.dto.response.ProjectListResponse;
import com.mota.project.entity.DepartmentTask;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.Project;
import com.mota.project.entity.MilestoneAssignee;
import com.mota.project.entity.ProjectDepartment;
import com.mota.project.entity.ProjectMember;
import com.mota.project.mapper.DepartmentTaskMapper;
import com.mota.project.mapper.MilestoneAssigneeMapper;
import com.mota.project.mapper.MilestoneMapper;
import com.mota.project.mapper.ProjectMapper;
import com.mota.project.mapper.ProjectMemberMapper;
import com.mota.project.service.ProjectService;
import com.mota.project.service.TaskCalendarSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 项目服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {

    private final ProjectMemberMapper projectMemberMapper;
    private final MilestoneMapper milestoneMapper;
    private final MilestoneAssigneeMapper milestoneAssigneeMapper;
    private final DepartmentTaskMapper departmentTaskMapper;
    private final TaskCalendarSyncService taskCalendarSyncService;

    // ==================== 项目基础操作 ====================

    @Override
    public List<Project> getProjectList(String keyword, String status) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Project::getName, keyword)
                   .or()
                   .like(Project::getKey, keyword);
        }
        
        if (StringUtils.hasText(status)) {
            wrapper.eq(Project::getStatus, status);
        } else {
            // 默认不显示归档项目
            wrapper.ne(Project::getStatus, Project.Status.ARCHIVED);
        }
        
        wrapper.orderByDesc(Project::getCreatedAt);
        
        return list(wrapper);
    }

    @Override
    public ProjectListResponse getProjectList(ProjectQueryRequest query) {
        // 使用自定义查询
        List<Project> projects = baseMapper.selectProjectList(query);
        long total = baseMapper.countProjects(query);
        
        ProjectListResponse response = new ProjectListResponse();
        response.setTotal(total);
        response.setPage(query.getPage());
        response.setPageSize(query.getPageSize());
        
        List<ProjectListResponse.ProjectItem> items = projects.stream()
                .map(this::convertToListItem)
                .collect(Collectors.toList());
        response.setList(items);
        
        return response;
    }

    @Override
    public Project getProjectDetail(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        return project;
    }

    @Override
    public ProjectDetailResponse getProjectDetailFull(Long id) {
        log.debug("获取项目详情, projectId: {}", id);
        
        Project project = getProjectDetail(id);
        
        ProjectDetailResponse response = new ProjectDetailResponse();
        BeanUtils.copyProperties(project, response);
        
        // 获取项目成员
        try {
            List<ProjectMember> members = projectMemberMapper.selectByProjectId(id);
            response.setMembers(convertToMemberInfoList(members));
            log.debug("获取项目成员成功, count: {}", members != null ? members.size() : 0);
        } catch (Exception e) {
            log.error("获取项目成员失败, projectId: {}, error: {}", id, e.getMessage(), e);
            response.setMembers(new ArrayList<>());
        }
        
        // 获取里程碑
        try {
            List<Milestone> milestones = milestoneMapper.selectByProjectId(id);
            response.setMilestones(convertToMilestoneInfoList(milestones));
            log.debug("获取里程碑成功, count: {}", milestones != null ? milestones.size() : 0);
        } catch (Exception e) {
            log.error("获取里程碑失败, projectId: {}, error: {}", id, e.getMessage(), e);
            response.setMilestones(new ArrayList<>());
        }
        
        // 获取统计信息
        try {
            response.setStatistics(getProjectStatistics(id));
            log.debug("获取统计信息成功");
        } catch (Exception e) {
            log.error("获取统计信息失败, projectId: {}, error: {}", id, e.getMessage(), e);
            // 返回默认统计信息
            ProjectDetailResponse.ProjectStatistics defaultStats = new ProjectDetailResponse.ProjectStatistics();
            defaultStats.setTotalTasks(0);
            defaultStats.setCompletedTasks(0);
            defaultStats.setInProgressTasks(0);
            defaultStats.setPendingTasks(0);
            defaultStats.setOverdueTasks(0);
            defaultStats.setDepartmentTaskCount(0);
            defaultStats.setTotalMilestones(0);
            defaultStats.setCompletedMilestones(0);
            defaultStats.setCompletionRate(0.0);
            response.setStatistics(defaultStats);
        }
        
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project createProject(Project project) {
        // 自动生成项目标识（格式：AF-0000）
        String generatedKey = generateProjectKey();
        project.setKey(generatedKey);
        
        // 设置默认值
        // 设置租户ID（当前系统暂时使用默认租户0）
        if (project.getTenantId() == null) {
            project.setTenantId(0L);
        }
        if (!StringUtils.hasText(project.getOrgId())) {
            project.setOrgId("default");
        }
        if (!StringUtils.hasText(project.getStatus())) {
            project.setStatus(Project.Status.ACTIVE);
        }
        if (project.getProgress() == null) {
            project.setProgress(0);
        }
        if (project.getMemberCount() == null) {
            project.setMemberCount(1);
        }
        if (project.getIssueCount() == null) {
            project.setIssueCount(0);
        }
        if (project.getStarred() == null) {
            project.setStarred(0);
        }
        if (!StringUtils.hasText(project.getPriority())) {
            project.setPriority(Project.Priority.MEDIUM);
        }
        if (!StringUtils.hasText(project.getVisibility())) {
            project.setVisibility(Project.Visibility.PRIVATE);
        }
        
        // 设置负责人ID，暂时使用默认值1（后续应从当前登录用户获取）
        if (project.getOwnerId() == null) {
            project.setOwnerId(1L);
        }
        
        save(project);
        
        // 将负责人添加为项目成员
        addProjectMember(project.getId(), project.getOwnerId(), ProjectMember.Role.OWNER, null);
        
        return project;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project createProject(CreateProjectRequest request) {
        // 自动生成项目标识（格式：AF-0000）
        String generatedKey = generateProjectKey();
        
        // 创建项目实体
        Project project = new Project();
        project.setName(request.getName());
        project.setKey(generatedKey);
        project.setDescription(request.getDescription());
        project.setColor(request.getColor());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setOwnerId(request.getOwnerId() != null ? request.getOwnerId() : 1L);
        project.setPriority(StringUtils.hasText(request.getPriority()) ? request.getPriority() : Project.Priority.MEDIUM);
        project.setVisibility(StringUtils.hasText(request.getVisibility()) ? request.getVisibility() : Project.Visibility.PRIVATE);
        
        // 设置默认值
        // 设置租户ID（当前系统暂时使用默认租户0）
        project.setTenantId(0L);
        project.setOrgId("default");
        project.setStatus(Project.Status.ACTIVE);
        project.setProgress(0);
        project.setMemberCount(0);
        project.setIssueCount(0);
        project.setStarred(0);
        
        save(project);
        
        // 将负责人添加为项目成员
        addProjectMember(project.getId(), project.getOwnerId(), ProjectMember.Role.OWNER, null);
        
        // 添加项目成员
        if (!CollectionUtils.isEmpty(request.getMemberIds())) {
            for (Long memberId : request.getMemberIds()) {
                if (!memberId.equals(project.getOwnerId())) {
                    addProjectMember(project.getId(), memberId, ProjectMember.Role.MEMBER, null);
                }
            }
        }
        
        // 添加里程碑
        if (!CollectionUtils.isEmpty(request.getMilestones())) {
            int sortOrder = 0;
            for (CreateProjectRequest.MilestoneRequest milestoneReq : request.getMilestones()) {
                Milestone milestone = new Milestone();
                milestone.setProjectId(project.getId());
                milestone.setName(milestoneReq.getName());
                milestone.setDescription(milestoneReq.getDescription());
                milestone.setTargetDate(milestoneReq.getTargetDate());
                milestone.setStatus(Milestone.Status.PENDING);
                milestone.setSortOrder(sortOrder++);
                milestone.setDepartmentTaskCount(0);
                milestone.setCompletedDepartmentTaskCount(0);
                milestoneMapper.insert(milestone);
                
                // 添加里程碑负责人
                if (!CollectionUtils.isEmpty(milestoneReq.getAssigneeIds())) {
                    boolean isFirst = true;
                    for (Long assigneeId : milestoneReq.getAssigneeIds()) {
                        MilestoneAssignee assignee = new MilestoneAssignee();
                        assignee.setMilestoneId(milestone.getId());
                        assignee.setUserId(assigneeId);
                        assignee.setIsPrimary(isFirst);  // 第一个负责人为主负责人
                        assignee.setAssignedAt(LocalDateTime.now());
                        assignee.setAssignedBy(project.getOwnerId());
                        milestoneAssigneeMapper.insert(assignee);
                        isFirst = false;
                    }
                }
                
                // 创建部门任务分配
                if (!CollectionUtils.isEmpty(milestoneReq.getDepartmentTasks())) {
                    int departmentTaskCount = 0;
                    for (CreateProjectRequest.DepartmentTaskAssignment taskAssignment : milestoneReq.getDepartmentTasks()) {
                        DepartmentTask departmentTask = new DepartmentTask();
                        departmentTask.setProjectId(project.getId());
                        departmentTask.setMilestoneId(milestone.getId());
                        departmentTask.setDepartmentId(taskAssignment.getDepartmentId());
                        departmentTask.setManagerId(taskAssignment.getManagerId());
                        
                        // 任务名称：如果未指定，使用里程碑名称
                        String taskName = StringUtils.hasText(taskAssignment.getName())
                            ? taskAssignment.getName()
                            : milestone.getName();
                        departmentTask.setName(taskName);
                        
                        departmentTask.setDescription(taskAssignment.getDescription());
                        departmentTask.setStatus(DepartmentTask.Status.PENDING);
                        departmentTask.setPriority(StringUtils.hasText(taskAssignment.getPriority())
                            ? taskAssignment.getPriority()
                            : DepartmentTask.Priority.MEDIUM);
                        
                        // 日期：如果未指定，使用项目日期或里程碑目标日期
                        departmentTask.setStartDate(taskAssignment.getStartDate() != null
                            ? taskAssignment.getStartDate()
                            : project.getStartDate());
                        departmentTask.setEndDate(taskAssignment.getEndDate() != null
                            ? taskAssignment.getEndDate()
                            : (milestone.getTargetDate() != null ? milestone.getTargetDate() : project.getEndDate()));
                        
                        departmentTask.setProgress(0);
                        departmentTask.setRequirePlan(taskAssignment.getRequirePlan() != null && taskAssignment.getRequirePlan() ? 1 : 0);
                        departmentTask.setRequireApproval(taskAssignment.getRequireApproval() != null && taskAssignment.getRequireApproval() ? 1 : 0);
                        
                        departmentTaskMapper.insert(departmentTask);
                        departmentTaskCount++;
                        
                        // 为部门任务创建日历事件（如果有负责人）
                        if (departmentTask.getManagerId() != null) {
                            try {
                                taskCalendarSyncService.createEventForDepartmentTask(departmentTask);
                            } catch (Exception e) {
                                // 日历事件创建失败不影响主流程
                                log.warn("创建部门任务日历事件失败: {}", e.getMessage());
                            }
                        }
                    }
                    
                    // 更新里程碑的部门任务计数
                    if (departmentTaskCount > 0) {
                        milestone.setDepartmentTaskCount(departmentTaskCount);
                        milestoneMapper.updateById(milestone);
                    }
                }
            }
        }
        
        // 刷新成员数量
        refreshMemberCount(project.getId());
        
        return project;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project updateProject(Long id, Project project) {
        Project existing = getById(id);
        if (existing == null) {
            throw new BusinessException("项目不存在");
        }
        
        // 项目标识不允许修改，保持原有值
        project.setKey(existing.getKey());
        
        project.setId(id);
        updateById(project);
        return getById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project updateProject(Long id, UpdateProjectRequest request) {
        Project existing = getById(id);
        if (existing == null) {
            throw new BusinessException("项目不存在");
        }
        
        // 更新字段
        if (StringUtils.hasText(request.getName())) {
            existing.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getColor())) {
            existing.setColor(request.getColor());
        }
        if (StringUtils.hasText(request.getStatus())) {
            existing.setStatus(request.getStatus());
        }
        if (request.getStartDate() != null) {
            existing.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            existing.setEndDate(request.getEndDate());
        }
        if (request.getOwnerId() != null) {
            existing.setOwnerId(request.getOwnerId());
        }
        if (StringUtils.hasText(request.getPriority())) {
            existing.setPriority(request.getPriority());
        }
        if (StringUtils.hasText(request.getVisibility())) {
            existing.setVisibility(request.getVisibility());
        }
        if (request.getProgress() != null) {
            existing.setProgress(request.getProgress());
        }
        
        updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProject(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void toggleStar(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        
        project.setStarred(project.getStarred() == 1 ? 0 : 1);
        updateById(project);
    }

    // ==================== 项目生命周期管理 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void archiveProject(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        if (Project.Status.ARCHIVED.equals(project.getStatus())) {
            throw new BusinessException("项目已归档");
        }
        
        // TODO: 从当前登录用户获取
        Long currentUserId = 1L;
        baseMapper.archiveProject(id, currentUserId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreProject(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        if (!Project.Status.ARCHIVED.equals(project.getStatus())) {
            throw new BusinessException("项目未归档");
        }
        
        baseMapper.restoreProject(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProjectStatus(Long id, String status) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        
        project.setStatus(status);
        updateById(project);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProjectProgress(Long id, Integer progress) {
        if (progress < 0 || progress > 100) {
            throw new BusinessException("进度值必须在0-100之间");
        }
        baseMapper.updateProjectProgress(id, progress);
    }

    @Override
    public List<Project> getArchivedProjects() {
        return baseMapper.selectArchivedProjects(null);
    }

    // ==================== 项目成员管理 ====================

    @Override
    public List<ProjectMember> getProjectMembers(Long projectId) {
        return projectMemberMapper.selectByProjectId(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addProjectMember(Long projectId, Long userId, String role, Long departmentId) {
        // 检查是否已是成员
        ProjectMember existing = projectMemberMapper.selectByProjectIdAndUserId(projectId, userId);
        if (existing != null) {
            throw new BusinessException("用户已是项目成员");
        }
        
        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(userId);
        member.setRole(StringUtils.hasText(role) ? role : ProjectMember.Role.MEMBER);
        member.setDepartmentId(departmentId);
        member.setJoinedAt(LocalDateTime.now());
        
        projectMemberMapper.insert(member);
        
        // 更新成员数量
        refreshMemberCount(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addProjectMembers(Long projectId, List<Long> userIds, String role) {
        for (Long userId : userIds) {
            try {
                addProjectMember(projectId, userId, role, null);
            } catch (BusinessException e) {
                // 忽略已存在的成员
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeProjectMember(Long projectId, Long userId) {
        ProjectMember member = projectMemberMapper.selectByProjectIdAndUserId(projectId, userId);
        if (member == null) {
            throw new BusinessException("用户不是项目成员");
        }
        
        // 不能移除项目负责人
        Project project = getById(projectId);
        if (project != null && project.getOwnerId().equals(userId)) {
            throw new BusinessException("不能移除项目负责人");
        }
        
        projectMemberMapper.deleteById(member.getId());
        
        // 更新成员数量
        refreshMemberCount(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMemberRole(Long projectId, Long userId, String role) {
        ProjectMember member = projectMemberMapper.selectByProjectIdAndUserId(projectId, userId);
        if (member == null) {
            throw new BusinessException("用户不是项目成员");
        }
        
        member.setRole(role);
        projectMemberMapper.updateById(member);
    }

    @Override
    public boolean isProjectMember(Long projectId, Long userId) {
        ProjectMember member = projectMemberMapper.selectByProjectIdAndUserId(projectId, userId);
        return member != null;
    }

    @Override
    public String getUserProjectRole(Long projectId, Long userId) {
        ProjectMember member = projectMemberMapper.selectByProjectIdAndUserId(projectId, userId);
        return member != null ? member.getRole() : null;
    }

    // ==================== 项目里程碑管理 ====================

    @Override
    public List<Milestone> getProjectMilestones(Long projectId) {
        return milestoneMapper.selectByProjectId(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone addMilestone(Long projectId, Milestone milestone) {
        Project project = getById(projectId);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        
        milestone.setProjectId(projectId);
        if (!StringUtils.hasText(milestone.getStatus())) {
            milestone.setStatus(Milestone.Status.PENDING);
        }
        
        milestoneMapper.insert(milestone);
        return milestone;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Milestone updateMilestone(Long milestoneId, Milestone milestone) {
        Milestone existing = milestoneMapper.selectById(milestoneId);
        if (existing == null) {
            throw new BusinessException("里程碑不存在");
        }
        
        if (StringUtils.hasText(milestone.getName())) {
            existing.setName(milestone.getName());
        }
        if (milestone.getDescription() != null) {
            existing.setDescription(milestone.getDescription());
        }
        if (milestone.getTargetDate() != null) {
            existing.setTargetDate(milestone.getTargetDate());
        }
        if (StringUtils.hasText(milestone.getStatus())) {
            existing.setStatus(milestone.getStatus());
        }
        if (milestone.getSortOrder() != null) {
            existing.setSortOrder(milestone.getSortOrder());
        }
        
        milestoneMapper.updateById(existing);
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMilestone(Long milestoneId) {
        Milestone milestone = milestoneMapper.selectById(milestoneId);
        if (milestone == null) {
            throw new BusinessException("里程碑不存在");
        }
        milestoneMapper.deleteById(milestoneId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeMilestone(Long milestoneId) {
        Milestone milestone = milestoneMapper.selectById(milestoneId);
        if (milestone == null) {
            throw new BusinessException("里程碑不存在");
        }
        
        milestone.setStatus(Milestone.Status.COMPLETED);
        milestone.setCompletedAt(LocalDateTime.now());
        milestoneMapper.updateById(milestone);
    }

    // ==================== 项目统计 ====================

    @Override
    public ProjectDetailResponse.ProjectStatistics getProjectStatistics(Long projectId) {
        log.debug("获取项目统计信息, projectId: {}", projectId);
        
        Map<String, Object> stats = baseMapper.getProjectStatistics(projectId);
        log.debug("统计信息原始数据: {}", stats);
        
        ProjectDetailResponse.ProjectStatistics statistics = new ProjectDetailResponse.ProjectStatistics();
        
        // 处理空值情况
        if (stats == null || stats.isEmpty()) {
            log.warn("项目统计信息为空, projectId: {}", projectId);
            statistics.setTotalTasks(0);
            statistics.setCompletedTasks(0);
            statistics.setInProgressTasks(0);
            statistics.setPendingTasks(0);
            statistics.setOverdueTasks(0);
            statistics.setDepartmentTaskCount(0);
            statistics.setTotalMilestones(0);
            statistics.setCompletedMilestones(0);
            statistics.setCompletionRate(0.0);
            return statistics;
        }
        
        statistics.setTotalTasks(getIntValue(stats, "totalTasks"));
        statistics.setCompletedTasks(getIntValue(stats, "completedTasks"));
        statistics.setInProgressTasks(getIntValue(stats, "inProgressTasks"));
        statistics.setPendingTasks(getIntValue(stats, "pendingTasks"));
        statistics.setOverdueTasks(getIntValue(stats, "overdueTasks"));
        statistics.setDepartmentTaskCount(getIntValue(stats, "departmentTaskCount"));
        statistics.setTotalMilestones(getIntValue(stats, "totalMilestones"));
        statistics.setCompletedMilestones(getIntValue(stats, "completedMilestones"));
        
        // 计算完成率
        int total = statistics.getTotalTasks();
        int completed = statistics.getCompletedTasks();
        statistics.setCompletionRate(total > 0 ? (double) completed / total * 100 : 0.0);
        
        return statistics;
    }

    @Override
    public List<Project> getUserProjects(Long userId) {
        return baseMapper.selectProjectsByUserId(userId, false);
    }

    @Override
    public List<Project> getStarredProjects() {
        // TODO: 从当前登录用户获取
        Long currentUserId = 1L;
        return baseMapper.selectStarredProjects(currentUserId);
    }

    @Override
    public List<Project> getRecentProjects(Integer limit) {
        // TODO: 从当前登录用户获取
        Long currentUserId = 1L;
        return baseMapper.selectRecentProjects(currentUserId, limit != null ? limit : 10);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void refreshMemberCount(Long projectId) {
        baseMapper.updateMemberCount(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void refreshIssueCount(Long projectId) {
        baseMapper.updateIssueCount(projectId);
    }

    // ==================== 私有辅助方法 ====================

    private ProjectListResponse.ProjectItem convertToListItem(Project project) {
        ProjectListResponse.ProjectItem item = new ProjectListResponse.ProjectItem();
        BeanUtils.copyProperties(project, item);
        return item;
    }

    private List<ProjectDetailResponse.ProjectMemberInfo> convertToMemberInfoList(List<ProjectMember> members) {
        if (CollectionUtils.isEmpty(members)) {
            return new ArrayList<>();
        }
        return members.stream().map(member -> {
            ProjectDetailResponse.ProjectMemberInfo info = new ProjectDetailResponse.ProjectMemberInfo();
            info.setId(member.getId());
            info.setUserId(member.getUserId());
            info.setRole(member.getRole());
            info.setDepartmentId(member.getDepartmentId());
            info.setJoinedAt(member.getJoinedAt());
            // TODO: 从用户服务获取用户名和头像
            return info;
        }).collect(Collectors.toList());
    }

    private List<ProjectDetailResponse.MilestoneInfo> convertToMilestoneInfoList(List<Milestone> milestones) {
        if (CollectionUtils.isEmpty(milestones)) {
            return new ArrayList<>();
        }
        return milestones.stream().map(milestone -> {
            ProjectDetailResponse.MilestoneInfo info = new ProjectDetailResponse.MilestoneInfo();
            info.setId(milestone.getId());
            info.setName(milestone.getName());
            info.setDescription(milestone.getDescription());
            info.setTargetDate(milestone.getTargetDate());
            info.setStatus(milestone.getStatus());
            info.setCompletedAt(milestone.getCompletedAt());
            info.setSortOrder(milestone.getSortOrder());
            return info;
        }).collect(Collectors.toList());
    }

    private Integer getIntValue(Map<String, Object> map, String key) {
        // 首先尝试直接获取
        Object value = map.get(key);
        
        // 如果为空，尝试小写键名（MySQL可能返回小写的列别名）
        if (value == null) {
            value = map.get(key.toLowerCase());
        }
        
        // 如果还是为空，遍历查找（大小写不敏感）
        if (value == null) {
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                if (entry.getKey().equalsIgnoreCase(key)) {
                    value = entry.getValue();
                    break;
                }
            }
        }
        
        if (value == null) {
            return 0;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }

    /**
     * 生成项目标识
     * 格式：AF-0000，从0001开始递增
     */
    private synchronized String generateProjectKey() {
        Integer maxSequence = baseMapper.getMaxProjectKeySequence();
        int nextSequence = (maxSequence == null ? 0 : maxSequence) + 1;
        return String.format("AF-%04d", nextSequence);
    }

    @Override
    public String getNextProjectKey() {
        return generateProjectKey();
    }
}