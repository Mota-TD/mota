package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.WorkflowTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作流模板Mapper接口
 */
@Mapper
public interface WorkflowTemplateMapper extends BaseMapper<WorkflowTemplate> {

    /**
     * 获取系统预设工作流
     */
    List<WorkflowTemplate> selectSystemTemplates();

    /**
     * 获取项目工作流
     */
    List<WorkflowTemplate> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 获取默认工作流
     */
    WorkflowTemplate selectDefaultTemplate(@Param("projectId") Long projectId);

    /**
     * 获取工作流详情（包含状态和流转规则）
     */
    WorkflowTemplate selectWithDetails(@Param("id") Long id);

    /**
     * 获取用户创建的工作流
     */
    List<WorkflowTemplate> selectByCreatedBy(@Param("createdBy") Long createdBy);

    /**
     * 设置默认工作流
     */
    int setDefaultTemplate(@Param("id") Long id, @Param("projectId") Long projectId);

    /**
     * 取消默认工作流
     */
    int unsetDefaultTemplate(@Param("projectId") Long projectId);
}