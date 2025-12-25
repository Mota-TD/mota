package com.mota.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mota.project.entity.AINews;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * AI新闻Mapper
 */
@Mapper
public interface AINewsMapper extends BaseMapper<AINews> {
    
    /**
     * 获取最新新闻
     */
    List<AINews> selectLatestNews(@Param("limit") int limit);
    
    /**
     * 按行业获取新闻
     */
    List<AINews> selectByIndustry(@Param("industry") String industry, @Param("limit") int limit);
    
    /**
     * 获取热门新闻
     */
    List<AINews> selectTrendingNews(@Param("limit") int limit);
    
    /**
     * 搜索新闻
     */
    List<AINews> searchNews(@Param("keyword") String keyword, @Param("offset") int offset, @Param("limit") int limit);
    
    /**
     * 增加浏览次数
     */
    int incrementViewCount(@Param("id") String id);
}