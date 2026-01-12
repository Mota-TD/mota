package com.mota.search.dto;

import lombok.Data;

import java.util.List;

/**
 * 搜索建议响应DTO
 * 
 * @author mota
 */
@Data
public class SuggestionResponse {

    /**
     * 搜索建议列表
     */
    private List<Suggestion> suggestions;

    /**
     * 热门搜索词
     */
    private List<HotKeyword> hotKeywords;

    /**
     * 历史搜索词
     */
    private List<String> historyKeywords;

    /**
     * 搜索建议项
     */
    @Data
    public static class Suggestion {
        /**
         * 建议文本
         */
        private String text;

        /**
         * 建议类型：completion-补全, correction-纠错, related-相关
         */
        private String type;

        /**
         * 匹配分数
         */
        private Float score;

        /**
         * 高亮文本
         */
        private String highlight;

        /**
         * 关联文档数量
         */
        private Long docCount;
    }

    /**
     * 热门关键词
     */
    @Data
    public static class HotKeyword {
        /**
         * 关键词
         */
        private String keyword;

        /**
         * 搜索次数
         */
        private Long searchCount;

        /**
         * 热度趋势：up-上升, down-下降, stable-稳定
         */
        private String trend;

        /**
         * 是否为新热词
         */
        private Boolean isNew;
    }
}