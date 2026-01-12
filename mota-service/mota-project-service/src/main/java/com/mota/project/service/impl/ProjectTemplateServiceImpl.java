package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mota.common.core.context.TenantContext;
import com.mota.common.core.context.UserContext;
import com.mota.common.core.exception.BusinessException;
import com.mota.common.kafka.producer.EventPublisher;
import com.mota.project.dto.request.CopyProjectRequest;
import com.mota.project.dto.request.CreateTemplateRequest;
import com.mota.project.entity.Milestone;
import com.mota.project.entity.Project;
import com.mota.project.entity.ProjectMember;
import com.mota.project.event.ProjectEvent;
import com.mota.project.mapper.MilestoneMapper;
import com.mota.project.mapper.ProjectMapper;
import com.mota.project.mapper.ProjectMemberMapper;
import com.mota.project.service.ProjectService;
import com.mota.project.service.ProjectTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 项目模板服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectTemplateServiceImpl implements ProjectTemplateService {

    private final ProjectMapper projectMapper;
    private final ProjectMemberMapper projectMemberMapper;
    private final MilestoneMapper milestoneMapper;
    private final ProjectService projectService;
    private final EventPublisher eventPublisher;

    @Override
    public List<Project> getTemplateList(String category) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Project::getIsTemplate, true)
               .eq(Project::getDeleted, 0);
        
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Project::getProjectType, category);
        }
        
        // 包含系统模板和当前租户的模板
        Long tenantId = TenantContext.getTenantId();
        wrapper.and(w -> w.isNull(Project::getTenantId)
                         .or()
                         .eq(Project::getTenantId, tenantId));
        
        wrapper.orderByDesc(Project::getCreatedAt);
        
        return projectMapper.selectList(wrapper);
    }

    @Override
    public List<Project> getSystemTemplates() {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Project::getIsTemplate, true)
               .isNull(Project::getTenantId)
               .eq(Project::getDeleted, 0)
               .orderByDesc(Project::getCreatedAt);
        
        return projectMapper.selectList(wrapper);
    }

    @Override
    public List<Project> getTenantTemplates(Long tenantId) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Project::getIsTemplate, true)
               .eq(Project::getTenantId, tenantId)
               .eq(Project::getDeleted, 0)
               .orderByDesc(Project::getCreatedAt);
        
        return projectMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project createTemplate(CreateTemplateRequest request) {
        Project template = new Project();
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setProjectType(request.getProjectType());
        template.setIsTemplate(true);
        template.setStatus(Project.Status.ACTIVE);
        template.setSettings(request.getSettings());
        template.setColor(request.getColor());
        
        // 系统模板不设置租户ID
        if (request.getIsSystem() == null || !request.getIsSystem()) {
            template.setTenantId(TenantContext.getTenantId());
        }
        
        template.setOwnerId(UserContext.getUserId());
        template.setKey(projectService.getNextProjectKey());
        
        projectMapper.insert(template);
        
        // 创建默认工作流状态
        if (request.getWorkflowStatuses() != null && !request.getWorkflowStatuses().isEmpty()) {
            // TODO: 创建工作流状态
        }
        
        // 创建默认里程碑
        if (request.getMilestones() != null && !request.getMilestones().isEmpty()) {
            for (CreateTemplateRequest.MilestoneConfig config : request.getMilestones()) {
                Milestone milestone = new Milestone();
                milestone.setProjectId(template.getId());
                milestone.setName(config.getName());
                milestone.setDescription(config.getDescription());
                milestone.setStatus("pending");
                milestoneMapper.insert(milestone);
            }
        }
        
        // 发布事件
        publishTemplateCreatedEvent(template);
        
        log.info("创建项目模板成功: templateId={}, name={}", template.getId(), template.getName());
        
        return template;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project createTemplateFromProject(Long projectId, String templateName, String description) {
        Project sourceProject = projectMapper.selectById(projectId);
        if (sourceProject == null) {
            throw new BusinessException("源项目不存在");
        }
        
        // 创建模板
        Project template = new Project();
        template.setName(templateName);
        template.setDescription(description != null ? description : sourceProject.getDescription());
        template.setProjectType(sourceProject.getProjectType());
        template.setIsTemplate(true);
        template.setStatus(Project.Status.ACTIVE);
        template.setSettings(sourceProject.getSettings());
        template.setColor(sourceProject.getColor());
        template.setTenantId(TenantContext.getTenantId());
        template.setOwnerId(UserContext.getUserId());
        template.setKey(projectService.getNextProjectKey());
        
        projectMapper.insert(template);
        
        // 复制里程碑
        copyMilestones(projectId, template.getId(), 0);
        
        // 发布事件
        publishTemplateCreatedEvent(template);
        
        log.info("从项目创建模板成功: sourceProjectId={}, templateId={}", projectId, template.getId());
        
        return template;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project updateTemplate(Long templateId, CreateTemplateRequest request) {
        Project template = projectMapper.selectById(templateId);
        if (template == null || !Boolean.TRUE.equals(template.getIsTemplate())) {
            throw new BusinessException("模板不存在");
        }
        
        template.setName(request.getName());
        template.setDescription(request.getDescription());
        template.setProjectType(request.getProjectType());
        template.setSettings(request.getSettings());
        template.setColor(request.getColor());
        
        projectMapper.updateById(template);
        
        log.info("更新项目模板成功: templateId={}", templateId);
        
        return template;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTemplate(Long templateId) {
        Project template = projectMapper.selectById(templateId);
        if (template == null || !Boolean.TRUE.equals(template.getIsTemplate())) {
            throw new BusinessException("模板不存在");
        }
        
        // 检查是否为系统模板
        if (template.getTenantId() == null) {
            throw new BusinessException("系统模板不能删除");
        }
        
        // 逻辑删除
        template.setDeleted(1);
        projectMapper.updateById(template);
        
        log.info("删除项目模板成功: templateId={}", templateId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project createProjectFromTemplate(Long templateId, String projectName, Long ownerId) {
        Project template = projectMapper.selectById(templateId);
        if (template == null || !Boolean.TRUE.equals(template.getIsTemplate())) {
            throw new BusinessException("模板不存在");
        }
        
        // 创建新项目
        Project project = new Project();
        project.setName(projectName);
        project.setDescription(template.getDescription());
        project.setProjectType(template.getProjectType());
        project.setIsTemplate(false);
        project.setTemplateId(templateId);
        project.setStatus(Project.Status.PLANNING);
        project.setSettings(template.getSettings());
        project.setColor(template.getColor());
        project.setTenantId(TenantContext.getTenantId());
        project.setOwnerId(ownerId != null ? ownerId : UserContext.getUserId());
        project.setKey(projectService.getNextProjectKey());
        project.setStartDate(LocalDate.now());
        project.setProgress(0);
        project.setMemberCount(1);
        project.setIssueCount(0);
        
        projectMapper.insert(project);
        
        // 添加负责人为项目成员
        addProjectOwnerAsMember(project);
        
        // 复制里程碑
        copyMilestones(templateId, project.getId(), 0);
        
        // 发布项目创建事件
        publishProjectCreatedEvent(project);
        
        log.info("从模板创建项目成功: templateId={}, projectId={}", templateId, project.getId());
        
        return project;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project copyProject(CopyProjectRequest request) {
        Project sourceProject = projectMapper.selectById(request.getSourceProjectId());
        if (sourceProject == null) {
            throw new BusinessException("源项目不存在");
        }
        
        // 计算日期偏移
        int dateOffset = request.getDateOffset() != null ? request.getDateOffset() : 0;
        if (dateOffset == 0 && request.getStartDate() != null && sourceProject.getStartDate() != null) {
            dateOffset = (int) ChronoUnit.DAYS.between(sourceProject.getStartDate(), request.getStartDate());
        }
        
        // 创建新项目
        Project newProject = new Project();
        newProject.setName(request.getName());
        newProject.setKey(request.getKey() != null ? request.getKey() : projectService.getNextProjectKey());
        newProject.setDescription(request.getDescription() != null ? request.getDescription() : sourceProject.getDescription());
        newProject.setProjectType(sourceProject.getProjectType());
        newProject.setIsTemplate(false);
        newProject.setStatus(Project.Status.PLANNING);
        newProject.setSettings(sourceProject.getSettings());
        newProject.setColor(sourceProject.getColor());
        newProject.setVisibility(sourceProject.getVisibility());
        newProject.setPriority(sourceProject.getPriority());
        newProject.setTenantId(TenantContext.getTenantId());
        newProject.setOwnerId(request.getOwnerId() != null ? request.getOwnerId() : UserContext.getUserId());
        newProject.setProgress(0);
        newProject.setMemberCount(1);
        newProject.setIssueCount(0);
        
        // 设置日期
        if (request.getStartDate() != null) {
            newProject.setStartDate(request.getStartDate());
        } else if (sourceProject.getStartDate() != null) {
            newProject.setStartDate(sourceProject.getStartDate().plusDays(dateOffset));
        }
        
        if (request.getEndDate() != null) {
            newProject.setEndDate(request.getEndDate());
        } else if (sourceProject.getEndDate() != null) {
            newProject.setEndDate(sourceProject.getEndDate().plusDays(dateOffset));
        }
        
        projectMapper.insert(newProject);
        
        // 添加负责人为项目成员
        addProjectOwnerAsMember(newProject);
        
        // 复制成员
        if (Boolean.TRUE.equals(request.getCopyMembers())) {
            copyMembers(request.getSourceProjectId(), newProject.getId());
        }
        
        // 复制里程碑
        if (Boolean.TRUE.equals(request.getCopyMilestones())) {
            copyMilestones(request.getSourceProjectId(), newProject.getId(), dateOffset);
        }
        
        // 复制任务（如果需要）
        if (Boolean.TRUE.equals(request.getCopyTasks())) {
            // TODO: 调用任务服务复制任务
            log.info("任务复制功能待实现");
        }
        
        // 复制工作流配置
        if (Boolean.TRUE.equals(request.getCopyWorkflow())) {
            // TODO: 复制工作流配置
            log.info("工作流复制功能待实现");
        }
        
        // 发布项目复制事件
        publishProjectCopiedEvent(sourceProject, newProject);
        
        log.info("复制项目成功: sourceProjectId={}, newProjectId={}", request.getSourceProjectId(), newProject.getId());
        
        return newProject;
    }

    @Override
    public Project getTemplateDetail(Long templateId) {
        Project template = projectMapper.selectById(templateId);
        if (template == null || !Boolean.TRUE.equals(template.getIsTemplate())) {
            throw new BusinessException("模板不存在");
        }
        return template;
    }

    @Override
    public Integer getTemplateUsageCount(Long templateId) {
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Project::getTemplateId, templateId)
               .eq(Project::getDeleted, 0);
        return Math.toIntExact(projectMapper.selectCount(wrapper));
    }

    /**
     * 添加项目负责人为成员
     */
    private void addProjectOwnerAsMember(Project project) {
        ProjectMember member = new ProjectMember();
        member.setProjectId(project.getId());
        member.setUserId(project.getOwnerId());
        member.setRole("owner");
        member.setJoinedAt(LocalDateTime.now());
        projectMemberMapper.insert(member);
    }

    /**
     * 复制项目成员
     */
    private void copyMembers(Long sourceProjectId, Long targetProjectId) {
        LambdaQueryWrapper<ProjectMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectMember::getProjectId, sourceProjectId);
        List<ProjectMember> members = projectMemberMapper.selectList(wrapper);
        
        for (ProjectMember member : members) {
            // 检查是否已存在（负责人可能已添加）
            LambdaQueryWrapper<ProjectMember> checkWrapper = new LambdaQueryWrapper<>();
            checkWrapper.eq(ProjectMember::getProjectId, targetProjectId)
                       .eq(ProjectMember::getUserId, member.getUserId());
            if (projectMemberMapper.selectCount(checkWrapper) == 0) {
                ProjectMember newMember = new ProjectMember();
                newMember.setProjectId(targetProjectId);
                newMember.setUserId(member.getUserId());
                newMember.setRole(member.getRole());
                newMember.setJoinedAt(LocalDateTime.now());
                projectMemberMapper.insert(newMember);
            }
        }
    }

    /**
     * 复制里程碑
     */
    private void copyMilestones(Long sourceProjectId, Long targetProjectId, int dateOffset) {
        LambdaQueryWrapper<Milestone> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Milestone::getProjectId, sourceProjectId)
               .orderByAsc(Milestone::getTargetDate);
        List<Milestone> milestones = milestoneMapper.selectList(wrapper);
        
        for (Milestone milestone : milestones) {
            Milestone newMilestone = new Milestone();
            newMilestone.setProjectId(targetProjectId);
            newMilestone.setName(milestone.getName());
            newMilestone.setDescription(milestone.getDescription());
            newMilestone.setStatus("pending");
            newMilestone.setProgress(0);
            
            if (milestone.getTargetDate() != null && dateOffset != 0) {
                newMilestone.setTargetDate(milestone.getTargetDate().plusDays(dateOffset));
            } else {
                newMilestone.setTargetDate(milestone.getTargetDate());
            }
            
            milestoneMapper.insert(newMilestone);
        }
    }

    /**
     * 发布模板创建事件
     */
    private void publishTemplateCreatedEvent(Project template) {
        ProjectEvent event = ProjectEvent.builder()
                .projectId(template.getId())
                .projectName(template.getName())
                .projectKey(template.getKey())
                .tenantId(template.getTenantId())
                .operatorId(UserContext.getUserId())
                .operatorName(UserContext.getUsername())
                .eventType(ProjectEvent.EventType.PROJECT_TEMPLATE_CREATED)
                .build();
        
        eventPublisher.publish(ProjectEvent.TOPIC, event);
    }

    /**
     * 发布项目创建事件
     */
    private void publishProjectCreatedEvent(Project project) {
        ProjectEvent event = ProjectEvent.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .projectKey(project.getKey())
                .tenantId(project.getTenantId())
                .operatorId(UserContext.getUserId())
                .operatorName(UserContext.getUsername())
                .eventType(ProjectEvent.EventType.PROJECT_CREATED)
                .build();
        
        eventPublisher.publish(ProjectEvent.TOPIC, event);
    }

    /**
     * 发布项目复制事件
     */
    private void publishProjectCopiedEvent(Project sourceProject, Project newProject) {
        ProjectEvent event = ProjectEvent.builder()
                .projectId(newProject.getId())
                .projectName(newProject.getName())
                .projectKey(newProject.getKey())
                .tenantId(newProject.getTenantId())
                .operatorId(UserContext.getUserId())
                .operatorName(UserContext.getUsername())
                .eventType(ProjectEvent.EventType.PROJECT_COPIED)
                .build();
        
        eventPublisher.publish(ProjectEvent.TOPIC, event);
    }
}