package com.mota.issue.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.issue.entity.Issue;

import java.util.List;

/**
 * 任务服务接口
 */
public interface IssueService extends IService<Issue> {

    /**
     * 获取任务列表
     */
    List<Issue> getIssueList(Long projectId, String status, String type, Long assigneeId, Long sprintId);

    /**
     * 获取任务详情
     */
    Issue getIssueDetail(Long id);

    /**
     * 创建任务
     */
    Issue createIssue(Issue issue);

    /**
     * 更新任务
     */
    Issue updateIssue(Long id, Issue issue);

    /**
     * 删除任务
     */
    void deleteIssue(Long id);

    /**
     * 更新任务状态
     */
    void updateStatus(Long id, String status);
}