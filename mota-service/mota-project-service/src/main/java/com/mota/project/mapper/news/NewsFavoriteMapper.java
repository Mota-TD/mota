package com.mota.project.mapper.news;

import com.mota.project.entity.news.NewsFavorite;
import com.mota.project.entity.news.NewsFavoriteFolder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 新闻收藏 Mapper
 */
@Mapper
public interface NewsFavoriteMapper {

    // ==================== 收藏操作 ====================

    /**
     * 添加收藏
     */
    int insertFavorite(NewsFavorite favorite);

    /**
     * 删除收藏
     */
    int deleteFavorite(@Param("userId") Long userId, @Param("articleId") Long articleId);

    /**
     * 查询用户收藏列表
     */
    List<NewsFavorite> selectByUserId(@Param("userId") Long userId, 
                                       @Param("folderId") Long folderId,
                                       @Param("offset") int offset, 
                                       @Param("limit") int limit);

    /**
     * 检查是否已收藏
     */
    boolean existsFavorite(@Param("userId") Long userId, @Param("articleId") Long articleId);

    /**
     * 统计用户收藏数
     */
    int countByUserId(@Param("userId") Long userId);

    // ==================== 收藏夹操作 ====================

    /**
     * 创建收藏夹
     */
    int insertFolder(NewsFavoriteFolder folder);

    /**
     * 删除收藏夹
     */
    int deleteFolder(@Param("id") Long id);

    /**
     * 查询用户收藏夹列表
     */
    List<NewsFavoriteFolder> selectFoldersByUserId(@Param("userId") Long userId);

    /**
     * 更新收藏夹文章数
     */
    int updateFolderArticleCount(@Param("id") Long id, @Param("delta") int delta);

    /**
     * 获取默认收藏夹
     */
    NewsFavoriteFolder selectDefaultFolder(@Param("userId") Long userId);
}