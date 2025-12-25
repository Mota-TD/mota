package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WorkflowTransition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作流流转规则Mapper接口
 */
@Mapper
public interface WorkflowTransitionMapper extends BaseMapper<WorkflowTransition> {

    /**
     * 获取工作流的所有流转规则
     */
    List<WorkflowTransition> selectByWorkflowId(@Param("workflowId") Long workflowId);

    /**
     * 获取从指定状态出发的流转规则
     */
    List<WorkflowTransition> selectByFromStatusId(@Param("fromStatusId") Long fromStatusId);

    /**
     * 获取到达指定状态的流转规则
     */
    List<WorkflowTransition> selectByToStatusId(@Param("toStatusId") Long toStatusId);

    /**
     * 检查流转是否存在
     */
    WorkflowTransition selectByFromAndTo(@Param("workflowId") Long workflowId,
                                          @Param("fromStatusId") Long fromStatusId,
                                          @Param("toStatusId") Long toStatusId);

    /**
     * 获取流转规则（包含状态信息）
     */
    List<WorkflowTransition> selectWithStatusByWorkflowId(@Param("workflowId") Long workflowId);

    /**
     * 批量插入流转规则
     */
    int batchInsert(@Param("list") List<WorkflowTransition> transitions);

    /**
     * 删除工作流的所有流转规则
     */
    int deleteByWorkflowId(@Param("workflowId") Long workflowId);

    /**
     * 删除涉及指定状态的流转规则
     */
    int deleteByStatusId(@Param("statusId") Long statusId);
}