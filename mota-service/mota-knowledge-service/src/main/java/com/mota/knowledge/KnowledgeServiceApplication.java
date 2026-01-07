package com.mota.knowledge;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 摩塔知识服务启动类
 * 
 * 提供以下知识管理能力：
 * - 文档管理（上传、预览、下载、版本控制）
 * - 知识库管理（分类、标签、权限）
 * - 知识图谱（实体识别、关系抽取、图谱可视化）
 * - 文档协作（实时编辑、评论批注、版本对比）
 * - 模板库（系统模板、自定义模板、模板共享）
 * - 知识统计（访问统计、热门排行、知识缺口）
 * 
 * @author mota
 * @since 1.0.0
 */
@SpringBootApplication(scanBasePackages = {"com.mota.knowledge", "com.mota.common"})
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.mota.knowledge.feign")
@MapperScan("com.mota.knowledge.mapper")
@EnableAsync
@EnableScheduling
public class KnowledgeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(KnowledgeServiceApplication.class, args);
        System.out.println("""
            
            ╔═══════════════════════════════════════════════════════════════╗
            ║                                                               ║
            ║     __  __  ____  _____  _                                    ║
            ║    |  \\/  |/ __ \\|_   _|/ \\                                   ║
            ║    | |\\/| | |  | | | | / _ \\                                  ║
            ║    | |  | | |__| | | |/ ___ \\                                 ║
            ║    |_|  |_|\\____/  |_/_/   \\_\\                                ║
            ║                                                               ║
            ║          Knowledge Service Started Successfully!              ║
            ║                                                               ║
            ╚═══════════════════════════════════════════════════════════════╝
            
            """);
    }
}