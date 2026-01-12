package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.TaskDependency;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 任务依赖关系Mapper接口
 */
@Mapper
public interface TaskDependencyMapper extends BaseMapper<TaskDependency> {

    /**
     * 获取任务的前置依赖
     */
    @Select("SELECT * FROM task_dependency WHERE task_id = #{taskId} AND deleted = 0")
    List<TaskDependency> selectPredecessors(@Param("taskId") Long taskId);

    /**
     * 获取任务的后置依赖（被哪些任务依赖）
     */
    @Select("SELECT * FROM task_dependency WHERE predecessor_id = #{taskId} AND deleted = 0")
    List<TaskDependency> selectSuccessors(@Param("taskId") Long taskId);

    /**
     * 检查是否存在循环依赖
     */
    @Select("WITH RECURSIVE dep_chain AS (" +
            "  SELECT task_id, predecessor_id, 1 as depth FROM task_dependency WHERE task_id = #{taskId} AND deleted = 0 " +
            "  UNION ALL " +
            "  SELECT td.task_id, td.predecessor_id, dc.depth + 1 " +
            "  FROM task_dependency td " +
            "  INNER JOIN dep_chain dc ON td.task_id = dc.predecessor_id " +
            "  WHERE td.deleted = 0 AND dc.depth < 100" +
            ") " +
            "SELECT COUNT(*) FROM dep_chain WHERE predecessor_id = #{taskId}")
    int checkCircularDependency(@Param("taskId") Long taskId);

    /**
     * 获取项目的所有依赖关系
     */
    @Select("SELECT td.* FROM task_dependency td " +
            "INNER JOIN task t ON td.task_id = t.id " +
            "WHERE t.project_id = #{projectId} AND td.deleted = 0 AND t.deleted = 0")
    List<TaskDependency> selectByProjectId(@Param("projectId") Long projectId);
}