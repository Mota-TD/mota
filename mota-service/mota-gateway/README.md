# Mota Gateway - API网关

## 概述

Mota Gateway 是基于 Spring Cloud Gateway 构建的 API 网关服务，负责请求路由、认证授权、限流熔断、IP过滤等功能。

## 功能特性

### 1. 请求路由
- 基于路径的服务路由
- 服务发现集成（Nacos）
- 负载均衡支持

### 2. JWT认证
- Token验证和解析
- 白名单路径放行
- Token黑名单支持（用于登出）
- 用户信息传递到下游服务

### 3. IP过滤
- IP白名单模式
- IP黑名单模式
- CIDR格式支持
- 动态黑名单（Redis存储）

### 4. 请求体大小限制
- 全局大小限制
- 路径级别配置
- 文件上传特殊处理

### 5. 限流熔断
- 基于Redis的分布式限流
- Resilience4j熔断器
- 降级处理

### 6. 监控指标
- Prometheus指标暴露
- 健康检查端点
- 请求日志记录

## 配置说明

### JWT配置

```yaml
jwt:
  # JWT密钥（Base64编码，至少256位）
  secret: ${JWT_SECRET:your-secret-key}
  # Access Token过期时间（毫秒），默认24小时
  expiration: 86400000
  # Refresh Token过期时间（毫秒），默认7天
  refresh-expiration: 604800000
  # Token签发者
  issuer: mota
  # 白名单路径（不需要认证）
  white-list:
    - /api/v1/auth/login
    - /api/v1/auth/register
    - /api/v1/public/**
    - /actuator/**
```

### IP过滤配置

```yaml
gateway:
  ip-filter:
    # 是否启用IP过滤
    enabled: false
    # 是否使用白名单模式（true: 只允许白名单IP，false: 禁止黑名单IP）
    whitelist-mode: false
    # IP白名单
    whitelist:
      - 127.0.0.1
      - 192.168.1.0/24
    # IP黑名单
    blacklist:
      - 10.0.0.100
    # 动态黑名单配置
    dynamic-blacklist-enabled: true
    dynamic-blacklist-ttl: 3600
```

### 请求体大小限制配置

```yaml
gateway:
  request-size:
    # 是否启用
    enabled: true
    # 默认最大请求体大小（字节）
    max-request-size: 10485760  # 10MB
    # 文件上传最大大小（字节）
    max-file-upload-size: 104857600  # 100MB
    # 文件上传路径
    file-upload-paths:
      - /api/v1/knowledge/files/**
      - /api/v1/documents/upload/**
    # 路径级别的大小限制
    path-limits:
      /api/v1/ai/training/documents: 209715200  # 200MB
```

### 限流配置

```yaml
rate-limiter:
  enabled: true
  # 每秒请求数
  replenish-rate: 100
  # 令牌桶容量
  burst-capacity: 200
```

### 熔断配置

```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10000
        permitted-number-of-calls-in-half-open-state: 3
```

## 路由规则

### 服务路由表

