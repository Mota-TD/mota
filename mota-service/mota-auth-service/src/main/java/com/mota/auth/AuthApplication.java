package com.mota.auth;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 认证服务启动类
 * 
 * 启动方式:
 * 1. 完整模式(需要Nacos、Redis): java -jar mota-auth-service.jar
 * 2. 独立模式(无需外部依赖): java -jar mota-auth-service.jar --spring.profiles.active=standalone
 */
@SpringBootApplication(scanBasePackages = "com.mota")
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota")
@MapperScan("com.mota.auth.mapper")
public class AuthApplication {

    public static void main(String[] args) {
        // Check if standalone mode is requested
        boolean isStandalone = false;
        for (String arg : args) {
            if (arg.contains("standalone")) {
                isStandalone = true;
                break;
            }
        }
        
        if (isStandalone) {
            // Exclude Redisson auto-configuration for standalone mode
            System.setProperty("spring.autoconfigure.exclude", 
                "org.redisson.spring.starter.RedissonAutoConfigurationV2");
        }
        
        SpringApplication.run(AuthApplication.class, args);
    }
}