# Mota App 快速启动指南

## 项目状态

✅ **第一阶段完成** - AI核心MVP (100%)
✅ **第二阶段完成** - AI增强功能 (100%)
✅ **第三阶段完成** - AI全面功能 (100%)
✅ **移动端增强功能完成** - 离线功能与推送通知 (100%)

**代码统计**: ~12,000行代码
**服务模块**: 18个核心服务（新增3个）
**页面数量**: 12个主要页面
**功能特性**: 55+核心功能

## 前置要求

- Node.js >= 18
- npm >= 9
- HBuilderX（可选，用于App开发）

## 安装依赖

```bash
cd mota-app
npm install --legacy-peer-deps
```

## 开发运行

### H5 开发

```bash
npm run dev:h5
```

访问: http://localhost:3000

### 微信小程序

```bash
npm run dev:mp-weixin
```

然后使用微信开发者工具打开 `dist/dev/mp-weixin` 目录。

### App 开发

#### Android

```bash
npm run dev:app-android
```

#### iOS

```bash
npm run dev:app-ios
```

## 生产构建

### H5

```bash
npm run build:h5
```

### 微信小程序

```bash
npm run build:mp-weixin
```

### App

```bash
npm run build:app-android  # Android
npm run build:app-ios      # iOS
```

## 项目结构

```
mota-app/
├── src/
│   ├── pages/              # 页面（12个）
│   │   ├── index/          # 首页
│   │   ├── login/          # 登录页
│   │   ├── ai/             # AI模块
│   │   │   ├── chat/       # AI对话
│   │   │   ├── solution/   # 方案生成 ⭐
│   │   │   └── ocr/        # OCR识别 ⭐⭐
│   │   ├── knowledge/      # 知识管理
│   │   │   └── graph/      # 知识图谱 ⭐⭐
│   │   ├── search/         # 智能搜索 ⭐⭐
│   │   ├── analytics/      # 数据分析
│   │   │   └── report/     # 分析报表 ⭐⭐
│   │   ├── edge-ai/        # 端侧AI
│   │   │   └── models/     # 模型管理 ⭐⭐
│   │   ├── project/        # 项目管理
│   │   ├── task/           # 任务管理
│   │   └── message/        # 消息中心
│   ├── components/         # 公共组件
│   ├── core/              # 核心服务层（15个模块）
│   │   ├── http/          # HTTP请求封装
│   │   ├── ai/            # AI服务
│   │   ├── auth/          # 认证服务
│   │   ├── project/       # 项目管理
│   │   ├── task/          # 任务管理
│   │   ├── message/       # 消息通知
│   │   ├── voice/         # 语音服务 ⭐
│   │   ├── calendar/      # 日程管理 ⭐
│   │   ├── reminder/      # 智能提醒 ⭐
│   │   ├── document/      # 文档摘要 ⭐
│   │   ├── ocr/           # OCR识别 ⭐⭐
│   │   ├── knowledge/     # 知识图谱 ⭐⭐
│   │   ├── search/        # 智能搜索 ⭐⭐
│   │   ├── analytics/     # 数据分析 ⭐⭐
│   │   └── edge-ai/       # 端侧AI ⭐⭐
│   ├── services/          # 业务服务层（3个模块）⭐新增
│   │   ├── api.ts         # API服务封装
│   │   ├── offline.ts     # 离线功能管理器
│   │   └── notification.ts # 推送通知服务
│   ├── stores/            # Pinia状态管理
│   ├── styles/            # 全局样式
│   └── static/            # 静态资源
├── docs/                  # 文档（8个）
└── plans/                 # 计划文档
```

## 核心功能

### 1. AI能力（13个功能）
- ✅ 智能对话（支持流式输出）
- ✅ 项目智能分析
- ✅ 进度智能预测
- ✅ 风险智能评估
- ✅ **方案智能生成** ⭐
- ✅ **语音识别（ASR）** ⭐
- ✅ **语音合成（TTS）** ⭐
- ✅ **文档智能摘要** ⭐
- ✅ **图像识别/OCR（7种）** ⭐⭐
- ✅ **知识图谱分析** ⭐⭐
- ✅ **智能搜索** ⭐⭐
- ✅ **报表AI分析** ⭐⭐
- ✅ **端侧AI推理** ⭐⭐

### 2. 项目管理
- ✅ 项目列表与详情
- ✅ 项目成员管理
- ✅ 里程碑管理
- ✅ 项目统计与筛选

### 3. 任务管理
- ✅ 任务创建与编辑
- ✅ 任务状态流转
- ✅ 任务依赖关系
- ✅ 子任务与检查清单

### 4. 日程管理 ⭐
- ✅ 日程创建与编辑
- ✅ 日历视图展示
- ✅ 提醒设置
- ✅ 项目/任务关联

### 5. 智能提醒 ⭐
- ✅ 任务到期提醒
- ✅ 项目进度提醒
- ✅ AI智能建议
- ✅ 提醒设置管理

### 6. 消息通知与推送
- ✅ 实时消息推送
- ✅ 消息分类管理
- ✅ 消息已读/未读
- ✅ **离线消息队列** ⭐
- ✅ **智能推送通知** ⭐
- ✅ **多平台通知适配** ⭐

## 环境配置

### 开发环境

编辑 `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 生产环境

编辑 `.env.production`:

```env
VITE_API_BASE_URL=https://api.mota.com
```

## 常见问题

### 1. TypeScript 错误

运行 `npm install --legacy-peer-deps` 安装依赖后会自动解决。

### 2. 端口被占用

修改 `vite.config.ts` 中的端口配置。

### 3. 后端服务未启动

确保 `mota-service` 项目已启动并运行在配置的端口。

## 已完成功能

### 第一阶段 (100%)
- ✅ 项目初始化与配置
- ✅ 核心服务层（6个模块）
- ✅ 基础页面（6个）
- ✅ AI对话流式输出
- ✅ 认证与权限管理

### 第二阶段 (100%)
- ✅ AI方案生成
- ✅ 语音交互（ASR + TTS）
- ✅ 日程管理
- ✅ 智能提醒
- ✅ 文档AI摘要

### 第三阶段 (100%)
- ✅ 图像识别/OCR功能（7种类型）
- ✅ 知识图谱可视化
- ✅ 智能搜索功能
- ✅ 报表AI分析
- ✅ 端侧AI能力

### 移动端增强功能 (100%) ⭐新增
- ✅ **离线功能管理器** - 智能离线队列、自动同步、重试机制
- ✅ **推送通知服务** - 多类型通知、优先级管理、系统通知
- ✅ **API服务封装** - 统一API调用、错误处理、类型定义
- ✅ **任务/项目页面集成** - 离线操作、通知反馈、状态管理

## 文档导航

1. [项目初始化总结](./docs/01-项目初始化总结.md)
2. [第一阶段完成总结](./docs/02-项目开发完成总结.md)
3. [第二阶段开发总结](./docs/03-第二阶段开发总结.md)
4. [第三阶段开发总结](./docs/04-第三阶段开发总结.md)
5. [项目启动问题修复](./docs/05-项目启动问题修复总结.md)
6. [开发计划](../plans/mota-app-development-plan.md)

## 相关链接

- [uni-app 文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://cn.vitejs.dev/)