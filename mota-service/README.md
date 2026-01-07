# Mota Service - 摩塔后端服务

摩塔 Mota 是一款 AI 驱动的项目管理与团队协作平台。本项目是摩塔的后端微服务架构实现。

## 技术栈

- **Java 21** - LTS 版本，支持虚拟线程
- **Spring Boot 3.2** - 微服务基础框架
- **Spring Cloud 2023.x** - 微服务套件
- **Spring Cloud Alibaba** - Nacos 服务注册与配置
- **Spring Cloud Gateway** - API 网关
- **MyBatis Plus 3.5** - ORM 框架
- **MySQL 8.0** - 关系型数据库
- **Redis 7** - 缓存
- **JWT** - 认证授权

## 项目结构

```
mota-service/
├── mota-gateway/                 # API 网关
├── mota-auth-service/            # 认证服务
├── mota-project-service/         # 项目服务
├── mota-ai-service/              # AI 服务
├── mota-knowledge-service/       # 知识库服务
├── mota-notify-service/          # 通知服务
├── mota-calendar-service/        # 日历服务
├── mota-common/                  # 公共模块
│   ├── mota-common-core/         # 核心工具
│   ├── mota-common-security/     # 安全模块
│   ├── mota-common-redis/        # Redis 模块
│   ├── mota-common-mybatis/      # MyBatis 模块
│   └── mota-common-log/          # 日志模块
├── mota-api/                     # API 定义模块
│   ├── mota-api-user/            # 用户服务 API
│   ├── mota-api-project/         # 项目服务 API
│   ├── mota-api-knowledge/       # 知识库服务 API
│   └── mota-api-notify/          # 通知服务 API
├── sql/                          # 数据库脚本
└── docker/                       # Docker 配置
```

## 微服务数据库架构

本项目采用微服务多库设计，每个微服务使用独立的数据库：

| 数据库 | 服务账户 | 微服务 | 说明 |
|--------|----------|--------|------|
| `mota_auth` | mota_auth | mota-auth-service | 用户、企业、部门、SSO、权限 |
| `mota_project` | mota_project | mota-project-service | 项目、任务、里程碑、文档、工作流 |
| `mota_ai` | mota_ai | mota-ai-service | AI对话、方案生成、智能搜索、新闻 |
| `mota_knowledge` | mota_knowledge | mota-knowledge-service | 文件管理、分类、标签、模板 |
| `mota_notify` | mota_notify | mota-notify-service | 通知、订阅、邮件队列、推送 |
| `mota_calendar` | mota_calendar | mota-calendar-service | 日历事件、参与者、提醒、订阅 |

> 所有服务账户密码统一为：`mota123`

## 服务端口

| 服务 | 端口 | 说明 |
|-----|------|------|
| mota-gateway | 8080 | API 网关 |
| mota-auth-service | 8081 | 认证服务 |
| mota-project-service | 8083 | 项目服务 |
| mota-ai-service | 8085 | AI 服务 |
| mota-knowledge-service | 8086 | 知识库服务 |
| mota-notify-service | 8087 | 通知服务 |
| mota-calendar-service | 8088 | 日历服务 |

## 快速开始

### 环境要求

- JDK 21+
- Maven 3.9+
- Docker Desktop
- MySQL 8.0+ (通过 Docker 提供)
- Redis 7+ (通过 Docker 提供)

### 本地开发

1. **启动基础设施**

```bash
# 进入 docker 目录
cd docker

# 使用 Docker Compose 启动 MySQL、Redis
docker-compose up -d

# 或者在 Windows 上直接运行
start.bat
```

2. **初始化/重置数据库**

```bash
# Windows 用户运行
reset-db.bat

# 或者手动执行
docker exec -i mota-mysql mysql -uroot -proot123 < ./init-db.sql
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

# 启动项目服务
cd mota-project-service && mvn spring-boot:run

# 启动 AI 服务
cd mota-ai-service && mvn spring-boot:run

# 启动知识库服务
cd mota-knowledge-service && mvn spring-boot:run

# 启动通知服务
cd mota-notify-service && mvn spring-boot:run

# 启动日历服务
cd mota-calendar-service && mvn spring-boot:run
```

### 配置说明

主要配置项通过环境变量或 Nacos 配置中心管理：

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| NACOS_SERVER | localhost:8848 | Nacos 服务地址 |
| DB_HOST | localhost | 数据库主机 |
| DB_PORT | 3306 | 数据库端口 |
| DB_NAME | (各服务不同) | 数据库名称 |
| DB_USERNAME | (各服务不同) | 数据库用户名 |
| DB_PASSWORD | mota123 | 数据库密码 |
| REDIS_HOST | localhost | Redis 主机 |
| REDIS_PORT | 6379 | Redis 端口 |
| JWT_SECRET | (内置) | JWT 密钥 |

## 使用 Navicat 连接数据库

### 方式一：使用 root 账户连接（管理员）

可以访问所有数据库，适合开发调试：

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota MySQL (root) |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | root |
| 密码 | root123 |

### 方式二：使用服务账户连接（推荐）

每个微服务使用独立账户，权限隔离更安全：

#### 1. 认证服务数据库 (mota_auth)

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota Auth DB |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | mota_auth |
| 密码 | mota123 |
| 默认数据库 | mota_auth |

#### 2. 项目服务数据库 (mota_project)

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota Project DB |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | mota_project |
| 密码 | mota123 |
| 默认数据库 | mota_project |

#### 3. AI 服务数据库 (mota_ai)

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota AI DB |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | mota_ai |
| 密码 | mota123 |
| 默认数据库 | mota_ai |

#### 4. 知识库服务数据库 (mota_knowledge)

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota Knowledge DB |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | mota_knowledge |
| 密码 | mota123 |
| 默认数据库 | mota_knowledge |

#### 5. 通知服务数据库 (mota_notify)

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota Notify DB |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | mota_notify |
| 密码 | mota123 |
| 默认数据库 | mota_notify |

#### 6. 日历服务数据库 (mota_calendar)

| 配置项 | 值 |
|--------|-----|
| 连接名 | Mota Calendar DB |
| 主机 | localhost |
| 端口 | 3306 |
| 用户名 | mota_calendar |
| 密码 | mota123 |
| 默认数据库 | mota_calendar |

### Navicat 连接步骤

1. 打开 Navicat，点击左上角 **连接** → **MySQL**
2. 填写连接信息（参考上方配置表）
3. 点击 **测试连接** 确认连接成功
4. 点击 **确定** 保存连接
5. 双击连接名即可打开数据库

### 常见问题

**Q: 连接失败，提示 "Access denied"**
- 检查用户名和密码是否正确
- 确保 Docker 容器正在运行：`docker ps`
- 确保数据库已初始化：运行 `reset-db.bat`

**Q: 连接失败，提示 "Can't connect to MySQL server"**
- 检查 Docker 是否启动
- 检查 MySQL 容器是否运行：`docker ps | grep mota-mysql`
- 检查端口 3306 是否被占用

**Q: 服务账户只能看到一个数据库**
- 这是正常的，每个服务账户只有对应数据库的权限
- 如需查看所有数据库，请使用 root 账户连接

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