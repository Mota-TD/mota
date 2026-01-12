package com.mota.user;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 用户服务启动类
 * 
 * @author mota
 */
@SpringBootApplication(scanBasePackages = {"com.mota.user", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.common.feign")
@MapperScan("com.mota.user.mapper")
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}