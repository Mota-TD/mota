package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Milestone;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 项目里程碑 Mapper 接口
 */
@Mapper
public interface MilestoneMapper extends BaseMapper<Milestone> {

    /**
     * 根据项目ID查询里程碑列表
     */
    List<Milestone> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 查询即将到期的里程碑
     */
    List<Milestone> selectUpcomingMilestones(@Param("days") Integer days);

    /**
     * 查询已延期的里程碑
     */
    List<Milestone> selectDelayedMilestones();
}