# Mota Admin - 摩塔管理后台

> 基于 Ant Design Pro 6.x 构建的企业级管理后台系统

## 📋 项目简介

Mota Admin 是摩塔（Mota）项目的运营管理后台，提供租户管理、用户管理、内容管理、AI管理、系统配置、数据分析等核心功能。

### 技术栈

- **前端框架**: React 18 + TypeScript 5
- **UI组件库**: Ant Design 5.x + ProComponents
- **构建工具**: Umi 4.x (Ant Design Pro 内置)
- **状态管理**: Umi 内置 (dva)
- **HTTP请求**: Umi Request (基于 Axios)
- **后端对接**: 直连 API Gateway (无BFF层)

### 核心功能模块

```
├── 运营仪表盘     - 数据概览、实时监控、趋势分析
├── 租户管理       - 租户列表、套餐管理、订单管理
├── 用户管理       - 用户列表、用户审核、用户反馈
├── 内容管理       - 新闻管理、模板管理、内容审核
├── AI管理         - 模型配置、使用统计、成本控制
├── 系统管理       - 系统配置、角色权限、操作日志
└── 数据分析       - 用户分析、行为分析、自定义报表
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:8000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
mota-admin/
├── config/                 # UmiJS配置
│   ├── config.ts          # 主配置文件
│   ├── routes.ts          # 路由配置
│   ├── defaultSettings.ts # 默认设置
│   └── proxy.ts           # 代理配置
├── src/
│   ├── assets/            # 静态资源
│   ├── components/        # 全局组件
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面组件
│   │   ├── Dashboard/     # 仪表盘
│   │   ├── Tenant/        # 租户管理
│   │   ├── UserManage/    # 用户管理
│   │   ├── Content/       # 内容管理
│   │   ├── AI/            # AI管理
│   │   ├── System/        # 系统管理
│   │   └── Analysis/      # 数据分析
│   ├── services/          # API服务
│   ├── models/            # 数据模型
│   ├── utils/             # 工具函数
│   ├── locales/           # 国际化
│   ├── access.ts          # 权限定义
│   └── app.tsx            # 运行时配置
├── .env                   # 环境变量
├── .env.development       # 开发环境
├── .env.production        # 生产环境
└── package.json
```

## 🔧 配置说明

### API Gateway 配置

项目直接对接 API Gateway，无 BFF 层。配置文件位于 `src/app.tsx`:

```typescript
export const request: RequestConfig = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  requestInterceptors: [
    (url, options) => {
      const token = localStorage.getItem('mota_admin_token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { url, options };
    },
  ],
};
```

### 环境变量

- `.env` - 通用环境变量
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

主要配置项：
- `API_BASE_URL` - API Gateway 地址
- `APP_TITLE` - 应用标题

### 权限配置

权限配置文件位于 `src/access.ts`，支持以下角色：

| 角色 | 权限范围 |
|------|---------|
| admin | 超级管理员，全部权限 |
| operator | 运营管理员，租户/用户/内容管理 |
| support | 客服人员，用户支持和反馈 |
| analyst | 数据分析师，数据分析和报表 |
| ops | 技术运维，系统监控和日志 |

## 📝 开发规范

### 代码规范

- 使用 TypeScript 开发
- 遵循 ESLint 规则
- 组件使用 PascalCase 命名
- 函数使用 camelCase 命名
- 常量使用 UPPER_CASE 命名

### Git 提交规范

```bash
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具变动
```

## 🧪 测试

```bash
# 运行单元测试
npm run test

# 运行测试覆盖率
npm run test:coverage

# 更新快照
npm run test:update
```

## 📦 部署

### Docker 部署

```bash
# 构建镜像
docker build -t mota-admin:latest .

# 运行容器
docker run -p 80:80 mota-admin:latest
```

### Nginx 部署

```nginx
server {
    listen 80;
    server_name admin.mota.com;
    
    root /var/www/mota-admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://api-gateway:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📚 相关文档

- [架构方案](../plans/架构最终方案.md)
- [技术方案](../plans/mota-admin-技术方案.md)
- [开发规范](../plans/mota-admin-技术方案-补充.md)
- [Ant Design Pro 文档](https://pro.ant.design/)
- [UmiJS 文档](https://umijs.org/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 License

Copyright © 2026 Mota Team

## 📞 联系方式

- 项目地址: https://github.com/mota/mota-admin
- 技术支持: tech@mota.com
- 问题反馈: https://github.com/mota/mota-admin/issues

---

**当前版本**: v1.0.0  
**最后更新**: 2026-01-30  
**维护团队**: Mota 技术团队
