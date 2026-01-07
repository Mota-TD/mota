package com.mota.project.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 新闻文章控制器
 * 提供新闻内容获取和实时抓取功能
 * 此控制器属于项目服务，提供项目相关的新闻文章功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/news/article")
@RequiredArgsConstructor
public class NewsArticleController {

    /**
     * 获取新闻完整内容
     * 如果数据库中没有完整内容,会尝试从原文链接实时抓取
     * 
     * @param id 新闻ID
     * @return 完整内容响应
     */
    @GetMapping("/{id}/full-content")
    public Map<String, Object> getFullContent(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // TODO: 从数据库查询新闻
            // NewsArticle article = newsArticleService.getById(id);
            
            // 模拟数据库查询结果
            String dbContent = null; // article.getContent()
            String sourceUrl = "https://example.com/news/" + id; // article.getSourceUrl()
            
            // 如果数据库中有完整内容,直接返回
            if (dbContent != null && dbContent.length() > 100) {
                result.put("content", dbContent);
                result.put("source", "database");
                return result;
            }
            
            // 如果没有完整内容,尝试从原文链接抓取
            if (sourceUrl != null && !sourceUrl.isEmpty()) {
                log.info("尝试从原文链接抓取内容: {}", sourceUrl);
                String crawledContent = crawlArticleContent(sourceUrl);
                
                if (crawledContent != null && !crawledContent.isEmpty()) {
                    result.put("content", crawledContent);
                    result.put("source", "crawled");
                    
                    // TODO: 可选 - 将抓取的内容保存到数据库
                    // article.setContent(crawledContent);
                    // newsArticleService.updateById(article);
                    
                    return result;
                }
            }
            
            // 如果都失败了,返回空内容
            result.put("content", "");
            result.put("source", "none");
            result.put("message", "无法获取文章内容");
            
        } catch (Exception e) {
            log.error("获取新闻完整内容失败: id={}", id, e);
            result.put("content", "");
            result.put("source", "error");
            result.put("message", "获取内容时发生错误: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * 从URL抓取文章内容
     * 使用Jsoup解析HTML并提取正文
     * 
     * @param url 文章URL
     * @return 文章内容HTML
     */
    private String crawlArticleContent(String url) {
        try {
            // 设置超时和User-Agent
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();
            
            // 尝试多种常见的文章内容选择器
            String[] selectors = {
                "article",
                ".article-content",
                ".post-content", 
                ".entry-content",
                ".content",
                "main article",
                "#article-content",
                ".article-body"
            };
            
            for (String selector : selectors) {
                Elements elements = doc.select(selector);
                if (!elements.isEmpty()) {
                    Element content = elements.first();
                    if (content != null) {
                        // 清理不需要的元素
                        content.select("script, style, iframe, .ad, .advertisement").remove();
                        
                        // 返回HTML内容
                        String html = content.html();
                        if (html.length() > 100) {
                            log.info("成功抓取文章内容,长度: {}", html.length());
                            return html;
                        }
                    }
                }
            }
            
            // 如果没有找到特定选择器,尝试获取body内容
            Element body = doc.body();
            if (body != null) {
                // 移除导航、侧边栏等
                body.select("nav, header, footer, aside, .sidebar, .menu").remove();
                String html = body.html();
                if (html.length() > 100) {
                    log.info("使用body内容,长度: {}", html.length());
                    return html;
                }
            }
            
            log.warn("未能提取到有效的文章内容: {}", url);
            return null;
            
        } catch (IOException e) {
            log.error("抓取文章内容失败: url={}", url, e);
            return null;
        }
    }
    
    /**
     * 响应数据类
     */
    @Data
    public static class FullContentResponse {
        private String content;
        private String source; // database, crawled, none
        private String message;
    }
}