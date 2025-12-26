package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.MilestoneTaskAttachment;
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
    @Select("SELECT * FROM milestone_task_attachment WHERE task_id = #{taskId} AND deleted = 0 ORDER BY create_time DESC")
    List<MilestoneTaskAttachment> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 根据任务ID和附件类型查询附件列表
     */
    @Select("SELECT * FROM milestone_task_attachment WHERE task_id = #{taskId} AND attachment_type = #{attachmentType} AND deleted = 0 ORDER BY create_time DESC")
    List<MilestoneTaskAttachment> selectByTaskIdAndType(@Param("taskId") Long taskId, @Param("attachmentType") String attachmentType);

    /**
     * 查询任务的执行方案附件
     */
    @Select("SELECT * FROM milestone_task_attachment WHERE task_id = #{taskId} AND attachment_type = 'execution_plan' AND deleted = 0 ORDER BY create_time DESC")
    List<MilestoneTaskAttachment> selectExecutionPlansByTaskId(@Param("taskId") Long taskId);
}