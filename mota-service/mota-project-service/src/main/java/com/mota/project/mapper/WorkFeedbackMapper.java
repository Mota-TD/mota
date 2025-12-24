package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WorkFeedback;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作反馈 Mapper 接口
 */
@Mapper
public interface WorkFeedbackMapper extends BaseMapper<WorkFeedback> {

    /**
     * 根据接收人ID查询反馈列表
     */
    List<WorkFeedback> selectByToUserId(@Param("toUserId") Long toUserId);

    /**
     * 根据发送人ID查询反馈列表
     */
    List<WorkFeedback> selectByFromUserId(@Param("fromUserId") Long fromUserId);

    /**
     * 根据任务ID查询反馈列表
     */
    List<WorkFeedback> selectByTaskId(@Param("taskId") Long taskId);

    /**
     * 统计未读反馈数量
     */
    int countUnreadByToUserId(@Param("toUserId") Long toUserId);

    /**
     * 批量标记为已读
     */
    int markAllAsRead(@Param("toUserId") Long toUserId);
}