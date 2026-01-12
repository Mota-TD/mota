package com.mota.search.service;

import com.mota.search.dto.SuggestionResponse;
import com.mota.search.entity.SearchHotword;

import java.util.List;

/**
 * 搜索建议服务接口
 * 
 * @author mota
 */
public interface SearchSuggestionService {

    /**
     * 获取搜索建议
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param prefix 输入前缀
     * @param limit 返回数量
     * @return 建议响应
     */
    SuggestionResponse getSuggestions(Long tenantId, Long userId, String prefix, int limit);

    /**
     * 获取自动补全建议
     *
     * @param tenantId 租户ID
     * @param prefix 输入前缀
     * @param limit 返回数量
     * @return 补全建议列表
     */
    List<String> getAutoComplete(Long tenantId, String prefix, int limit);

    /**
     * 获取拼写纠正建议
     *
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @return 纠正后的关键词
     */
    String getSpellCorrection(Long tenantId, String keyword);

    /**
     * 获取相关搜索词
     *
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @param limit 返回数量
     * @return 相关搜索词列表
     */
    List<String> getRelatedKeywords(Long tenantId, String keyword, int limit);

    /**
     * 获取热门搜索词
     *
     * @param tenantId 租户ID
     * @param period 时间周期：daily, weekly, monthly, all
     * @param limit 返回数量
     * @return 热门搜索词列表
     */
    List<SearchHotword> getHotKeywords(Long tenantId, String period, int limit);

    /**
     * 获取用户搜索历史
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param limit 返回数量
     * @return 搜索历史关键词列表
     */
    List<String> getUserSearchHistory(Long tenantId, Long userId, int limit);

    /**
     * 清除用户搜索历史
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     */
    void clearUserSearchHistory(Long tenantId, Long userId);

    /**
     * 删除单条搜索历史
     *
     * @param tenantId 租户ID
     * @param userId 用户ID
     * @param keyword 关键词
     */
    void deleteSearchHistory(Long tenantId, Long userId, String keyword);

    /**
     * 扩展同义词
     *
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @return 扩展后的关键词列表
     */
    List<String> expandSynonyms(Long tenantId, String keyword);

    /**
     * 更新热词统计
     *
     * @param tenantId 租户ID
     * @param keyword 关键词
     */
    void updateHotwordStats(Long tenantId, String keyword);

    /**
     * 刷新热词排行
     *
     * @param tenantId 租户ID
     */
    void refreshHotwordRanking(Long tenantId);
}