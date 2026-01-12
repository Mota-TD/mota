package com.mota.tenant;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 租户服务启动类
 * 
 * 提供多租户管理、套餐管理、计费管理等功能
 * 
 * @author mota
 */
@SpringBootApplication(scanBasePackages = {"com.mota.tenant", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.common.feign")
@MapperScan("com.mota.tenant.mapper")
@EnableScheduling
public class TenantServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TenantServiceApplication.class, args);
    }
}