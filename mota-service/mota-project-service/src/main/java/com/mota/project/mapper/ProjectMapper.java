package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.dto.request.ProjectQueryRequest;
import com.mota.project.entity.Project;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 项目Mapper
 */
@Mapper
public interface ProjectMapper extends BaseMapper<Project> {

    /**
     * 查询项目列表
     */
    List<Project> selectProjectList(@Param("query") ProjectQueryRequest query);

    /**
     * 统计项目数量
     */
    long countProjects(@Param("query") ProjectQueryRequest query);

    /**
     * 根据用户ID查询参与的项目
     */
    List<Project> selectProjectsByUserId(@Param("userId") Long userId, @Param("includeArchived") Boolean includeArchived);

    /**
     * 查询收藏的项目
     */
    List<Project> selectStarredProjects(@Param("userId") Long userId);

    /**
     * 查询归档的项目
     */
    List<Project> selectArchivedProjects(@Param("orgId") String orgId);

    /**
     * 查询最近访问的项目
     */
    List<Project> selectRecentProjects(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 更新项目进度
     */
    int updateProjectProgress(@Param("projectId") Long projectId, @Param("progress") Integer progress);

    /**
     * 更新项目进度（别名方法，用于进度同步服务）
     */
    int updateProgress(@Param("id") Long id, @Param("progress") Integer progress);

    /**
     * 更新项目成员数量
     */
    int updateMemberCount(@Param("projectId") Long projectId);

    /**
     * 更新项目任务数量
     */
    int updateIssueCount(@Param("projectId") Long projectId);

    /**
     * 归档项目
     */
    int archiveProject(@Param("projectId") Long projectId, @Param("archivedBy") Long archivedBy);

    /**
     * 恢复归档项目
     */
    int restoreProject(@Param("projectId") Long projectId);

    /**
     * 获取项目统计信息
     */
    Map<String, Object> getProjectStatistics(@Param("projectId") Long projectId);

    /**
     * 获取最大的项目标识序号
     * 用于生成新的项目标识（格式：AF-0000）
     */
    Integer getMaxProjectKeySequence();
}