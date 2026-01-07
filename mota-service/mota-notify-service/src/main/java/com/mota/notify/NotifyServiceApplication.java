package com.mota.notify;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 摩塔通知服务启动类
 * 
 * 提供以下通知能力：
 * - 站内通知（实时推送、消息中心）
 * - 邮件通知（模板邮件、批量发送）
 * - 移动推送（App推送、企微/钉钉推送）
 * - 通知聚合（相似通知合并）
 * - 智能分类（AI自动分类优先级）
 * - 免打扰模式（定时免打扰、例外规则）
 * - 订阅管理（自定义订阅规则）
 * 
 * @author mota
 * @since 1.0.0
 */
@SpringBootApplication(scanBasePackages = {"com.mota.notify", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.notify.feign")
@MapperScan("com.mota.notify.mapper")
@EnableAsync
@EnableScheduling
public class NotifyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotifyServiceApplication.class, args);
        System.out.println("""
            
            ╔═══════════════════════════════════════════════════════════════╗
            ║                                                               ║
            ║     __  __  ____  _____  _                                    ║
            ║    |  \\/  |/ __ \\|_   _|/ \\                                   ║
            ║    | |\\/| | |  | | | | / _ \\                                  ║
            ║    | |  | | |__| | | |/ ___ \\                                 ║
            ║    |_|  |_|\\____/  |_/_/   \\_\\                                ║
            ║                                                               ║
            ║           Notify Service Started Successfully!                ║
            ║                                                               ║
            ╚═══════════════════════════════════════════════════════════════╝
            
            """);
    }
}