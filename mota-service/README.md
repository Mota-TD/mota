# Mota Service - 摩塔后端服务

摩塔 Mota 是一款 AI 驱动的项目管理与团队协作平台。本项目是摩塔的后端微服务架构实现。

## 技术栈

- **Java 21** - LTS 版本，支持虚拟线程
- **Spring Boot 3.2** - 微服务基础框架
- **Spring Cloud 2023.x** - 微服务套件
- **Spring Cloud Alibaba** - Nacos 服务注册与配置
- **Spring Cloud Gateway** - API 网关
- **MyBatis Plus 3.5** - ORM 框架
- **PostgreSQL 16** - 关系型数据库
- **Redis 7** - 缓存
- **JWT** - 认证授权

## 项目结构

```
mota-service/
├── mota-gateway/                 # API 网关
├── mota-auth-service/            # 认证服务
├── mota-user-service/            # 用户服务
├── mota-project-service/         # 项目服务
├── mota-issue-service/           # 任务服务
├── mota-common/                  # 公共模块
│   ├── mota-common-core/         # 核心工具
│   ├── mota-common-security/     # 安全模块
│   ├── mota-common-redis/        # Redis 模块
│   ├── mota-common-mybatis/      # MyBatis 模块
│   └── mota-common-log/          # 日志模块
├── mota-api/                     # API 定义模块
│   ├── mota-api-auth/            # 认证服务 API
│   ├── mota-api-user/            # 用户服务 API
│   └── mota-api-project/         # 项目服务 API
├── sql/                          # 数据库脚本
└── docker/                       # Docker 配置
```

## 服务端口

| 服务 | 端口 | 说明 |
|-----|------|------|
| mota-gateway | 8080 | API 网关 |
| mota-auth-service | 8081 | 认证服务 |
| mota-user-service | 8082 | 用户服务 |
| mota-project-service | 8083 | 项目服务 |
| mota-issue-service | 8084 | 任务服务 |

## 快速开始

### 环境要求

- JDK 21+
- Maven 3.9+
- PostgreSQL 16+
- Redis 7+
- Nacos 2.3+

### 本地开发

1. **启动基础设施**

```bash
# 使用 Docker Compose 启动 PostgreSQL、Redis、Nacos
docker-compose -f docker/docker-compose.yml up -d
```

2. **初始化数据库**

```bash
# 执行数据库初始化脚本
psql -h localhost -U postgres -f sql/init.sql
```

3. **编译项目**

```bash
mvn clean install -DskipTests
```

4. **启动服务**

```bash
# 启动网关
cd mota-gateway && mvn spring-boot:run

# 启动认证服务
cd mota-auth-service && mvn spring-boot:run

# 启动用户服务
cd mota-user-service && mvn spring-boot:run

# 启动项目服务
cd mota-project-service && mvn spring-boot:run

# 启动任务服务
cd mota-issue-service && mvn spring-boot:run
```

### 配置说明

主要配置项通过环境变量或 Nacos 配置中心管理：

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| NACOS_SERVER | localhost:8848 | Nacos 服务地址 |
| DB_HOST | localhost | 数据库主机 |
| DB_PORT | 5432 | 数据库端口 |
| DB_NAME | mota_user | 数据库名称 |
| DB_USERNAME | postgres | 数据库用户名 |
| DB_PASSWORD | postgres | 数据库密码 |
| REDIS_HOST | localhost | Redis 主机 |
| REDIS_PORT | 6379 | Redis 端口 |
| JWT_SECRET | (内置) | JWT 密钥 |

## API 文档

启动服务后，访问以下地址查看 API 文档：

- 网关聚合文档: http://localhost:8080/doc.html
- 认证服务文档: http://localhost:8081/doc.html
- 用户服务文档: http://localhost:8082/doc.html

## 开发规范

### 代码规范

- 遵循阿里巴巴 Java 开发手册
- 使用 Lombok 简化代码
- 使用 MapStruct 进行对象映射

### 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 许可证

MIT License