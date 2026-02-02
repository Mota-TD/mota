# Mota Admin - 摩塔管理后台

> 基于 Ant Design Pro 6.x 构建的企业级管理后台系统

## 📋 项目简介

Mota Admin 是摩塔（Mota）项目的运营管理后台，提供租户管理、用户管理、内容管理、AI管理、系统配置、数据分析等核心功能。

### 技术栈

- **前端框架**: React 19.1.0 + TypeScript 5.6.3
- **UI组件库**: Ant Design 5.25.4 + Pro Components 2.7.19
- **数据可视化**: ECharts 6.0.0
- **构建工具**: UmiJS v4.6.25 + Mako (Rust-based bundler)
- **状态管理**: UmiJS Models
- **代码质量**: Biome + TypeScript
- **后端对接**: 直连 API Gateway (无BFF层)

### 核心功能模块（24个页面）

```
├── 运营仪表盘 (3页面)    - 数据概览、实时监控、趋势分析
├── 租户管理 (4页面)      - 租户列表、租户详情、套餐管理、订单管理
├── 用户管理 (3页面)      - 用户列表、用户详情、用户反馈
├── 内容管理 (4页面)      - 新闻列表、新闻编辑、模板管理、内容审核
├── AI管理 (3页面)        - 模型列表、使用统计、成本控制
├── 系统管理 (4页面)      - 系统配置、角色管理、操作日志、系统监控
└── 数据分析 (3页面)      - 用户分析、行为分析、自定义报表
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
├── docs/                  # 项目文档
│   ├── 01-项目初始化总结.md
│   ├── 02-第一阶段开发完成总结.md
│   ├── 03-第二阶段开发总结.md
│   └── 04-第三阶段开发总结.md
├── src/
│   ├── assets/            # 静态资源
│   ├── components/        # 全局组件
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面组件 (24个页面)
│   │   ├── Dashboard/     # 仪表盘 (3页面)
│   │   │   ├── Overview/     # 数据概览
│   │   │   ├── Monitor/      # 实时监控
│   │   │   └── Analysis/     # 数据分析
│   │   ├── Tenant/        # 租户管理 (4页面)
│   │   │   ├── TenantList/   # 租户列表
│   │   │   ├── TenantDetail/ # 租户详情
│   │   │   ├── PackageList/  # 套餐管理
│   │   │   └── OrderList/    # 订单管理
│   │   ├── UserManage/    # 用户管理 (3页面)
│   │   │   ├── UserList/     # 用户列表
│   │   │   ├── UserDetail/   # 用户详情
│   │   │   └── Feedback/     # 用户反馈
│   │   ├── Content/       # 内容管理 (4页面)
│   │   │   ├── NewsList/     # 新闻列表
│   │   │   ├── NewsEdit/     # 新闻编辑
│   │   │   ├── TemplateList/ # 模板管理
│   │   │   └── Audit/        # 内容审核
│   │   ├── AI/            # AI管理 (3页面)
│   │   │   ├── ModelList/    # 模型列表
│   │   │   ├── UsageStats/   # 使用统计
│   │   │   └── CostControl/  # 成本控制
│   │   ├── System/        # 系统管理 (4页面)
│   │   │   ├── Config/       # 系统配置
│   │   │   ├── Role/         # 角色管理
│   │   │   ├── OperationLog/ # 操作日志
│   │   │   └── Monitor/      # 系统监控
│   │   └── Analysis/      # 数据分析 (3页面)
│   │       ├── UserAnalysis/ # 用户分析
│   │       ├── Behavior/     # 行为分析
│   │       └── Report/       # 自定义报表
│   ├── services/          # API服务
│   ├── models/            # 数据模型
│   ├── utils/             # 工具函数
│   ├── locales/           # 国际化
│   ├── types/             # TypeScript类型定义
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

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 部署指南，包含：

- **Nginx 部署** - 完整配置示例
- **Apache 部署** - 完整配置示例
- **Docker 部署** - Dockerfile 和 Docker Compose
- **环境配置** - 环境变量和生产配置
- **常见问题** - 部署常见问题解决方案
- **监控与维护** - 日志监控、性能监控、备灾恢复

## 📚 相关文档

### 项目文档
- [项目初始化总结](./docs/01-项目初始化总结.md)
- [第一阶段开发总结](./docs/02-第一阶段开发完成总结.md)
- [第二阶段开发总结](./docs/03-第二阶段开发总结.md)
- [第三阶段开发总结](./docs/04-第三阶段开发总结.md)
- [Week 7最终阶段总结](./docs/05-Week7最终阶段总结.md)
- [部署指南](./DEPLOYMENT.md)

### 技术文档
- [Ant Design Pro 文档](https://pro.ant.design/)
- [UmiJS 文档](https://umijs.org/)
- [ECharts 文档](https://echarts.apache.org/)
- [ProComponents 文档](https://procomponents.ant.design/)

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

## 📊 开发进度

### 已完成功能模块

- ✅ **第一阶段** - 项目初始化、登录功能
- ✅ **第二阶段** - 14个页面（运营仪表盘、租户管理、用户管理、内容管理）
- ✅ **第三阶段** - 10个页面（AI管理、系统管理、数据分析）

### 统计数据

- **总页面数**: 24个
- **代码行数**: 50,000+行
- **组件数量**: 100+个
- **图表类型**: 15+种
- **生产构建大小**: 4.32MB (未压缩), ~1.2MB (gzip)
- **构建时间**: 4.47秒
- **代码质量**: TypeScript 100%, ESLint 100%
- **完成度**: 100% ✅

### 最新更新

**Week 7 最终阶段完成：**
- ✅ TypeScript 类型检查通过（零错误）
- ✅ ESLint 代码规范检查通过（132个文件）
- ✅ 生产构建成功（91个输出文件）
- ✅ 部署指南完成
- ✅ 最终项目总结文档完成

---

**当前版本**: v1.0.0
**最后更新**: 2026-02-02
**构建工具**: Mako + UmiJS v4.6.25
**维护团队**: Mota 技术团队
</content>
