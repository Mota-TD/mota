package com.mota.task;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 任务服务启动类
 */
@SpringBootApplication(scanBasePackages = {"com.mota.task", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.task.feign")
@MapperScan("com.mota.task.mapper")
public class TaskApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskApplication.class, args);
    }
}