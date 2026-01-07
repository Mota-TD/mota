package com.mota.project.mapper.news;

import com.mota.project.entity.news.NewsArticle;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 新闻文章 Mapper
 */
@Mapper
public interface NewsArticleMapper {

    /**
     * 插入新闻文章
     */
    int insert(NewsArticle article);

    /**
     * 批量插入新闻文章
     */
    int batchInsert(@Param("list") List<NewsArticle> articles);

    /**
     * 根据ID查询
     */
    NewsArticle selectById(@Param("id") Long id);

    /**
     * 根据URL查询（用于去重）
     */
    NewsArticle selectBySourceUrl(@Param("sourceUrl") String sourceUrl);

    /**
     * 查询所有新闻（分页）
     */
    List<NewsArticle> selectAll(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 按分类查询
     */
    List<NewsArticle> selectByCategory(@Param("category") String category, 
                                        @Param("offset") int offset, 
                                        @Param("limit") int limit);

    /**
     * 搜索新闻（标题和摘要）
     */
    List<NewsArticle> search(@Param("keyword") String keyword, 
                             @Param("offset") int offset, 
                             @Param("limit") int limit);

    /**
     * 查询政策新闻
     */
    List<NewsArticle> selectPolicyNews(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * 按关键词列表查询推荐新闻
     */
    List<NewsArticle> selectByKeywords(@Param("keywords") List<String> keywords, 
                                        @Param("offset") int offset, 
                                        @Param("limit") int limit);

    /**
     * 统计总数
     */
    int countAll();

    /**
     * 统计今日新闻数
     */
    int countToday(@Param("today") LocalDateTime today);

    /**
     * 按分类统计
     */
    int countByCategory(@Param("category") String category);

    /**
     * 统计政策新闻数
     */
    int countPolicyNews();

    /**
     * 搜索结果统计
     */
    int countSearch(@Param("keyword") String keyword);

    /**
     * 更新浏览次数
     */
    int incrementViewCount(@Param("id") Long id);

    /**
     * 更新收藏次数
     */
    int updateFavoriteCount(@Param("id") Long id, @Param("delta") int delta);

    /**
     * 删除旧新闻（保留最近N天）
     */
    int deleteOldNews(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * 检查URL是否存在
     */
    boolean existsBySourceUrl(@Param("sourceUrl") String sourceUrl);
    
    /**
     * 查询所有文章ID（用于布隆过滤器初始化）
     */
    List<Long> selectAllIds(@Param("offset") int offset, @Param("limit") int limit);
}