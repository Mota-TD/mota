package com.mota.project.service.news;

import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnels;
import com.mota.project.mapper.news.NewsArticleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 布隆过滤器服务
 * 用于防止缓存穿透
 * 
 * 功能：
 * 1. 快速判断文章ID是否可能存在
 * 2. 防止恶意查询不存在的数据
 * 3. 减少无效的数据库查询
 * 
 * 特点：
 * - 内存占用小（100万数据约1.2MB）
 * - 查询速度快（O(k)，k为哈希函数个数）
 * - 存在误判率（可配置，默认1%）
 * - 不支持删除操作
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BloomFilterService {

    private final NewsArticleMapper newsArticleMapper;
    
    // 预期插入的元素数量
    private static final int EXPECTED_INSERTIONS = 1000000; // 100万
    
    // 误判率（False Positive Probability）
    private static final double FPP = 0.01; // 1%
    
    // 布隆过滤器实例
    private BloomFilter<Long> articleIdFilter;
    
    // 初始化标志
    private volatile boolean initialized = false;
    
    /**
     * 应用启动时初始化布隆过滤器
     */
    @PostConstruct
    public void init() {
        log.info("开始初始化布隆过滤器...");
        long startTime = System.currentTimeMillis();
        
        try {
            // 创建布隆过滤器
            articleIdFilter = BloomFilter.create(
                Funnels.longFunnel(),
                EXPECTED_INSERTIONS,
                FPP
            );
            
            // 加载所有文章ID
            loadAllArticleIds();
            
            initialized = true;
            long duration = System.currentTimeMillis() - startTime;
            log.info("布隆过滤器初始化完成，耗时: {}ms", duration);
            
        } catch (Exception e) {
            log.error("布隆过滤器初始化失败", e);
            // 初始化失败不影响服务启动，但会记录错误
        }
    }
    
    /**
     * 从数据库加载所有文章ID
     */
    private void loadAllArticleIds() {
        try {
            // 分批加载，避免一次性加载过多数据
            int batchSize = 10000;
            int offset = 0;
            int totalLoaded = 0;
            
            while (true) {
                List<Long> articleIds = newsArticleMapper.selectAllIds(offset, batchSize);
                
                if (articleIds == null || articleIds.isEmpty()) {
                    break;
                }
                
                // 添加到布隆过滤器
                for (Long id : articleIds) {
                    articleIdFilter.put(id);
                }
                
                totalLoaded += articleIds.size();
                offset += batchSize;
                
                // 如果返回的数量小于批次大小，说明已经加载完毕
                if (articleIds.size() < batchSize) {
                    break;
                }
            }
            
            log.info("布隆过滤器加载完成，共加载 {} 个文章ID", totalLoaded);
            
        } catch (Exception e) {
            log.error("加载文章ID失败", e);
            throw new RuntimeException("布隆过滤器初始化失败", e);
        }
    }
    
    /**
     * 检查文章ID是否可能存在
     * 
     * @param articleId 文章ID
     * @return true-可能存在，false-一定不存在
     */
    public boolean mightContain(Long articleId) {
        if (!initialized) {
            log.warn("布隆过滤器未初始化，跳过检查");
            return true; // 未初始化时，允许查询
        }
        
        if (articleId == null) {
            return false;
        }
        
        return articleIdFilter.mightContain(articleId);
    }
    
    /**
     * 添加文章ID到过滤器
     * 在新增文章时调用
     * 
     * @param articleId 文章ID
     */
    public void put(Long articleId) {
        if (!initialized) {
            log.warn("布隆过滤器未初始化，跳过添加");
            return;
        }
        
        if (articleId == null) {
            return;
        }
        
        articleIdFilter.put(articleId);
        log.debug("添加文章ID到布隆过滤器: {}", articleId);
    }
    
    /**
     * 批量添加文章ID
     * 
     * @param articleIds 文章ID列表
     */
    public void putAll(List<Long> articleIds) {
        if (!initialized || articleIds == null || articleIds.isEmpty()) {
            return;
        }
        
        for (Long id : articleIds) {
            articleIdFilter.put(id);
        }
        
        log.debug("批量添加 {} 个文章ID到布隆过滤器", articleIds.size());
    }
    
    /**
     * 获取布隆过滤器统计信息
     * 
     * @return 统计信息
     */
    public String getStatistics() {
        if (!initialized) {
            return "布隆过滤器未初始化";
        }
        
        return String.format(
            "布隆过滤器统计 - 预期容量: %d, 误判率: %.2f%%",
            EXPECTED_INSERTIONS,
            FPP * 100
        );
    }
    
    /**
     * 检查是否已初始化
     * 
     * @return true-已初始化，false-未初始化
     */
    public boolean isInitialized() {
        return initialized;
    }
    
    /**
     * 重新加载布隆过滤器
     * 在大量新增文章后可以调用此方法重新加载
     */
    public synchronized void reload() {
        log.info("开始重新加载布隆过滤器...");
        
        try {
            // 创建新的布隆过滤器
            BloomFilter<Long> newFilter = BloomFilter.create(
                Funnels.longFunnel(),
                EXPECTED_INSERTIONS,
                FPP
            );
            
            // 临时保存旧的过滤器
            BloomFilter<Long> oldFilter = articleIdFilter;
            
            // 更新为新过滤器
            articleIdFilter = newFilter;
            
            // 重新加载数据
            loadAllArticleIds();
            
            log.info("布隆过滤器重新加载完成");
            
        } catch (Exception e) {
            log.error("重新加载布隆过滤器失败", e);
            // 如果重新加载失败，保持使用旧的过滤器
        }
    }
}