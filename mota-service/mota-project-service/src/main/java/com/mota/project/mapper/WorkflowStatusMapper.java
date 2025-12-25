package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WorkflowStatus;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作流状态Mapper接口
 */
@Mapper
public interface WorkflowStatusMapper extends BaseMapper<WorkflowStatus> {

    /**
     * 获取工作流的所有状态
     */
    List<WorkflowStatus> selectByWorkflowId(@Param("workflowId") Long workflowId);

    /**
     * 获取初始状态
     */
    WorkflowStatus selectInitialStatus(@Param("workflowId") Long workflowId);

    /**
     * 获取终态列表
     */
    List<WorkflowStatus> selectFinalStatuses(@Param("workflowId") Long workflowId);

    /**
     * 按排序顺序获取状态
     */
    List<WorkflowStatus> selectByWorkflowIdOrdered(@Param("workflowId") Long workflowId);

    /**
     * 更新排序顺序
     */
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);

    /**
     * 批量插入状态
     */
    int batchInsert(@Param("list") List<WorkflowStatus> statuses);

    /**
     * 删除工作流的所有状态
     */
    int deleteByWorkflowId(@Param("workflowId") Long workflowId);

    /**
     * 获取最大排序顺序
     */
    Integer selectMaxSortOrder(@Param("workflowId") Long workflowId);
}