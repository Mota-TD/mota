package com.mota.collab.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.collab.entity.Document;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 文档Mapper
 */
@Mapper
public interface DocumentMapper extends BaseMapper<Document> {

    /**
     * 查询文件夹下的文档列表
     */
    @Select("SELECT * FROM document WHERE parent_id = #{parentId} AND deleted = 0 ORDER BY is_folder DESC, sort_order ASC, created_at DESC")
    List<Document> selectByParentId(@Param("parentId") Long parentId);

    /**
     * 查询项目下的文档列表
     */
    @Select("SELECT * FROM document WHERE project_id = #{projectId} AND deleted = 0 ORDER BY is_folder DESC, sort_order ASC, created_at DESC")
    List<Document> selectByProjectId(@Param("projectId") Long projectId);

    /**
     * 查询用户收藏的文档
     */
    @Select("SELECT * FROM document WHERE created_by = #{userId} AND is_favorite = 1 AND deleted = 0 ORDER BY updated_at DESC")
    List<Document> selectFavorites(@Param("userId") Long userId);

    /**
     * 查询用户最近访问的文档
     */
    @Select("SELECT * FROM document WHERE created_by = #{userId} AND deleted = 0 ORDER BY last_edited_at DESC LIMIT #{limit}")
    List<Document> selectRecentDocuments(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 搜索文档
     */
    @Select("<script>" +
            "SELECT * FROM document WHERE deleted = 0 " +
            "<if test='keyword != null and keyword != \"\"'>" +
            "AND (title LIKE CONCAT('%', #{keyword}, '%') OR plain_text LIKE CONCAT('%', #{keyword}, '%')) " +
            "</if>" +
            "<if test='projectId != null'>" +
            "AND project_id = #{projectId} " +
            "</if>" +
            "<if test='docType != null and docType != \"\"'>" +
            "AND doc_type = #{docType} " +
            "</if>" +
            "ORDER BY updated_at DESC" +
            "</script>")
    IPage<Document> searchDocuments(Page<Document> page, 
                                    @Param("keyword") String keyword,
                                    @Param("projectId") Long projectId,
                                    @Param("docType") String docType);

    /**
     * 统计文件夹下的文档数量
     */
    @Select("SELECT COUNT(*) FROM document WHERE parent_id = #{parentId} AND deleted = 0")
    int countByParentId(@Param("parentId") Long parentId);

    /**
     * 获取文档树路径
     */
    @Select("WITH RECURSIVE doc_path AS (" +
            "  SELECT id, parent_id, title, 1 as level FROM document WHERE id = #{documentId} " +
            "  UNION ALL " +
            "  SELECT d.id, d.parent_id, d.title, dp.level + 1 " +
            "  FROM document d INNER JOIN doc_path dp ON d.id = dp.parent_id " +
            ") SELECT * FROM doc_path ORDER BY level DESC")
    List<Document> selectDocumentPath(@Param("documentId") Long documentId);

    /**
     * 增加访问次数
     */
    @Select("UPDATE document SET view_count = view_count + 1 WHERE id = #{documentId}")
    void incrementViewCount(@Param("documentId") Long documentId);
}