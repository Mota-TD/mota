package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.Document;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 文档Mapper接口
 */
@Mapper
public interface DocumentMapper extends BaseMapper<Document> {

    /**
     * 按项目ID获取文档列表
     */
    List<Document> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 按文件夹ID获取文档列表
     */
    List<Document> selectByFolderId(@Param("folderId") Long folderId);

    /**
     * 按创建者ID获取文档列表
     */
    List<Document> selectByCreatorId(@Param("creatorId") Long creatorId);

    /**
     * 搜索文档
     */
    List<Document> searchDocuments(@Param("keyword") String keyword, 
                                   @Param("projectId") Long projectId,
                                   @Param("offset") int offset, 
                                   @Param("limit") int limit);

    /**
     * 获取模板文档
     */
    List<Document> selectTemplates(@Param("projectId") Long projectId);

    /**
     * 获取最近访问的文档
     */
    List<Document> selectRecentDocuments(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 增加浏览次数
     */
    int incrementViewCount(@Param("id") Long id);

    /**
     * 更新当前版本号
     */
    int updateCurrentVersion(@Param("id") Long id, @Param("version") Integer version);

    /**
     * 按状态获取文档
     */
    List<Document> selectByStatus(@Param("status") String status, 
                                  @Param("projectId") Long projectId);

    /**
     * 获取文档统计信息
     */
    Long countByProjectId(@Param("projectId") Long projectId);
}