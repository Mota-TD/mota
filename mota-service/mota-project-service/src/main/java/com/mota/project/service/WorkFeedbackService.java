package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.WorkFeedback;

import java.util.List;

/**
 * 工作反馈服务接口
 */
public interface WorkFeedbackService extends IService<WorkFeedback> {

    /**
     * 分页查询工作反馈
     */
    IPage<WorkFeedback> pageFeedbacks(Page<WorkFeedback> page, Long projectId, Long taskId,
                                       String feedbackType, Long fromUserId, Long toUserId, String status);

    /**
     * 获取收到的反馈列表
     */
    List<WorkFeedback> getReceivedFeedbacks(Long userId);

    /**
     * 获取发出的反馈列表
     */
    List<WorkFeedback> getSentFeedbacks(Long userId);

    /**
     * 根据任务ID获取反馈列表
     */
    List<WorkFeedback> getByTaskId(Long taskId);

    /**
     * 获取反馈详情
     */
    WorkFeedback getDetailById(Long id);

    /**
     * 创建工作反馈
     */
    WorkFeedback createFeedback(WorkFeedback feedback);

    /**
     * 回复工作反馈
     */
    WorkFeedback replyFeedback(Long id, String replyContent);

    /**
     * 标记反馈为已读
     */
    boolean markAsRead(Long id);

    /**
     * 删除工作反馈
     */
    boolean deleteFeedback(Long id);

    /**
     * 获取未读反馈数量
     */
    int getUnreadCount(Long userId);

    /**
     * 批量标记为已读
     */
    boolean markAllAsRead(Long userId);
}