package com.mota.task.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.task.entity.MilestoneTaskAttachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 里程碑任务附件Mapper
 */
@Mapper
public interface MilestoneTaskAttachmentMapper extends BaseMapper<MilestoneTaskAttachment> {

    /**
     * 根据任务ID查询附件列表
     */
    @Select("SELECT * FROM milestone_task_attachment WHERE task_id = #{taskId} AND deleted = 0 ORDER BY created_at DESC")
    List<MilestoneTaskAttachment> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 统计任务的附件数量
     */
    @Select("SELECT COUNT(*) FROM milestone_task_attachment WHERE task_id = #{taskId} AND deleted = 0")
    int countByTaskId(@Param("taskId") Long taskId);
}