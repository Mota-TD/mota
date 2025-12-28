package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.project.entity.DepartmentTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 部门任务 Mapper 接口
 */
@Mapper
public interface DepartmentTaskMapper extends BaseMapper<DepartmentTask> {

    /**
     * 根据项目ID查询部门任务列表
     */
    List<DepartmentTask> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据部门ID查询部门任务列表
     */
    List<DepartmentTask> selectByDepartmentId(@Param("departmentId") Long departmentId);

    /**
     * 根据负责人ID查询部门任务列表
     */
    List<DepartmentTask> selectByManagerId(@Param("managerId") Long managerId);

    /**
     * 分页查询部门任务
     */
    IPage<DepartmentTask> selectPageByCondition(
            Page<DepartmentTask> page,
            @Param("projectId") Long projectId,
            @Param("departmentId") Long departmentId,
            @Param("status") String status,
            @Param("priority") String priority
    );

    /**
     * 统计项目下各状态的部门任务数量
     */
    List<java.util.Map<String, Object>> countByProjectIdGroupByStatus(@Param("projectId") Long projectId);

    /**
     * 更新部门任务进度
     */
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress);

    /**
     * 根据里程碑ID查询部门任务列表
     */
    List<DepartmentTask> selectByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 计算里程碑下所有部门任务的平均进度
     */
    Integer calculateAverageProgressByMilestone(@Param("milestoneId") Long milestoneId);

    /**
     * 统计里程碑下已完成的部门任务数量
     */
    Integer countCompletedByMilestone(@Param("milestoneId") Long milestoneId);

    /**
     * 统计里程碑下的部门任务总数
     */
    Integer countByMilestone(@Param("milestoneId") Long milestoneId);
}