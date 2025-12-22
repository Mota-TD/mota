package com.mota.issue;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 任务服务启动类
 */
@SpringBootApplication(scanBasePackages = "com.mota")
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota")
@MapperScan("com.mota.issue.mapper")
public class IssueApplication {

    public static void main(String[] args) {
        SpringApplication.run(IssueApplication.class, args);
    }
}