package com.mota.auth.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;

/**
 * 本地开发配置 - 排除 Redis 相关组件
 * 当 spring.profiles.active=local 时生效
 */
@Configuration
@ConditionalOnProperty(name = "spring.profiles.active", havingValue = "local")
@ComponentScan(
    basePackages = "com.mota.common.redis",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "com\\.mota\\.common\\.redis\\..*"
    )
)
public class LocalRedisConfig {
    // 这个配置类用于在 local profile 下排除 Redis 相关组件
}