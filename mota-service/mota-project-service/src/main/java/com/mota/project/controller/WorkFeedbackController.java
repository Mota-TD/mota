package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.entity.WorkFeedback;
import com.mota.project.service.WorkFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 工作反馈控制器
 */
@RestController
@RequestMapping("/api/v1/work-feedbacks")
@RequiredArgsConstructor
public class WorkFeedbackController {

    private final WorkFeedbackService workFeedbackService;

    /**
     * 获取工作反馈列表（分页）
     */
    @GetMapping
    public Result<IPage<WorkFeedback>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) String feedbackType,
            @RequestParam(required = false) Long fromUserId,
            @RequestParam(required = false) Long toUserId,
            @RequestParam(required = false) String status) {
        Page<WorkFeedback> pageParam = new Page<>(page, pageSize);
        IPage<WorkFeedback> result = workFeedbackService.pageFeedbacks(
                pageParam, projectId, taskId, feedbackType, fromUserId, toUserId, status);
        return Result.success(result);
    }

    /**
     * 获取收到的反馈列表
     */
    @GetMapping("/received/{userId}")
    public Result<List<WorkFeedback>> getReceivedFeedbacks(@PathVariable Long userId) {
        List<WorkFeedback> feedbacks = workFeedbackService.getReceivedFeedbacks(userId);
        return Result.success(feedbacks);
    }

    /**
     * 获取发出的反馈列表
     */
    @GetMapping("/sent/{userId}")
    public Result<List<WorkFeedback>> getSentFeedbacks(@PathVariable Long userId) {
        List<WorkFeedback> feedbacks = workFeedbackService.getSentFeedbacks(userId);
        return Result.success(feedbacks);
    }

    /**
     * 根据任务ID获取反馈列表
     */
    @GetMapping("/task/{taskId}")
    public Result<List<WorkFeedback>> getByTaskId(@PathVariable Long taskId) {
        List<WorkFeedback> feedbacks = workFeedbackService.getByTaskId(taskId);
        return Result.success(feedbacks);
    }

    /**
     * 获取工作反馈详情
     */
    @GetMapping("/{id}")
    public Result<WorkFeedback> getById(@PathVariable Long id) {
        WorkFeedback feedback = workFeedbackService.getDetailById(id);
        return Result.success(feedback);
    }

    /**
     * 创建工作反馈
     */
    @PostMapping
    public Result<WorkFeedback> create(@RequestBody WorkFeedback feedback) {
        WorkFeedback created = workFeedbackService.createFeedback(feedback);
        return Result.success(created);
    }

    /**
     * 回复工作反馈
     */
    @PostMapping("/{id}/reply")
    public Result<WorkFeedback> reply(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String replyContent = body.get("replyContent");
        if (replyContent == null || replyContent.trim().isEmpty()) {
            return Result.fail("回复内容不能为空");
        }
        WorkFeedback feedback = workFeedbackService.replyFeedback(id, replyContent);
        return Result.success(feedback);
    }

    /**
     * 标记反馈为已读
     */
    @PutMapping("/{id}/read")
    public Result<Boolean> markAsRead(@PathVariable Long id) {
        boolean result = workFeedbackService.markAsRead(id);
        return Result.success(result);
    }

    /**
     * 删除工作反馈
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = workFeedbackService.deleteFeedback(id);
        return Result.success(result);
    }

    /**
     * 获取未读反馈数量
     */
    @GetMapping("/received/{userId}/unread-count")
    public Result<Integer> getUnreadCount(@PathVariable Long userId) {
        int count = workFeedbackService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 批量标记为已读
     */
    @PutMapping("/received/{userId}/read-all")
    public Result<Boolean> markAllAsRead(@PathVariable Long userId) {
        boolean result = workFeedbackService.markAllAsRead(userId);
        return Result.success(result);
    }
}