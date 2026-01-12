# Mota 部署目录结构

本目录包含 Mota 平台的所有部署相关配置文件。

## 目录结构

```
deploy/
├── README.md                    # 本文档
├── .env.example                 # 环境变量示例文件
├── docker-compose.yml           # 主编排文件
├── docker-compose.middleware.yml # 中间件编排文件
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

# 编辑环境变量
vim .env
```

### 2. 启动中间件

```bash
# 启动基础中间件（MySQL、Redis、Nacos）
docker-compose -f docker-compose.middleware.yml up -d
```

### 3. 启动微服务

```bash
# 启动所有微服务
docker-compose -f docker-compose.services.yml up -d
```

### 4. 启动监控

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

## 文档

- [部署指南](docs/deployment-guide.md)
- [故障排查](docs/troubleshooting.md)