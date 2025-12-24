package com.mota.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mota.project.entity.ProgressReport;

import java.util.List;

/**
 * 进度汇报服务接口
 */
public interface ProgressReportService extends IService<ProgressReport> {

    /**
     * 分页查询进度汇报
     */
    IPage<ProgressReport> pageReports(Page<ProgressReport> page, Long projectId, Long departmentTaskId,
                                       String reportType, Long reporterId, String status);

    /**
     * 根据项目ID获取汇报列表
     */
    List<ProgressReport> getByProjectId(Long projectId);

    /**
     * 根据部门任务ID获取汇报列表
     */
    List<ProgressReport> getByDepartmentTaskId(Long departmentTaskId);

    /**
     * 根据汇报人ID获取汇报列表
     */
    List<ProgressReport> getByReporterId(Long reporterId);

    /**
     * 获取用户收到的汇报列表
     */
    List<ProgressReport> getReceivedReports(Long userId);

    /**
     * 获取汇报详情
     */
    ProgressReport getDetailById(Long id);

    /**
     * 创建进度汇报（草稿）
     */
    ProgressReport createReport(ProgressReport report);

    /**
     * 更新进度汇报
     */
    ProgressReport updateReport(ProgressReport report);

    /**
     * 删除进度汇报
     */
    boolean deleteReport(Long id);

    /**
     * 提交进度汇报
     */
    ProgressReport submitReport(Long id);

    /**
     * 标记汇报为已读
     */
    boolean markAsRead(Long id);

    /**
     * 获取本周周报
     */
    ProgressReport getCurrentWeekReport(Long projectId, Long reporterId);

    /**
     * 获取今日日报
     */
    ProgressReport getTodayReport(Long projectId, Long reporterId);
}