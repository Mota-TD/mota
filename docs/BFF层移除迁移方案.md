# BFF 层移除迁移方案

## 1. 背景

当前项目采用 BFF（Backend for Frontend）架构，在前端和微服务之间增加了一层 Node.js 服务。但在实际使用中遇到以下问题：

1. **接口不完整**：BFF 层没有实现所有微服务接口（如 departments 接口）
2. **Token 解析问题**：JWT token payload 格式不一致，导致用户信息获取失败
3. **维护成本高**：需要同时维护 BFF 层和微服务层的接口
4. **调试困难**：多了一层转发，增加了问题排查难度

因此决定**移除 BFF 层**，让前端直接调用微服务。

## 2. 当前架构

```
前端 (Next.js) → BFF (NestJS) → 微服务 (Spring Boot)
    ↓                ↓                    ↓
localhost:3000  localhost:3001      localhost:808x
```

### 当前端口分配

- **前端**: `localhost:3000`
- **BFF**: `localhost:3001`
- **API Gateway**: `localhost:8080`
- **Auth Service**: `localhost:8081`
- **User Service**: `localhost:8087`
- **其他微服务**: 8082-8089

### BFF 当前实现的模块

根据 `mota-bff/mota-user-bff/src/app.module.ts`：

1. ✅ AuthModule - 认证模块
2. ✅ UserModule - 用户模块
3. ✅ DashboardModule - 仪表板模块
4. ✅ ProjectModule - 项目模块
5. ✅ TaskModule - 任务模块
6. ✅ KnowledgeModule - 知识库模块
7. ✅ AIModule - AI 模块
8. ✅ NotificationModule - 通知模块
9. ✅ CalendarModule - 日历模块
10. ✅ RoleModule - 角色模块
11. ❌ DepartmentModule - **未实现**

## 3. 目标架构

```
前端 (Next.js) → API Gateway → 微服务 (Spring Boot)
    ↓                ↓              ↓
localhost:3000  localhost:8080  localhost:808x
```

### 优势

1. **架构简化**：减少一层转发，降低复杂度
2. **接口完整**：直接使用微服务的完整接口
3. **维护简单**：只需维护微服务层接口
4. **性能提升**：减少一次网络请求转发
5. **调试方便**：问题直接定位到微服务

## 4. API 端点映射

### 4.1 认证相关 (Auth Service - 8081)

| 前端调用 | BFF 端点 | 微服务端点 | 说明 |
|---------|---------|-----------|------|
| `/api/v1/auth/login` | `POST /api/v1/auth/login` | `POST http://localhost:8081/api/v1/auth/login` | 用户登录 |
| `/api/v1/auth/logout` | `POST /api/v1/auth/logout` | `POST http://localhost:8081/api/v1/auth/logout` | 用户登出 |
| `/api/v1/auth/refresh` | `POST /api/v1/auth/refresh` | `POST http://localhost:8081/api/v1/auth/refresh` | 刷新 Token |

### 4.2 用户相关 (User Service - 8087)

| 前端调用 | BFF 端点 | 微服务端点 | 说明 |
|---------|---------|-----------|------|
| `/api/v1/users/me` | `GET /api/v1/users/me` | `GET http://localhost:8087/api/v1/users/{userId}` | 获取当前用户 |
| `/api/v1/users` | `GET /api/v1/users` | `GET http://localhost:8087/api/v1/users` | 用户列表 |
| `/api/v1/users/{id}` | `GET /api/v1/users/{id}` | `GET http://localhost:8087/api/v1/users/{id}` | 用户详情 |

### 4.3 角色相关 (User Service - 8087)

| 前端调用 | BFF 端点 | 微服务端点 | 说明 |
|---------|---------|-----------|------|
| `/api/v1/roles` | `GET /api/v1/roles` | `GET http://localhost:8087/api/v1/roles` | 角色列表 |
| `/api/v1/roles/{id}` | `GET /api/v1/roles/{id}` | `GET http://localhost:8087/api/v1/roles/{id}` | 角色详情 |

### 4.4 部门相关 (User Service - 8087)

