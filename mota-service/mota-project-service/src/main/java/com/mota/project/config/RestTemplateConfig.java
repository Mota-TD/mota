package com.mota.project.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate 配置
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder, ClaudeConfig claudeConfig) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(claudeConfig.getTimeout()))
                .setReadTimeout(Duration.ofSeconds(claudeConfig.getTimeout()))
                .build();
    }
}