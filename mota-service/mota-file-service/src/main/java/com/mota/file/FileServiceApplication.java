package com.mota.file;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 文件服务启动类
 * 
 * @author mota
 */
@SpringBootApplication(scanBasePackages = {"com.mota"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota")
@MapperScan("com.mota.file.mapper")
@EnableAsync
@EnableScheduling
public class FileServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FileServiceApplication.class, args);
    }
}