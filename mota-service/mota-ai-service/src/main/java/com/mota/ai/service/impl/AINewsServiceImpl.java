package com.mota.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mota.ai.entity.AINews;
import com.mota.ai.mapper.AINewsMapper;
import com.mota.ai.service.AINewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * AI新闻服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AINewsServiceImpl implements AINewsService {

    private final AINewsMapper newsMapper;

    @Override
    public IPage<AINews> getNewsList(String category, int page, int size) {
        Page<AINews> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AINews> wrapper = new LambdaQueryWrapper<>();
        
        if (category != null && !category.isEmpty()) {
            wrapper.eq(AINews::getCategory, category);
        }
        wrapper.eq(AINews::getDeleted, 0)
               .orderByDesc(AINews::getCreatedAt);
        
        return newsMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public AINews getNewsById(String id) {
        return newsMapper.selectById(id);
    }

    @Override
    public List<AINews> getRecommendedNews(Long userId, int limit) {
        LambdaQueryWrapper<AINews> wrapper = new LambdaQueryWrapper<>();
        
        // 根据相关度排序推荐新闻
        wrapper.eq(AINews::getDeleted, 0)
               .orderByDesc(AINews::getRelevance)
               .last("LIMIT " + limit);
        
        return newsMapper.selectList(wrapper);
    }

    @Override
    public List<AINews> getNewsByCategory(String category, int limit) {
        LambdaQueryWrapper<AINews> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AINews::getCategory, category)
               .eq(AINews::getDeleted, 0)
               .orderByDesc(AINews::getCreatedAt)
               .last("LIMIT " + limit);
        
        return newsMapper.selectList(wrapper);
    }

    @Override
    public IPage<AINews> searchNews(String keyword, int page, int size) {
        Page<AINews> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AINews> wrapper = new LambdaQueryWrapper<>();
        
        wrapper.and(w -> w.like(AINews::getTitle, keyword)
                         .or()
                         .like(AINews::getSummary, keyword)
                         .or()
                         .like(AINews::getContent, keyword))
               .eq(AINews::getDeleted, 0)
               .orderByDesc(AINews::getCreatedAt);
        
        return newsMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public void refreshNews() {
        // TODO: 实现从外部源获取最新新闻的逻辑
        // 1. 获取相关RSS源
        // 2. 抓取新闻内容
        // 3. AI分析和分类
        // 4. 保存到数据库
        log.info("刷新新闻");
    }
    
    @Override
    public List<AINews> getStarredNews(int limit) {
        LambdaQueryWrapper<AINews> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AINews::getIsStarred, 1)
               .eq(AINews::getDeleted, 0)
               .orderByDesc(AINews::getCreatedAt)
               .last("LIMIT " + limit);
        
        return newsMapper.selectList(wrapper);
    }
}