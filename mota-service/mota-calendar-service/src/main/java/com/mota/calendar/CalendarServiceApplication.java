package com.mota.calendar;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 摩塔日历服务启动类
 * 
 * 提供以下日历能力：
 * - 个人日历（个人事项和提醒管理）
 * - 团队日历（团队共享事件）
 * - 项目日历（项目里程碑和截止日期）
 * - 任务日历（任务截止日期自动同步）
 * - 多视图支持（日/周/月/议程视图）
 * - 循环事件（支持复杂循环规则）
 * - 事件提醒（多渠道提醒）
 * - 日历订阅（iCal格式导入导出）
 * - 冲突检测（时间冲突自动检测）
 * 
 * @author mota
 * @since 1.0.0
 */
@SpringBootApplication(scanBasePackages = {"com.mota.calendar", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = {"com.mota.calendar.feign", "com.mota.common.feign"})
@MapperScan("com.mota.calendar.mapper")
@EnableAsync
@EnableScheduling
public class CalendarServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CalendarServiceApplication.class, args);
        System.out.println("""
            
            ╔═══════════════════════════════════════════════════════════════╗
            ║                                                               ║
            ║     __  __  ____  _____  _                                    ║
            ║    |  \\/  |/ __ \\|_   _|/ \\                                   ║
            ║    | |\\/| | |  | | | | / _ \\                                  ║
            ║    | |  | | |__| | | |/ ___ \\                                 ║
            ║    |_|  |_|\\____/  |_/_/   \\_\\                                ║
            ║                                                               ║
            ║          Calendar Service Started Successfully!               ║
            ║                                                               ║
            ╚═══════════════════════════════════════════════════════════════╝
            
            """);
    }
}