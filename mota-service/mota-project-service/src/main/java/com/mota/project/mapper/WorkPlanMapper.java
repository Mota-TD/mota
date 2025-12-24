package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WorkPlan;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作计划 Mapper 接口
 */
@Mapper
public interface WorkPlanMapper extends BaseMapper<WorkPlan> {

    /**
     * 根据部门任务ID查询工作计划列表
     */
    List<WorkPlan> selectByDepartmentTaskId(@Param("departmentTaskId") Long departmentTaskId);

    /**
     * 查询最新版本的工作计划
     */
    WorkPlan selectLatestByDepartmentTaskId(@Param("departmentTaskId") Long departmentTaskId);

    /**
     * 查询待审批的工作计划列表
     */
    List<WorkPlan> selectPendingApproval(@Param("reviewerId") Long reviewerId);
}