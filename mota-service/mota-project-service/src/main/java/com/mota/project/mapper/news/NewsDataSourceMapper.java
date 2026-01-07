package com.mota.project.mapper.news;

import com.mota.project.entity.news.NewsDataSource;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 新闻数据源 Mapper
 */
@Mapper
public interface NewsDataSourceMapper {

    /**
     * 查询所有启用的数据源
     */
    List<NewsDataSource> selectAllEnabled();

    /**
     * 查询所有数据源
     */
    List<NewsDataSource> selectAll();

    /**
     * 根据ID查询
     */
    NewsDataSource selectById(@Param("id") Long id);

    /**
     * 更新最后采集时间和状态
     */
    int updateCrawlStatus(@Param("id") Long id, 
                          @Param("lastCrawlAt") LocalDateTime lastCrawlAt,
                          @Param("status") String status,
                          @Param("errorMessage") String errorMessage);

    /**
     * 更新文章总数
     */
    int updateTotalArticles(@Param("id") Long id, @Param("count") int count);

    /**
     * 增加文章数
     */
    int incrementTotalArticles(@Param("id") Long id, @Param("delta") int delta);
}