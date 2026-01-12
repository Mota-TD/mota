package com.mota.task;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 任务服务启动类
 * 
 * 提供任务管理、子任务、检查清单、任务依赖、工作流等功能
 */
@SpringBootApplication(scanBasePackages = {"com.mota.task", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.common.feign")
@MapperScan("com.mota.task.mapper")
@EnableAsync
@EnableScheduling
public class TaskServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskServiceApplication.class, args);
    }
}