| 前端调用 | BFF 端点 | 微服务端点 | 说明 |
|---------|---------|-----------|------|
| `/api/v1/departments` | ❌ **未实现** | `GET http://localhost:8087/api/v1/departments` | 部门列表 |
| `/api/v1/departments/tree` | ❌ **未实现** | `GET http://localhost:8087/api/v1/departments/tree` | 部门树 |

### 4.5 项目相关 (Project Service - 8083)

| 前端调用 | BFF 端点 | 微服务端点 | 说明 |
|---------|---------|-----------|------|
| `/api/v1/projects` | `GET /api/v1/projects` | `GET http://localhost:8083/api/v1/projects` | 项目列表 |

### 4.6 任务相关 (Task Service - 8084)

| 前端调用 | BFF 端点 | 微服务端点 | 说明 |
|---------|---------|-----------|------|
| `/api/v1/tasks` | `GET /api/v1/tasks` | `GET http://localhost:8084/api/v1/tasks` | 任务列表 |

## 5. 迁移步骤

### 5.1 前端配置修改

#### 步骤 1: 更新环境变量

**文件**: `mota-web-next/.env.example`

```env
# 修改前
NEXT_PUBLIC_API_URL=http://localhost:3001

# 修改后
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### 步骤 2: 更新 API 客户端

**文件**: `mota-web-next/src/lib/api-client.ts`

需要修改的地方：
1. `baseURL` 配置
2. Token 刷新端点
3. 请求拦截器（添加 userId 到请求头）

#### 步骤 3: 更新 Auth Provider

**文件**: `mota-web-next/src/components/providers/auth-provider.tsx`

需要修改的地方：
1. 登录接口调用
2. 获取用户信息接口（`/api/v1/users/me` 需要改为直接调用 user-service）
3. Token 刷新逻辑

### 5.2 停止 BFF 服务

```bash
# 停止正在运行的 BFF 进程
taskkill /F /PID <BFF_PID>
```

### 5.3 验证功能

1. ✅ 登录功能
2. ✅ 获取用户信息
3. ✅ 角色列表
4. ✅ 部门列表（之前 404 的问题）
5. ✅ 项目列表
6. ✅ 任务列表

## 6. 注意事项

### 6.1 认证方式变化

- **BFF 方式**: 前端 → BFF（验证 JWT）→ 微服务
- **直连方式**: 前端 → API Gateway（验证 JWT）→ 微服务

需要确保 API Gateway 正确配置了 JWT 验证。

### 6.2 跨域配置

微服务需要配置 CORS，允许前端域名访问：

```yaml
# application.yml
spring:
  web:
    cors:
      allowed-origins: http://localhost:3000
      allowed-methods: GET,POST,PUT,DELETE,PATCH
      allowed-headers: "*"
      allow-credentials: true
```

### 6.3 错误处理

直接调用微服务时，错误响应格式可能与 BFF 不同，需要统一处理。

## 7. 回滚方案

如果迁移后出现问题，可以快速回滚：

1. 恢复 `.env` 文件中的 `NEXT_PUBLIC_API_URL=http://localhost:3001`
2. 重新启动 BFF 服务
3. 刷新前端页面

## 8. 后续优化

1. **移除 BFF 代码**：确认迁移成功后，可以删除 `mota-bff` 目录
2. **更新文档**：更新所有架构相关文档
3. **API Gateway 优化**：配置路由、限流、熔断等功能

## 9. 时间估算

- 前端配置修改：30 分钟
- 测试验证：30 分钟
- 文档更新：30 分钟
- **总计**：约 1.5 小时

## 10. 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| API Gateway 未配置 JWT 验证 | 高 | 中 | 提前验证 Gateway 配置 |
| 微服务 CORS 未配置 | 高 | 中 | 配置 CORS 允许前端域名 |
| 接口响应格式不一致 | 中 | 低 | 统一错误处理 |
| Token 刷新逻辑失败 | 高 | 低 | 保留 BFF 代码作为备份 |

---

**文档版本**: 1.0  
**创建时间**: 2026-01-20  
**最后更新**: 2026-01-20