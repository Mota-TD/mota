package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.TaskDependency;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 任务依赖关系 Mapper 接口
 */
@Mapper
public interface TaskDependencyMapper extends BaseMapper<TaskDependency> {

    /**
     * 根据后继任务ID查询所有前置依赖
     */
    List<TaskDependency> selectBySuccessorId(@Param("successorId") Long successorId);

    /**
     * 根据前置任务ID查询所有后继依赖
     */
    List<TaskDependency> selectByPredecessorId(@Param("predecessorId") Long predecessorId);

    /**
     * 根据任务ID查询所有相关依赖（作为前置或后继）
     */
    List<TaskDependency> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据项目ID查询所有任务依赖关系
     */
    List<TaskDependency> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 检查是否存在依赖关系
     */
    boolean existsDependency(@Param("predecessorId") Long predecessorId, @Param("successorId") Long successorId);

    /**
     * 批量插入依赖关系
     */
    int batchInsert(@Param("list") List<TaskDependency> dependencies);

    /**
     * 删除任务的所有依赖关系
     */
    int deleteByTaskId(@Param("taskId") Long taskId);
}