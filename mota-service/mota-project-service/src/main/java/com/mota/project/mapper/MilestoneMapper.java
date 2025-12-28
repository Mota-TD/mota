package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Milestone;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 项目里程碑 Mapper 接口
 */
@Mapper
public interface MilestoneMapper extends BaseMapper<Milestone> {

    /**
     * 根据项目ID查询里程碑列表
     */
    List<Milestone> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 查询即将到期的里程碑
     */
    List<Milestone> selectUpcomingMilestones(@Param("days") Integer days);

    /**
     * 查询已延期的里程碑
     */
    List<Milestone> selectDelayedMilestones();

    /**
     * 更新里程碑进度
     */
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress);

    /**
     * 更新里程碑已完成任务数
     */
    int updateCompletedTaskCount(@Param("id") Long id, @Param("completedTaskCount") Integer completedTaskCount);

    /**
     * 更新里程碑部门任务统计
     */
    int updateDepartmentTaskStats(@Param("id") Long id,
                                   @Param("departmentTaskCount") Integer departmentTaskCount,
                                   @Param("completedDepartmentTaskCount") Integer completedDepartmentTaskCount);

    /**
     * 增加里程碑部门任务计数
     */
    int incrementDepartmentTaskCount(@Param("id") Long id);

    /**
     * 计算项目下所有里程碑的平均进度
     */
    Integer calculateAverageProgressByProject(@Param("projectId") Long projectId);
}