package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.TaskTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 任务模板Mapper接口
 */
@Mapper
public interface TaskTemplateMapper extends BaseMapper<TaskTemplate> {

    /**
     * 按分类获取模板
     */
    List<TaskTemplate> selectByCategory(@Param("category") String category);

    /**
     * 获取公开模板
     */
    List<TaskTemplate> selectPublicTemplates(@Param("offset") int offset,
                                             @Param("limit") int limit);

    /**
     * 获取用户创建的模板
     */
    List<TaskTemplate> selectByCreatorId(@Param("creatorId") Long creatorId);

    /**
     * 获取项目模板
     */
    List<TaskTemplate> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 搜索模板
     */
    List<TaskTemplate> searchTemplates(@Param("keyword") String keyword,
                                       @Param("offset") int offset,
                                       @Param("limit") int limit);

    /**
     * 获取热门模板
     */
    List<TaskTemplate> selectPopularTemplates(@Param("limit") int limit);

    /**
     * 增加使用次数
     */
    int incrementUseCount(@Param("id") Long id);

    /**
     * 获取所有分类
     */
    List<String> selectAllCategories();

    /**
     * 获取分类统计
     */
    List<Object> selectCategoryStats();

    /**
     * 按条件查询模板
     */
    List<TaskTemplate> selectByConditions(@Param("category") String category,
                                          @Param("isPublic") Boolean isPublic,
                                          @Param("creatorId") Long creatorId,
                                          @Param("offset") int offset,
                                          @Param("limit") int limit);
}