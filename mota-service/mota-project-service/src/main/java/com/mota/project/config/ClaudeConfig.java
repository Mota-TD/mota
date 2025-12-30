package com.mota.project.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Claude AI 配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "ai.claude")
public class ClaudeConfig {
    
    /**
     * Claude API Key
     */
    private String apiKey;
    
    /**
     * Claude API Base URL
     */
    private String baseUrl = "https://api.anthropic.com/v1";
    
    /**
     * 默认模型
     */
    private String model = "claude-3-sonnet-20240229";
    
    /**
     * 最大token数
     */
    private Integer maxTokens = 4096;
    
    /**
     * 温度参数 (0-1)
     */
    private Double temperature = 0.7;
    
    /**
     * 请求超时时间（秒）
     */
    private Integer timeout = 60;
}