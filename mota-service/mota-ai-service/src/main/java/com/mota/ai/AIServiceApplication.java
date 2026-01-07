package com.mota.ai;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 摩塔AI服务启动类
 * 
 * 提供以下AI能力：
 * - AI助手（智能问答、任务指令、工作建议）
 * - AI方案生成（意图识别、需求解析、方案生成）
 * - 智能搜索（语义搜索、向量检索、混合检索）
 * - 智能新闻推送（行业识别、新闻采集、智能匹配）
 * - AI知识库（文档解析、OCR识别、向量化存储）
 * - 多模型支持（GPT-4、Claude、通义千问、豆包）
 * 
 * @author mota
 * @since 1.0.0
 */
@SpringBootApplication(scanBasePackages = {"com.mota.ai", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.ai.feign")
@MapperScan("com.mota.ai.mapper")
@EnableAsync
@EnableScheduling
public class AIServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AIServiceApplication.class, args);
        System.out.println("""
            
            ╔═══════════════════════════════════════════════════════════════╗
            ║                                                               ║
            ║     __  __  ____  _____  _                                    ║
            ║    |  \\/  |/ __ \\|_   _|/ \\                                   ║
            ║    | |\\/| | |  | | | | / _ \\                                  ║
            ║    | |  | | |__| | | |/ ___ \\                                 ║
            ║    |_|  |_|\\____/  |_/_/   \\_\\                                ║
            ║                                                               ║
            ║              AI Service Started Successfully!                 ║
            ║                                                               ║
            ╚═══════════════════════════════════════════════════════════════╝
            
            """);
    }
}