package com.mota.project.service;

import com.mota.project.entity.AINews;

import java.util.List;
import java.util.Map;

/**
 * 智能新闻推送服务接口
 */
public interface AINewsService {

    // ========== 新闻获取 ==========

    /**
     * 获取推荐新闻
     * @param userId 用户ID
     * @param limit 数量限制
     * @return 推荐新闻列表
     */
    List<AINews> getRecommendedNews(Long userId, int limit);

    /**
     * 获取行业新闻
     * @param industry 行业
     * @param limit 数量限制
     * @return 行业新闻列表
     */
    List<AINews> getIndustryNews(String industry, int limit);

    /**
     * 获取热门新闻
     * @param limit 数量限制
     * @return 热门新闻列表
     */
    List<AINews> getTrendingNews(int limit);

    /**
     * 搜索新闻
     * @param keyword 关键词
     * @param page 页码
     * @param pageSize 每页数量
     * @return 搜索结果
     */
    List<AINews> searchNews(String keyword, int page, int pageSize);

    /**
     * 获取新闻详情
     * @param newsId 新闻ID
     * @return 新闻详情
     */
    AINews getNewsById(Long newsId);

    // ========== 个性化推荐 ==========

    /**
     * 构建用户画像
     * @param userId 用户ID
     * @return 用户画像
     */
    Map<String, Object> buildUserProfile(Long userId);

    /**
     * 更新用户兴趣
     * @param userId 用户ID
     * @param interests 兴趣标签
     */
    void updateUserInterests(Long userId, List<String> interests);

    /**
     * 获取用户兴趣标签
     * @param userId 用户ID
     * @return 兴趣标签列表
     */
    List<String> getUserInterests(Long userId);

    /**
     * 基于项目推荐新闻
     * @param projectId 项目ID
     * @param limit 数量限制
     * @return 相关新闻列表
     */
    List<AINews> getNewsForProject(Long projectId, int limit);

    // ========== 新闻分析 ==========

    /**
     * 分析新闻相关性
     * @param newsId 新闻ID
     * @param userId 用户ID
     * @return 相关性分数和原因
     */
    Map<String, Object> analyzeNewsRelevance(Long newsId, Long userId);

    /**
     * 提取新闻关键信息
     * @param newsId 新闻ID
     * @return 关键信息
     */
    Map<String, Object> extractNewsKeyInfo(Long newsId);

    /**
     * 生成新闻摘要
     * @param newsId 新闻ID
     * @param maxLength 最大长度
     * @return 摘要
     */
    String generateNewsSummary(Long newsId, int maxLength);

    /**
     * 分析新闻情感
     * @param newsId 新闻ID
     * @return 情感分析结果
     */
    Map<String, Object> analyzeNewsSentiment(Long newsId);

    // ========== 用户交互 ==========

    /**
     * 记录新闻阅读
     * @param userId 用户ID
     * @param newsId 新闻ID
     */
    void recordNewsRead(Long userId, Long newsId);

    /**
     * 收藏新闻
     * @param userId 用户ID
     * @param newsId 新闻ID
     */
    void favoriteNews(Long userId, Long newsId);

    /**
     * 取消收藏
     * @param userId 用户ID
     * @param newsId 新闻ID
     */
    void unfavoriteNews(Long userId, Long newsId);

    /**
     * 获取收藏的新闻
     * @param userId 用户ID
     * @param page 页码
     * @param pageSize 每页数量
     * @return 收藏新闻列表
     */
    List<AINews> getFavoriteNews(Long userId, int page, int pageSize);

    /**
     * 标记新闻为不感兴趣
     * @param userId 用户ID
     * @param newsId 新闻ID
     * @param reason 原因
     */
    void markAsNotInterested(Long userId, Long newsId, String reason);

    /**
     * 分享新闻
     * @param userId 用户ID
     * @param newsId 新闻ID
     * @param platform 分享平台
     */
    void shareNews(Long userId, Long newsId, String platform);

    // ========== 推送管理 ==========

    /**
     * 获取推送设置
     * @param userId 用户ID
     * @return 推送设置
     */
    Map<String, Object> getPushSettings(Long userId);

    /**
     * 更新推送设置
     * @param userId 用户ID
     * @param settings 设置
     */
    void updatePushSettings(Long userId, Map<String, Object> settings);

    /**
     * 发送新闻推送
     * @param userId 用户ID
     * @param newsIds 新闻ID列表
     */
    void sendNewsPush(Long userId, List<Long> newsIds);

    /**
     * 获取推送历史
     * @param userId 用户ID
     * @param page 页码
     * @param pageSize 每页数量
     * @return 推送历史
     */
    List<Map<String, Object>> getPushHistory(Long userId, int page, int pageSize);

    // ========== 新闻源管理 ==========

    /**
     * 获取新闻源列表
     * @return 新闻源列表
     */
    List<Map<String, Object>> getNewsSources();

    /**
     * 订阅新闻源
     * @param userId 用户ID
     * @param sourceId 新闻源ID
     */
    void subscribeSource(Long userId, Long sourceId);

    /**
     * 取消订阅新闻源
     * @param userId 用户ID
     * @param sourceId 新闻源ID
     */
    void unsubscribeSource(Long userId, Long sourceId);

    /**
     * 获取用户订阅的新闻源
     * @param userId 用户ID
     * @return 订阅的新闻源列表
     */
    List<Map<String, Object>> getUserSubscribedSources(Long userId);

    // ========== 统计分析 ==========

    /**
     * 获取阅读统计
     * @param userId 用户ID
     * @param period 时间段
     * @return 阅读统计
     */
    Map<String, Object> getReadingStats(Long userId, String period);

    /**
     * 获取热门话题
     * @param limit 数量限制
     * @return 热门话题列表
     */
    List<Map<String, Object>> getHotTopics(int limit);

    /**
     * 获取行业趋势
     * @param industry 行业
     * @return 趋势分析
     */
    Map<String, Object> getIndustryTrends(String industry);
}