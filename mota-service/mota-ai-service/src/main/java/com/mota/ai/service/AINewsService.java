package com.mota.ai.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mota.ai.entity.AINews;

import java.util.List;

/**
 * AI新闻服务接口
 */
public interface AINewsService {

    /**
     * 获取新闻列表
     */
    IPage<AINews> getNewsList(String category, int page, int size);

    /**
     * 获取新闻详情
     */
    AINews getNewsById(String id);

    /**
     * 获取推荐新闻
     */
    List<AINews> getRecommendedNews(Long userId, int limit);

    /**
     * 按分类获取新闻
     */
    List<AINews> getNewsByCategory(String category, int limit);

    /**
     * 搜索新闻
     */
    IPage<AINews> searchNews(String keyword, int page, int size);

    /**
     * 刷新新闻（从外部源获取最新新闻）
     */
    void refreshNews();
    
    /**
     * 获取收藏的新闻
     */
    List<AINews> getStarredNews(int limit);
}