package com.mota.issue.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mota.common.core.exception.BusinessException;
import com.mota.issue.entity.Issue;
import com.mota.issue.mapper.IssueMapper;
import com.mota.issue.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 任务服务实现
 */
@Service
@RequiredArgsConstructor
public class IssueServiceImpl extends ServiceImpl<IssueMapper, Issue> implements IssueService {

    @Override
    public List<Issue> getIssueList(Long projectId, String status, String type, Long assigneeId, Long sprintId) {
        LambdaQueryWrapper<Issue> wrapper = new LambdaQueryWrapper<>();
        
        if (projectId != null) {
            wrapper.eq(Issue::getProjectId, projectId);
        }
        
        if (StringUtils.hasText(status)) {
            wrapper.eq(Issue::getStatus, status);
        }
        
        if (StringUtils.hasText(type)) {
            wrapper.eq(Issue::getType, type);
        }
        
        if (assigneeId != null) {
            wrapper.eq(Issue::getAssigneeId, assigneeId);
        }
        
        if (sprintId != null) {
            wrapper.eq(Issue::getSprintId, sprintId);
        }
        
        wrapper.orderByDesc(Issue::getCreatedAt);
        
        return list(wrapper);
    }

    @Override
    public Issue getIssueDetail(Long id) {
        Issue issue = getById(id);
        if (issue == null) {
            throw new BusinessException("任务不存在");
        }
        return issue;
    }

    @Override
    public Issue createIssue(Issue issue) {
        // 生成任务标识
        if (!StringUtils.hasText(issue.getIssueKey())) {
            // 简单生成，实际应该根据项目key和序号生成
            issue.setIssueKey("ISSUE-" + System.currentTimeMillis());
        }
        
        if (!StringUtils.hasText(issue.getStatus())) {
            issue.setStatus("open");
        }
        
        if (!StringUtils.hasText(issue.getPriority())) {
            issue.setPriority("medium");
        }
        
        save(issue);
        return issue;
    }

    @Override
    public Issue updateIssue(Long id, Issue issue) {
        Issue existing = getById(id);
        if (existing == null) {
            throw new BusinessException("任务不存在");
        }
        
        issue.setId(id);
        updateById(issue);
        return getById(id);
    }

    @Override
    public void deleteIssue(Long id) {
        Issue issue = getById(id);
        if (issue == null) {
            throw new BusinessException("任务不存在");
        }
        removeById(id);
    }

    @Override
    public void updateStatus(Long id, String status) {
        Issue issue = getById(id);
        if (issue == null) {
            throw new BusinessException("任务不存在");
        }
        
        issue.setStatus(status);
        updateById(issue);
    }
}