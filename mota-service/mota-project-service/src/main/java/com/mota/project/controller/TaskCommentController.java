package com.mota.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.common.core.result.Result;
import com.mota.project.entity.TaskComment;
import com.mota.project.service.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 任务评论控制器
 */
@RestController
@RequestMapping("/api/v1/task-comments")
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    /**
     * 获取评论列表（分页）
     */
    @GetMapping
    public Result<IPage<TaskComment>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long taskId,
            @RequestParam(required = false) Long userId) {
        Page<TaskComment> pageParam = new Page<>(page, pageSize);
        IPage<TaskComment> result = taskCommentService.pageComments(pageParam, taskId, userId);
        return Result.success(result);
    }

    /**
     * 根据任务ID获取评论列表（包含嵌套回复）
     */
    @GetMapping("/task/{taskId}")
    public Result<List<TaskComment>> getByTaskId(@PathVariable Long taskId) {
        List<TaskComment> comments = taskCommentService.getByTaskId(taskId);
        return Result.success(comments);
    }

    /**
     * 获取评论详情
     */
    @GetMapping("/{id}")
    public Result<TaskComment> getById(@PathVariable Long id) {
        TaskComment comment = taskCommentService.getDetailById(id);
        return Result.success(comment);
    }

    /**
     * 创建评论
     */
    @PostMapping
    public Result<TaskComment> create(@RequestBody TaskComment comment) {
        TaskComment created = taskCommentService.createComment(comment);
        return Result.success(created);
    }

    /**
     * 更新评论
     */
    @PutMapping("/{id}")
    public Result<TaskComment> update(@PathVariable Long id, @RequestBody TaskComment comment) {
        comment.setId(id);
        TaskComment updated = taskCommentService.updateComment(comment);
        return Result.success(updated);
    }

    /**
     * 删除评论
     */
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = taskCommentService.deleteComment(id);
        return Result.success(result);
    }

    /**
     * 回复评论
     */
    @PostMapping("/{parentId}/reply")
    public Result<TaskComment> reply(@PathVariable Long parentId, @RequestBody TaskComment reply) {
        TaskComment created = taskCommentService.replyToComment(parentId, reply);
        return Result.success(created);
    }

    /**
     * 点赞评论
     */
    @PostMapping("/{id}/like")
    public Result<Boolean> like(@PathVariable Long id) {
        boolean result = taskCommentService.likeComment(id);
        return Result.success(result);
    }

    /**
     * 取消点赞评论
     */
    @DeleteMapping("/{id}/like")
    public Result<Boolean> unlike(@PathVariable Long id) {
        boolean result = taskCommentService.unlikeComment(id);
        return Result.success(result);
    }

    /**
     * 获取用户最近的评论
     */
    @GetMapping("/user/{userId}/recent")
    public Result<List<TaskComment>> getRecentByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") Integer limit) {
        List<TaskComment> comments = taskCommentService.getRecentByUserId(userId, limit);
        return Result.success(comments);
    }

    /**
     * 搜索评论
     */
    @GetMapping("/task/{taskId}/search")
    public Result<List<TaskComment>> search(
            @PathVariable Long taskId,
            @RequestParam String keyword) {
        List<TaskComment> comments = taskCommentService.searchComments(taskId, keyword);
        return Result.success(comments);
    }

    /**
     * 获取评论数量
     */
    @GetMapping("/task/{taskId}/count")
    public Result<Integer> countByTaskId(@PathVariable Long taskId) {
        int count = taskCommentService.countByTaskId(taskId);
        return Result.success(count);
    }
}