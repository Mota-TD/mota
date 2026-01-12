package com.mota.search;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 搜索服务启动类
 * 
 * 提供全文检索、语义搜索、向量检索、搜索建议、搜索统计等功能
 * 
 * @author mota
 */
@SpringBootApplication(scanBasePackages = {"com.mota.search", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = {"com.mota.common.feign.client", "com.mota.search.feign"})
@EnableAsync
@EnableScheduling
public class SearchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SearchServiceApplication.class, args);
    }
}