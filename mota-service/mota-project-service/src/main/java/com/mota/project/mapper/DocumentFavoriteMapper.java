package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.DocumentFavorite;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 文档收藏Mapper
 */
@Mapper
public interface DocumentFavoriteMapper extends BaseMapper<DocumentFavorite> {

    /**
     * 获取用户收藏的文档列表（带文档详情）
     */
    @Select("""
        SELECT df.*, d.title as document_title, d.summary as document_summary, 
               d.status as document_status, d.updated_at as document_updated_at,
               p.name as project_name
        FROM document_favorite df
        LEFT JOIN document d ON df.document_id = d.id
        LEFT JOIN project p ON d.project_id = p.id
        WHERE df.user_id = #{userId}
        ORDER BY df.created_at DESC
        LIMIT #{offset}, #{limit}
    """)
    List<DocumentFavorite> selectUserFavoritesWithDetails(@Param("userId") Long userId, 
                                                           @Param("offset") int offset, 
                                                           @Param("limit") int limit);

    /**
     * 获取用户收藏的文档列表（按收藏夹分类）
     */
    @Select("""
        SELECT df.*, d.title as document_title, d.summary as document_summary, 
               d.status as document_status, d.updated_at as document_updated_at,
               p.name as project_name
        FROM document_favorite df
        LEFT JOIN document d ON df.document_id = d.id
        LEFT JOIN project p ON d.project_id = p.id
        WHERE df.user_id = #{userId} AND df.folder_name = #{folderName}
        ORDER BY df.created_at DESC
    """)
    List<DocumentFavorite> selectUserFavoritesByFolder(@Param("userId") Long userId, 
                                                        @Param("folderName") String folderName);

    /**
     * 获取用户的收藏夹分类列表
     */
    @Select("""
        SELECT DISTINCT folder_name, COUNT(*) as count
        FROM document_favorite
        WHERE user_id = #{userId} AND folder_name IS NOT NULL
        GROUP BY folder_name
        ORDER BY folder_name
    """)
    List<java.util.Map<String, Object>> selectUserFolders(@Param("userId") Long userId);

    /**
     * 检查文档是否已收藏
     */
    @Select("SELECT COUNT(*) > 0 FROM document_favorite WHERE user_id = #{userId} AND document_id = #{documentId}")
    boolean isFavorited(@Param("userId") Long userId, @Param("documentId") Long documentId);

    /**
     * 获取用户收藏总数
     */
    @Select("SELECT COUNT(*) FROM document_favorite WHERE user_id = #{userId}")
    int countUserFavorites(@Param("userId") Long userId);

    /**
     * 删除收藏
     */
    @Delete("DELETE FROM document_favorite WHERE user_id = #{userId} AND document_id = #{documentId}")
    int deleteFavorite(@Param("userId") Long userId, @Param("documentId") Long documentId);

    /**
     * 批量删除收藏
     */
    @Delete("""
        <script>
        DELETE FROM document_favorite 
        WHERE user_id = #{userId} AND document_id IN 
        <foreach collection='documentIds' item='id' open='(' separator=',' close=')'>
            #{id}
        </foreach>
        </script>
    """)
    int batchDeleteFavorites(@Param("userId") Long userId, @Param("documentIds") List<Long> documentIds);

    /**
     * 更新收藏夹分类
     */
    @Update("UPDATE document_favorite SET folder_name = #{folderName} WHERE user_id = #{userId} AND document_id = #{documentId}")
    int updateFolderName(@Param("userId") Long userId, @Param("documentId") Long documentId, @Param("folderName") String folderName);
}