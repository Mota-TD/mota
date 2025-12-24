package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WorkPlanAttachment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作计划附件 Mapper 接口
 */
@Mapper
public interface WorkPlanAttachmentMapper extends BaseMapper<WorkPlanAttachment> {

    /**
     * 根据工作计划ID查询附件列表
     */
    List<WorkPlanAttachment> selectByWorkPlanId(@Param("workPlanId") Long workPlanId);
}