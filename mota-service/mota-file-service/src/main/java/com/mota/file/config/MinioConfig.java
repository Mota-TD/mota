package com.mota.file.config;

import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MinIO配置
 * 
 * @author mota
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioConfig {

    /**
     * 服务地址
     */
    private String endpoint;

    /**
     * 访问密钥
     */
    private String accessKey;

    /**
     * 密钥
     */
    private String secretKey;

    /**
     * 默认存储桶
     */
    private String defaultBucket;

    /**
     * 公开访问存储桶
     */
    private String publicBucket;

    /**
     * 临时文件存储桶
     */
    private String tempBucket;

    /**
     * 缩略图存储桶
     */
    private String thumbnailBucket;

    /**
     * 预览文件存储桶
     */
    private String previewBucket;

    /**
     * 预签名URL过期时间（秒）
     */
    private Integer presignedExpiry = 3600;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }
}