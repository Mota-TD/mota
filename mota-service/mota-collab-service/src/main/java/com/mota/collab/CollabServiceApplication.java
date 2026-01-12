package com.mota.collab;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 协作服务启动类
 * 提供文档协作、实时编辑、版本控制等功能
 */
@SpringBootApplication(scanBasePackages = {"com.mota.collab", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.common.feign")
@MapperScan("com.mota.collab.mapper")
@EnableAsync
@EnableScheduling
public class CollabServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollabServiceApplication.class, args);
    }
}