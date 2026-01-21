package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.MilestoneTaskProgressRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 里程碑任务进度记录Mapper
 */
@Mapper
public interface MilestoneTaskProgressRecordMapper extends BaseMapper<MilestoneTaskProgressRecord> {

    /**
     * 根据任务ID查询进度记录列表（包含操作人信息）
     */
    @Select("SELECT pr.*, " +
            "COALESCE(u.nickname, u.username) as operator_name, " +
            "u.avatar as operator_avatar " +
            "FROM milestone_task_progress_record pr " +
            "LEFT JOIN sys_user u ON pr.operator_id = u.id " +
            "WHERE pr.task_id = #{taskId} AND pr.deleted = 0 " +
            "ORDER BY pr.created_at DESC")
    @Results({
            @Result(property = "operatorName", column = "operator_name"),
            @Result(property = "operatorAvatar", column = "operator_avatar")
    })
    List<MilestoneTaskProgressRecord> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 获取任务最新的进度记录
     */
    @Select("SELECT pr.*, " +
            "COALESCE(u.nickname, u.username) as operator_name, " +
            "u.avatar as operator_avatar " +
            "FROM milestone_task_progress_record pr " +
            "LEFT JOIN sys_user u ON pr.operator_id = u.id " +
            "WHERE pr.task_id = #{taskId} AND pr.deleted = 0 " +
            "ORDER BY pr.created_at DESC LIMIT 1")
    @Results({
            @Result(property = "operatorName", column = "operator_name"),
            @Result(property = "operatorAvatar", column = "operator_avatar")
    })
    MilestoneTaskProgressRecord selectLatestByTaskId(@Param("taskId") Long taskId);
}