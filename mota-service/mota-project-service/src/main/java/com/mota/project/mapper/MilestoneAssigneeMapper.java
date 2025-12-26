package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.MilestoneAssignee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 里程碑负责人Mapper
 */
@Mapper
public interface MilestoneAssigneeMapper extends BaseMapper<MilestoneAssignee> {

    /**
     * 根据里程碑ID查询负责人列表（包含用户信息）
     */
    @Select("SELECT ma.*, COALESCE(u.nickname, u.username) as user_name, u.avatar as user_avatar " +
            "FROM milestone_assignee ma " +
            "LEFT JOIN sys_user u ON ma.user_id = u.id " +
            "WHERE ma.milestone_id = #{milestoneId} AND ma.deleted = 0 " +
            "ORDER BY ma.is_primary DESC, ma.assigned_at ASC")
    List<MilestoneAssignee> selectByMilestoneId(@Param("milestoneId") Long milestoneId);

    /**
     * 根据用户ID查询负责的里程碑
     */
    @Select("SELECT * FROM milestone_assignee WHERE user_id = #{userId} AND deleted = 0")
    List<MilestoneAssignee> selectByUserId(@Param("userId") Long userId);

    /**
     * 删除里程碑的所有负责人
     */
    @Select("UPDATE milestone_assignee SET deleted = 1 WHERE milestone_id = #{milestoneId}")
    void deleteByMilestoneId(@Param("milestoneId") Long milestoneId);
}