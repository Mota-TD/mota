# Mota User - 摩塔项目管理系统前端

基于 React 18 + TypeScript + Vite 构建的现代化项目管理系统前端应用。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite 5.0+
- **UI 组件库**: Ant Design 5.x
- **状态管理**: Zustand 4.4+
- **路由**: React Router 6.x
- **HTTP 客户端**: Axios
- **图表**: ECharts
- **日期处理**: Day.js

## 项目结构

```
mota-user/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 图片、字体等资源
│   ├── components/        # 通用组件
│   ├── hooks/             # 自定义 Hooks
│   ├── layouts/           # 布局组件
│   │   ├── AuthLayout/    # 认证页面布局
│   │   └── ConsoleLayout/ # 控制台布局
│   ├── pages/             # 页面组件
│   │   ├── auth/          # 认证相关页面
│   │   ├── dashboard/     # 仪表盘
│   │   ├── projects/      # 项目管理
│   │   ├── issues/        # 事项管理
│   │   ├── kanban/        # 看板
│   │   └── ...
│   ├── router/            # 路由配置
│   ├── services/          # API 服务
│   │   └── mock/          # Mock 数据
│   ├── store/             # 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 入口文件
│   └── vite-env.d.ts      # Vite 类型声明
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # Node TypeScript 配置
└── vite.config.ts         # Vite 配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能模块

### 已实现

- [x] 项目基础架构
- [x] 路由配置
- [x] 状态管理
- [x] Mock API 服务
- [x] 认证布局
- [x] 控制台布局
- [x] 登录页面
- [x] 注册页面
- [x] 仪表盘页面
- [x] 项目列表页面
- [x] 事项列表页面
- [x] 看板页面

### 待实现

- [ ] 项目详情页面
- [ ] 事项详情页面
- [ ] 迭代管理
- [ ] 待办事项
- [ ] Wiki 知识库
- [ ] 成员管理
- [ ] 系统设置
- [ ] 个人设置
- [ ] 通知中心
- [ ] 效能度量

## Mock 数据

项目使用 Mock 数据模拟后端 API，所有 Mock 数据和 API 定义在 `src/services/mock/` 目录下：

- `data.ts` - Mock 数据定义
- `api.ts` - Mock API 函数

## 开发规范

### 代码风格

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 React Hooks 最佳实践

### 组件规范

- 使用函数式组件
- 使用 CSS Modules 进行样式隔离
- 组件文件使用 PascalCase 命名

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 许可证

MIT