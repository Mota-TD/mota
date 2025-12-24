package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.ProjectMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 项目成员 Mapper 接口
 */
@Mapper
public interface ProjectMemberMapper extends BaseMapper<ProjectMember> {

    /**
     * 根据项目ID查询成员列表
     */
    List<ProjectMember> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 根据用户ID查询参与的项目成员记录
     */
    List<ProjectMember> selectByUserId(@Param("userId") Long userId);

    /**
     * 根据项目ID和用户ID查询成员
     */
    ProjectMember selectByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);

    /**
     * 根据项目ID和角色查询成员列表
     */
    List<ProjectMember> selectByProjectIdAndRole(@Param("projectId") Long projectId, @Param("role") String role);

    /**
     * 根据项目ID和部门ID查询成员列表
     */
    List<ProjectMember> selectByProjectIdAndDepartmentId(@Param("projectId") Long projectId, @Param("departmentId") Long departmentId);

    /**
     * 统计项目成员数量
     */
    int countByProjectId(@Param("projectId") Long projectId);
}