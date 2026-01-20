# Mota 部署目录结构

本目录包含 Mota 平台的所有部署相关配置文件。

## 目录结构

```
deploy/
├── README.md                    # 本文档
├── .env.example                 # 环境变量示例文件
├── docker-compose.yml           # 主编排文件
├── docker-compose.lite.yml      # 轻量版中间件（开发环境推荐）
├── docker-compose.lite-cn.yml   # 轻量版中间件（国内镜像源）
├── docker-compose.middleware.yml # 完整版中间件编排文件
├── docker-compose.services.yml  # 微服务编排文件
├── docker-compose.monitor.yml   # 监控服务编排文件
├── nginx/                       # Nginx 配置
│   ├── nginx.conf              # Nginx 主配置
│   ├── conf.d/                 # 站点配置
│   │   ├── api.conf            # API 反向代理配置
│   │   └── static.conf         # 静态资源配置
│   └── ssl/                    # SSL 证书目录
├── mysql/                       # MySQL 配置
│   ├── my.cnf                  # MySQL 配置文件
│   └── init/                   # 初始化脚本
├── redis/                       # Redis 配置
│   └── redis.conf              # Redis 配置文件
├── nacos/                       # Nacos 配置
│   └── custom.properties       # Nacos 自定义配置
├── kafka/                       # Kafka 配置
│   └── server.properties       # Kafka 配置文件
├── elasticsearch/               # Elasticsearch 配置
│   └── elasticsearch.yml       # ES 配置文件
├── milvus/                      # Milvus 配置
│   └── milvus.yaml             # Milvus 配置文件
├── minio/                       # MinIO 配置
├── prometheus/                  # Prometheus 配置
│   ├── prometheus.yml          # Prometheus 配置
│   └── rules/                  # 告警规则
├── grafana/                     # Grafana 配置
│   ├── provisioning/           # 自动配置
│   └── dashboards/             # 仪表盘
├── scripts/                     # 部署脚本
│   ├── deploy.sh               # 部署脚本
│   ├── backup.sh               # 备份脚本
│   ├── restore.sh              # 恢复脚本
│   └── health-check.sh         # 健康检查脚本
└── docs/                        # 部署文档
    ├── deployment-guide.md     # 部署指南
    └── troubleshooting.md      # 故障排查
```

## 快速开始

### 1. 准备环境

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量（Windows 用户可用记事本打开）
vim .env
```

### 2. 配置 Docker 镜像加速器（国内用户必看）

如果您在国内，可能无法直接访问 Docker Hub，需要先配置镜像加速器。

#### 方法一：Docker Desktop 图形界面配置

1. 打开 Docker Desktop
2. 点击右上角齿轮图标 (Settings)
3. 选择 "Docker Engine"
4. 在 JSON 配置中添加以下内容：

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://docker.rainbond.cc"
  ]
}
```

5. 点击 "Apply & Restart"

#### 方法二：使用配置脚本（Windows）

运行项目根目录下的 `setup-docker-mirror.bat` 脚本，按提示操作。

#### 推荐的镜像加速器地址

| 加速器 | 地址 | 说明 |
|--------|------|------|
| 1ms.run | https://docker.1ms.run | 推荐，稳定 |
| xuanyuan | https://docker.xuanyuan.me | 备用 |
| rainbond | https://docker.rainbond.cc | 备用 |
| dockerhub.icu | https://dockerhub.icu | 备用 |

### 3. 启动中间件

#### 轻量版（开发环境推荐）

```bash
# 使用默认源
docker-compose -f docker-compose.lite.yml up -d

# 使用国内镜像源（推荐国内用户）
docker-compose -f docker-compose.lite-cn.yml up -d
```

轻量版包含：
- MySQL 8.0
- Redis 7
- Nacos 2.3

#### 完整版（生产环境）

```bash
# 启动完整中间件
docker-compose -f docker-compose.middleware.yml up -d
```

完整版额外包含：
- Kafka（消息队列）
- Elasticsearch（搜索引擎）
- Milvus（向量数据库）
- MinIO（对象存储）

### 4. 启动微服务

```bash
# 启动所有微服务
docker-compose -f docker-compose.services.yml up -d
```

### 5. 启动监控

```bash
# 启动监控服务（可选）
docker-compose -f docker-compose.monitor.yml up -d
```

## 环境要求

- Docker 24.0+
- Docker Compose 2.20+
- 最小配置：8核CPU、16GB内存、100GB存储
- 推荐配置：16核CPU、32GB内存、500GB SSD

## 端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80/443 | HTTP/HTTPS |
| Gateway | 8080 | API 网关 |
| Auth Service | 8081 | 认证服务 |
| Project Service | 8082 | 项目服务 |
| AI Service | 8083 | AI 服务 |
| Knowledge Service | 8084 | 知识服务 |
| Notify Service | 8085 | 通知服务 |
| Calendar Service | 8086 | 日历服务 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| Nacos | 8848 | 注册中心 |
| Kafka | 9092 | 消息队列 |
| Elasticsearch | 9200 | 搜索引擎 |
| Milvus | 19530 | 向量数据库 |
| MinIO | 9000/9001 | 对象存储 |
| Prometheus | 9090 | 监控 |
| Grafana | 3000 | 可视化 |

## 维护命令

```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 停止所有服务
docker-compose down

# 清理数据（危险操作）
docker-compose down -v
```

## 备份与恢复

```bash
# 执行备份
./scripts/backup.sh

# 执行恢复
./scripts/restore.sh [backup_file]
```

## 常见问题

### Docker 拉取镜像失败

**错误信息：**
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": net/http: request canceled while waiting for connection
```

**解决方案：**
1. 配置 Docker 镜像加速器（参见上文"配置 Docker 镜像加速器"章节）
2. 使用国内镜像源版本的 docker-compose 文件：
   ```bash
   docker-compose -f docker-compose.lite-cn.yml up -d
   ```
3. 检查网络连接，确保 Docker Desktop 正常运行

### 中间件启动超时

**解决方案：**
1. 增加等待时间，中间件首次启动需要下载镜像
2. 检查系统资源是否充足（内存、磁盘空间）
3. 查看容器日志：
   ```bash
   docker-compose logs -f [service_name]
   ```

### Windows 下脚本乱码

**解决方案：**
确保终端使用 UTF-8 编码，脚本已自动设置 `chcp 65001`。

## 文档

- [部署指南](docs/deployment-guide.md)
- [故障排查](docs/troubleshooting.md)

## 一键启动脚本

项目根目录提供了便捷的启动脚本：

| 脚本 | 说明 |
|------|------|
| `start-service.bat` | 后端服务启动脚本（包含菜单选项） |
| `start-user.bat` | 前端开发环境启动脚本 |
| `stop-user.bat` | 停止前端服务 |
| `setup-docker-mirror.bat` | Docker 镜像加速器配置助手 |