| 路径模式 | 目标服务 | 说明 |
|---------|---------|------|
| /api/v1/auth/** | mota-auth-service | 认证服务 |
| /api/v1/users/** | mota-user-service | 用户服务 |
| /api/v1/projects/** | mota-project-service | 项目服务 |
| /api/v1/tasks/** | mota-project-service | 任务服务 |
| /api/v1/ai/** | mota-ai-service | AI服务 |
| /api/v1/knowledge/** | mota-knowledge-service | 知识服务 |
| /api/v1/notifications/** | mota-project-service | 通知服务 |
| /api/v1/calendar-events/** | mota-project-service | 日历服务 |

### 路由优先级

路由按照配置顺序匹配，更具体的路由应该放在前面。例如：
- `/api/v1/ai/news/**` 应该在 `/api/v1/ai/**` 之前

## 请求头传递

认证成功后，以下信息会通过请求头传递给下游服务：

| 请求头 | 说明 |
|-------|------|
| X-User-Id | 用户ID |
| X-Username | 用户名 |
| X-Org-Id | 组织ID |
| X-Tenant-Id | 租户ID |
| X-User-Roles | 用户角色 |
| X-Request-Id | 请求追踪ID |
| X-Client-IP | 客户端真实IP |

## 错误响应

### 401 Unauthorized

```json
{
  "code": 401,
  "message": "认证令牌已过期",
  "timestamp": 1704628800000,
  "success": false
}
```

### 403 Forbidden

```json
{
  "code": 403,
  "message": "IP地址已被禁止访问",
  "timestamp": 1704628800000,
  "success": false
}
```

### 413 Payload Too Large

```json
{
  "code": 413,
  "message": "请求体大小超过限制，最大允许 10.00 MB",
  "timestamp": 1704628800000,
  "success": false
}
```

### 429 Too Many Requests

```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后重试",
  "timestamp": 1704628800000,
  "success": false
}
```

### 503 Service Unavailable

```json
{
  "code": 503,
  "message": "服务暂时不可用，请稍后重试",
  "timestamp": 1704628800000,
  "success": false
}
```

## 监控端点

| 端点 | 说明 |
|-----|------|
| /actuator/health | 健康检查 |
| /actuator/health/liveness | 存活探针 |
| /actuator/health/readiness | 就绪探针 |
| /actuator/prometheus | Prometheus指标 |
| /actuator/gateway/routes | 路由列表 |
| /actuator/info | 应用信息 |

## 环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|-------|
| SPRING_PROFILES_ACTIVE | 激活的配置文件 | dev |
| NACOS_SERVER | Nacos服务地址 | localhost:8848 |
| NACOS_NAMESPACE | Nacos命名空间 | - |
| REDIS_HOST | Redis主机 | localhost |
| REDIS_PORT | Redis端口 | 6379 |
| REDIS_PASSWORD | Redis密码 | - |
| JWT_SECRET | JWT密钥 | - |
| IP_FILTER_ENABLED | 是否启用IP过滤 | false |
| RATE_LIMITER_ENABLED | 是否启用限流 | true |
| LOG_LEVEL | 日志级别 | INFO |

## 开发指南

### 添加新路由

1. 在 `application.yml` 的 `spring.cloud.gateway.routes` 下添加路由配置
2. 确保路由顺序正确（更具体的路由在前）
3. 根据需要添加过滤器（如 AuthFilter）

### 添加新过滤器

1. 创建过滤器类，实现 `GlobalFilter` 或继承 `AbstractGatewayFilterFactory`
2. 使用 `@Component` 注解注册
3. 实现 `Ordered` 接口控制执行顺序

### 本地开发

```bash
# 启动依赖服务
docker-compose -f deploy/docker-compose.middleware.yml up -d nacos redis

# 启动网关
mvn spring-boot:run -pl mota-gateway
```

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t mota-gateway:latest -f mota-gateway/Dockerfile .

# 运行容器
docker run -d \
  --name mota-gateway \
  -p 8080:8080 \
  -e NACOS_SERVER=nacos:8848 \
  -e REDIS_HOST=redis \
  mota-gateway:latest
```

### Docker Compose部署

参考 `deploy/docker-compose.services.yml` 中的网关服务配置。

## 故障排查

### 常见问题

1. **路由不生效**
   - 检查路由配置顺序
   - 确认服务已注册到Nacos
   - 查看网关日志

2. **认证失败**
   - 检查JWT密钥配置
   - 确认Token格式正确
   - 检查白名单配置

3. **限流触发**
   - 检查Redis连接
   - 调整限流参数
   - 查看Prometheus指标

### 日志配置

```yaml
logging:
  level:
    com.mota.gateway: DEBUG
    org.springframework.cloud.gateway: DEBUG
```

## 版本历史

| 版本 | 日期 | 说明 |
|-----|------|------|
| 1.0.0 | 2026-01-07 | 初始版本 |