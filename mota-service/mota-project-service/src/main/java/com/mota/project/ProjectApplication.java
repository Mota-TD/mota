package com.mota.project;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 项目服务启动类
 */
@SpringBootApplication(scanBasePackages = "com.mota")
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota")
@MapperScan("com.mota.project.mapper")
public class ProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectApplication.class, args);
    }
}