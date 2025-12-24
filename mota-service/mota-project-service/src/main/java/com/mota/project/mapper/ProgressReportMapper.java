package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.ProgressReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * 进度汇报 Mapper 接口
 */
@Mapper
public interface ProgressReportMapper extends BaseMapper<ProgressReport> {

    /**
     * 根据项目ID查询汇报列表
     */
    List<ProgressReport> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据部门任务ID查询汇报列表
     */
    List<ProgressReport> selectByDepartmentTaskId(@Param("departmentTaskId") Long departmentTaskId);

    /**
     * 根据汇报人ID查询汇报列表
     */
    List<ProgressReport> selectByReporterId(@Param("reporterId") Long reporterId);

    /**
     * 查询用户收到的汇报列表
     */
    List<ProgressReport> selectReceivedByUserId(@Param("userId") Long userId);

    /**
     * 查询当前周报
     */
    ProgressReport selectCurrentWeekReport(@Param("projectId") Long projectId, 
                                            @Param("reporterId") Long reporterId,
                                            @Param("weekStart") LocalDate weekStart,
                                            @Param("weekEnd") LocalDate weekEnd);

    /**
     * 查询今日日报
     */
    ProgressReport selectTodayReport(@Param("projectId") Long projectId,
                                      @Param("reporterId") Long reporterId,
                                      @Param("today") LocalDate today);
}