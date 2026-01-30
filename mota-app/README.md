# Mota App - 移动端应用

基于 uni-app 开发的跨平台移动应用，支持 iOS、Android 和鸿蒙系统。

**项目状态**: ✅ 第一阶段完成 + ✅ 第二阶段完成 + ✅ 第三阶段完成（100%）

## 技术栈

- **框架**: uni-app + Vue 3 + TypeScript
- **构建工具**: Vite 5
- **UI组件**: uni-ui
- **状态管理**: Pinia
- **HTTP客户端**: uni.request (封装)
- **样式**: SCSS
- **AI能力**: 完整集成

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
│   ├── stores/            # Pinia状态管理
│   ├── styles/            # 全局样式
│   ├── static/            # 静态资源
│   ├── App.vue            # 应用入口
│   ├── main.ts            # 主入口文件
│   ├── pages.json         # 页面配置
│   └── manifest.json      # 应用配置
├── docs/                  # 文档（6个）
├── plans/                 # 计划文档
├── .env.development       # 开发环境配置
├── .env.production        # 生产环境配置
├── package.json
├── tsconfig.json
└── vite.config.ts
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

### 4. 消息通知
- ✅ 实时消息推送
- ✅ 消息分类管理
- ✅ 消息已读/未读
- ✅ 消息提醒设置

### 5. 日程管理 ⭐
- ✅ 日程创建与编辑
- ✅ 日历视图
- ✅ 提醒设置
- ✅ 项目/任务关联

### 6. 智能提醒 ⭐
- ✅ 任务到期提醒
- ✅ 项目进度提醒
- ✅ AI智能建议
- ✅ 提醒设置管理

### 7. 图像识别 ⭐⭐
- ✅ 通用文字识别
- ✅ 身份证识别
- ✅ 银行卡识别
- ✅ 营业执照识别
- ✅ 发票识别
- ✅ 表格识别
- ✅ 手写文字识别

### 8. 知识图谱 ⭐⭐
- ✅ 节点管理（7种类型）
- ✅ 关系管理（9种类型）
- ✅ 图谱查询与筛选
- ✅ 社区检测
- ✅ 中心性分析
- ✅ 知识推荐
- ✅ 知识缺口识别

### 9. 智能搜索 ⭐⭐
- ✅ 全文搜索
- ✅ AI语义搜索
- ✅ 搜索建议
- ✅ 搜索历史
- ✅ 热门搜索
- ✅ 搜索统计

### 10. 数据分析 ⭐⭐
- ✅ 项目数据分析
- ✅ 任务数据分析
- ✅ AI报表生成
- ✅ 趋势预测
- ✅ 数据可视化

### 11. 端侧AI ⭐⭐
- ✅ 模型管理（下载/删除）
- ✅ 本地推理
- ✅ 模型切换
- ✅ 性能监控
- ✅ 隐私保护

## 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
cd mota-app
npm install --legacy-peer-deps
```

### 开发运行

```bash
# H5开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# Android
npm run dev:app-android

# iOS
npm run dev:app-ios
```

### 构建打包

```bash
# H5生产构建
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# Android
npm run build:app-android

# iOS
npm run build:app-ios
```

## 环境配置

### 开发环境 (.env.development)
```
VITE_API_BASE_URL=http://localhost:8080
```

### 生产环境 (.env.production)
```
VITE_API_BASE_URL=https://api.mota.com
```

## API 接口

后端服务使用 `mota-service` 项目，主要接口：

- 用户服务: `/api/user/**`
- 项目服务: `/api/project/**`
- 任务服务: `/api/task/**`
- AI服务: `/api/ai/**`

## 多平台适配

### iOS
- 最低支持版本: iOS 12.0
- 使用 WKWebView

### Android
- 最低支持版本: Android 5.0 (API 21)
- 目标版本: Android 14 (API 34)

### 鸿蒙
- 最低支持版本: HarmonyOS 2.0
- 使用 ArkTS 适配层

## 性能优化

1. **图片优化**: 使用 WebP 格式，懒加载
2. **代码分割**: 按页面分包加载
3. **缓存策略**: HTTP缓存 + 本地存储
4. **网络优化**: 请求合并、防抖节流

## 安全措施

1. **Token认证**: JWT Token + Refresh Token
2. **数据加密**: 敏感数据本地加密存储
3. **HTTPS**: 生产环境强制使用HTTPS
4. **防重放**: 请求签名与时间戳验证

## 测试

```bash
# 单元测试
npm test

# E2E测试
npm run test:e2e
```

## 发布流程

1. 更新版本号 (manifest.json)
2. 构建生产包
3. 测试验证
4. 提交应用商店审核

## 相关项目

- [mota-service](../mota-service) - 后端服务
- [mota-web](../mota-web) - Web端应用
- [mota-admin](../mota-admin) - 管理后台

## License

MIT