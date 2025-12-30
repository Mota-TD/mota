package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.MilestoneTaskProgressRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 里程碑任务进度记录 Mapper
 */
@Mapper
public interface MilestoneTaskProgressRecordMapper extends BaseMapper<MilestoneTaskProgressRecord> {

    /**
     * 根据任务ID查询进度记录
     */
    @Select("SELECT * FROM milestone_task_progress_record WHERE task_id = #{taskId} AND deleted = 0 ORDER BY created_at DESC")
    List<MilestoneTaskProgressRecord> selectByTaskId(@Param("taskId") Long taskId);
}