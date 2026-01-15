package com.mota.auth;

import com.mota.common.redis.config.RedisConfig;
import com.mota.common.redis.lock.DistributedLock;
import com.mota.common.redis.service.RedisService;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * 认证服务启动类
 *
 * 启动方式:
 * 1. 完整模式(需要Nacos、Redis): java -jar mota-auth-service.jar
 * 2. 本地开发模式(无需Redis): java -jar mota-auth-service.jar --spring.profiles.active=local
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota")
@MapperScan("com.mota.auth.mapper")
@ComponentScan(
    basePackages = "com.mota",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {RedisConfig.class, RedisService.class, DistributedLock.class}
    )
)
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }
}