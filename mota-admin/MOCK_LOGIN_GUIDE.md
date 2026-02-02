# Mock 登录测试指南

> **最后更新**: 2026-02-02  
> **版本**: v1.0.1

---

## 📋 概述

由于后端服务（mota-service）尚未部署运行，mota-admin 管理后台现已启用 **Mock 数据模式**，支持本地测试登录和所有功能模块。

---

## 🚀 快速开始

### 1. 启动开发服务器

```bash
cd mota-admin
npm install  # 如果未安装依赖
npm run dev
```

访问地址: **http://localhost:8000**

### 2. 登录凭证

#### 推荐账户
- **用户名**: `admin`
- **密码**: 任意密码（Mock 模式不验证）

#### 其他账户
由于启用了 Mock，您可以使用任何用户名和密码组合登录：
- `user123` + `password`
- `test` + `test123`
- 等等...

### 3. 登录步骤

1. 打开 http://localhost:8000
2. 输入用户名 `admin`
3. 输入任意密码
4. 点击 **登录** 按钮
5. 成功后会跳转到首页（Dashboard）

---

## 🔧 Mock 配置说明

### 启用 Mock 数据

在 `.env.development` 中已配置：

```bash
# Mock数据开关
MOCK=enable
```

### Mock 接口列表

Mock 数据已实现以下接口：

| 接口 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/v1/auth/login` | POST | 用户登录 | ✅ 已实现 |
| `/api/v1/auth/current-user` | GET | 获取当前用户信息 | ✅ 已实现 |
| `/api/v1/auth/logout` | POST | 用户登出 | ✅ 已实现 |
| `/api/v1/auth/refresh-token` | POST | 刷新 Token | ✅ 已实现 |
| `/api/v1/auth/validate-token` | GET | 验证 Token | ✅ 已实现 |
| `/api/v1/auth/change-password` | POST | 修改密码 | ✅ 已实现 |

### Mock 文件位置

```
mota-admin/
├── mock/
│   ├── auth.mock.ts          ← 认证接口 Mock
│   ├── user.ts               ← 用户相关 Mock
│   ├── monitor.mock.ts       ← 监控相关 Mock
│   └── ...其他 Mock 文件
```

---

## 📊 登录成功后的功能

登录成功后，您可以访问以下功能模块：

### 📈 运营仪表盘
- Dashboard/Overview - 数据概览
- Dashboard/Analysis - 数据分析
- Dashboard/Monitor - 实时监控

### 🏢 租户管理
- 租户列表
- 租户详情
- 套餐管理
- 订单管理

### 👥 用户管理
- 用户列表
- 用户详情
- 用户反馈

### 📰 内容管理
- 新闻列表
- 新闻编辑
- 模板管理
- 内容审核

### 🤖 AI 管理
- 模型管理
- 使用统计
- 成本控制

### ⚙️ 系统管理
- 系统配置
- 角色管理
- 操作日志
- 系统监控

### 📊 数据分析
- 用户分析
- 行为分析
- 自定义报表

---

## ⚠️ 重要说明

### Mock 模式的特点

✅ **优势**:
- 无需启动后端服务即可进行前端开发和测试
- 快速响应，开发效率高
- 支持本地调试和功能测试

❌ **限制**:
- Mock 数据不会真实保存
- 不支持数据持久化
- 列表数据为静态模拟数据

### 切换到真实 API

当后端服务（mota-service）部署运行后，按以下步骤切换到真实 API：

#### 步骤 1：禁用 Mock

修改 `.env.development`：
```bash
# 改为
MOCK=none
```

#### 步骤 2：配置 API 地址

修改 `.env.development`：
```bash
API_BASE_URL=http://your-backend-api:8080/api/v1
```

#### 步骤 3：重启开发服务器

```bash
npm run dev
```

---

## 🔐 Token 管理

### 登录流程

1. 前端发送登录请求到 `/api/v1/auth/login`
2. 后端（或 Mock）返回 Token：
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGc...",           // 访问令牌
    "refreshToken": "refresh_token", // 刷新令牌
    "expiresIn": 7200               // 过期时间（秒）
  }
}
```

3. 前端自动保存 Token 到 localStorage
4. 后续请求自动在 Header 中加入 Token

### Token 存储位置

```typescript
// 存储位置
localStorage.getItem('mota_admin_token')
localStorage.getItem('mota_admin_refresh_token')
localStorage.getItem('mota_admin_expires_in')
```

### Token 刷新机制

当 Token 即将过期时，前端会自动调用刷新接口：

```typescript
// 调用刷新接口
POST /api/v1/auth/refresh-token
{
  "refreshToken": "..."
}
```

---

## 🐛 常见问题

### Q1: 登录页面显示 "Network Error"

**原因**: 后端服务未运行或 Mock 未启用

**解决**:
1. 检查 `.env.development` 中 `MOCK=enable`
2. 重启开发服务器: `npm run dev`
3. 清除浏览器缓存并刷新页面

### Q2: 登录后立即跳转回登录页

**原因**: Token 保存或验证失败

**解决**:
1. 打开浏览器开发者工具 (F12)
2. 检查 Application > Local Storage 中是否有 `mota_admin_token`
3. 检查 Console 中是否有错误信息

### Q3: 某些页面数据为空

**原因**: 其他 API 接口的 Mock 还未实现

**解决**: 
- 当前只有认证接口实现了 Mock
- 其他数据接口需要等待后端服务部署
- 可以在 `mock/*.ts` 文件中添加更多 Mock 接口

---

## 📱 浏览器开发工具调试

### 查看网络请求

1. 打开 Chrome 开发工具: `F12`
2. 切换到 Network 标签
3. 点击登录按钮
4. 观察 `/api/v1/auth/login` 请求
5. 检查 Response 中的数据

### 查看 Token 存储

1. 打开 Chrome 开发工具: `F12`
2. 切换到 Application 标签
3. 左侧选择 Local Storage
4. 查看 http://localhost:8000 的数据
5. 检查 `mota_admin_token` 等键值

### 查看控制台错误

1. 打开 Chrome 开发工具: `F12`
2. 切换到 Console 标签
3. 查看是否有红色错误信息

---

## 🔄 后续步骤

### 短期目标（当前）
- ✅ Mock 认证接口已完成
- ⏳ 添加更多 Mock 数据接口
- ⏳ 完善前端页面功能

### 中期目标
- ⏳ 部署后端服务（mota-service）
- ⏳ 对接真实 API 接口
- ⏳ 进行集成测试

### 长期目标
- ⏳ 性能优化
- ⏳ 部署到生产环境
- ⏳ 监控和维护

---

## 📞 获取帮助

如遇到问题，请检查以下文件：

- 📄 [`README.md`](./README.md) - 项目主文档
- 📄 [`QUICK_START.md`](./QUICK_START.md) - 快速开始指南
- 📄 [`DEPLOYMENT.md`](./DEPLOYMENT.md) - 部署指南
- 📄 [`docs/`](./docs/) - 开发文档目录

---

**文档版本**: v1.0.1  
**最后更新**: 2026-02-02  
**维护团队**: Mota技术团队