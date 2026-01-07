package com.mota.project.service.news;

import com.mota.project.entity.news.NewsArticle;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Protobuf序列化服务（占位实现）
 * 
 * 注意：此版本不使用Protobuf,仅作为占位符保持代码兼容性
 * 实际序列化由NewsCacheService使用JSON完成
 * 
 * @author Mota Team
 * @since 2026-01-06
 * @version 2.4
 */
@Slf4j
@Service
public class ProtobufSerializationService {

    /**
     * 序列化NewsArticle为字节数组（占位实现）
     * 实际不使用,返回null
     */
    public byte[] serialize(NewsArticle article) {
        log.warn("Protobuf序列化未实现,请使用JSON序列化");
        return null;
    }
    
    /**
     * 反序列化字节数组为NewsArticle（占位实现）
     * 实际不使用,返回null
     */
    public NewsArticle deserializeArticle(byte[] data) {
        log.warn("Protobuf反序列化未实现,请使用JSON反序列化");
        return null;
    }
}