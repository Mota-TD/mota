package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.WorkflowStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 工作流状态Mapper接口
 */
@Mapper
public interface WorkflowStatusMapper extends BaseMapper<WorkflowStatus> {

    /**
     * 获取项目的工作流状态列表
     */
    @Select("SELECT * FROM workflow_status WHERE project_id = #{projectId} AND deleted = 0 ORDER BY sort_order")
    List<WorkflowStatus> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 获取租户的默认工作流状态
     */
    @Select("SELECT * FROM workflow_status WHERE tenant_id = #{tenantId} AND is_default = 1 AND deleted = 0 ORDER BY sort_order")
    List<WorkflowStatus> selectDefaultByTenantId(@Param("tenantId") Long tenantId);

    /**
     * 获取初始状态
     */
    @Select("SELECT * FROM workflow_status WHERE project_id = #{projectId} AND is_initial = 1 AND deleted = 0 LIMIT 1")
    WorkflowStatus selectInitialStatus(@Param("projectId") Long projectId);

    /**
     * 获取完成状态
     */
    @Select("SELECT * FROM workflow_status WHERE project_id = #{projectId} AND is_final = 1 AND deleted = 0")
    List<WorkflowStatus> selectFinalStatuses(@Param("projectId") Long projectId);

    /**
     * 根据状态名称获取
     */
    @Select("SELECT * FROM workflow_status WHERE project_id = #{projectId} AND name = #{name} AND deleted = 0 LIMIT 1")
    WorkflowStatus selectByName(@Param("projectId") Long projectId, @Param("name") String name);
}