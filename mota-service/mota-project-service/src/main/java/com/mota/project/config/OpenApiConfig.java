package com.mota.project.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger 配置类
 */
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI motaOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Mota 项目协同 API")
                .description("Mota 项目协同模块 RESTful API 文档\n\n" +
                    "## 功能模块\n" +
                    "- **项目管理**: 项目的创建、查询、更新、删除等操作\n" +
                    "- **任务管理**: 执行任务的增删改查和状态管理\n" +
                    "- **部门任务**: 部门级别任务的管理\n" +
                    "- **里程碑**: 项目里程碑的管理\n" +
                    "- **工作计划**: 工作计划的提交和审批\n" +
                    "- **AI 功能**: 智能方案生成、PPT生成、任务分解等")
                .version("2.0.0")
                .contact(new Contact()
                    .name("Mota Team")
                    .email("support@mota.com")
                    .url("https://www.mota.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0")))
            .servers(List.of(
                new Server().url("http://localhost:8083").description("本地开发环境"),
                new Server().url("http://localhost:8080").description("网关入口")
            ));
    }
}