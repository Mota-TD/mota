package com.mota.report;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 报表服务启动类
 * 提供数据统计、报表生成、数据导出、仪表盘等功能
 *
 * @author mota
 */
@SpringBootApplication(scanBasePackages = {"com.mota.report", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = {"com.mota.common.feign", "com.mota.report.feign"})
@MapperScan("com.mota.report.mapper")
@EnableAsync
@EnableScheduling
public class ReportServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReportServiceApplication.class, args);
    }
}