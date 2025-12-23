package com.mota.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.project.entity.Project;
import com.mota.project.mapper.ProjectMapper;
import com.mota.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 项目服务实现
 */
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {

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
        }
        
        wrapper.orderByDesc(Project::getCreatedAt);
        
        return list(wrapper);
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
    public Project createProject(Project project) {
        // 检查项目标识是否已存在
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Project::getKey, project.getKey());
        if (count(wrapper) > 0) {
            throw new BusinessException("项目标识已存在");
        }
        
        project.setStatus("active");
        project.setProgress(0);
        project.setMemberCount(1);
        project.setIssueCount(0);
        project.setStarred(0);
        
        save(project);
        return project;
    }

    @Override
    public Project updateProject(Long id, Project project) {
        Project existing = getById(id);
        if (existing == null) {
            throw new BusinessException("项目不存在");
        }
        
        // 如果修改了项目标识，检查是否已存在
        if (StringUtils.hasText(project.getKey()) && !project.getKey().equals(existing.getKey())) {
            LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Project::getKey, project.getKey());
            if (count(wrapper) > 0) {
                throw new BusinessException("项目标识已存在");
            }
        }
        
        project.setId(id);
        updateById(project);
        return getById(id);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        removeById(id);
    }

    @Override
    public void toggleStar(Long id) {
        Project project = getById(id);
        if (project == null) {
            throw new BusinessException("项目不存在");
        }
        
        project.setStarred(project.getStarred() == 1 ? 0 : 1);
        updateById(project);
    }
}