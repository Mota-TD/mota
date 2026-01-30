# mota-app 移动端APP开发计划

> 版本：1.0  
> 日期：2025-01-30  
> 文档类型：技术架构与开发计划

---

## 1. 项目概述

### 1.1 项目背景

mota-app 是摩塔 Mota 项目的移动端应用，作为现有 mota-web（Web端）的移动版本，旨在为用户提供随时随地的项目管理和AI辅助能力。

### 1.2 项目目标

- **平台覆盖**: 支持 iOS、Android、鸿蒙（HarmonyOS）三大移动平台
- **AI原生**: 以AI能力为核心，提供智能化的项目管理和协作体验
- **后端复用**: 完全复用现有 mota-service 后端微服务架构

### 1.3 技术选型

| 类别 | 技术方案 | 版本 | 说明 |
|------|----------|------|------|
| 开发框架 | uni-app | 3.x | 跨平台开发框架，支持iOS/Android/鸿蒙 |
| 前端框架 | Vue 3 | 3.4+ | 组合式API，性能更优 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 构建工具 | Vite | 5.x | 快速构建 |
| 状态管理 | Pinia | 2.x | Vue官方推荐 |
| UI组件库 | uView Plus | 3.x | 适配uni-app的组件库 |
| HTTP客户端 | uni.request封装 | - | 支持拦截器、类型定义 |
| 本地存储 | uni.storage + SQLite | - | 配置+结构化数据 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              mota-app 移动端                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          应用层 Pages                                │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ 首页    │ │AI助手   │ │项目管理 │ │任务管理 │ │消息中心 │       │   │
│  │  │ Home    │ │AI Chat  │ │Projects │ │Tasks    │ │Messages │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────┐     │
│  │                          公共组件层                                │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │     │
│  │  │导航栏   │ │AI对话框 │ │任务卡片 │ │项目卡片 │ │通知组件 │     │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │     │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────┐     │
│  │                          核心服务层 Core                           │     │
│  │  ┌───────────────────────────────────────────────────────────┐   │     │
│  │  │                      AI Service Layer                      │   │     │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │   │     │
│  │  │  │AIService│ │Stream   │ │Voice    │ │Multimodal│          │   │     │
│  │  │  │统一接口 │ │Handler  │ │Service  │ │Service   │          │   │     │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │   │     │
│  │  └───────────────────────────────────────────────────────────┘   │     │
│  │                                                                   │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │     │
│  │  │HTTP     │ │Storage  │ │Auth     │ │Push     │               │     │
│  │  │请求封装 │ │本地存储 │ │认证服务 │ │推送服务 │               │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │     │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────┐     │
│  │                          原生插件层 Plugins                        │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │     │
│  │  │语音AI   │ │视觉AI   │ │端侧推理 │ │推送插件 │               │     │
│  │  │Voice    │ │Vision   │ │LocalAI  │ │Push     │               │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │     │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          mota-service 后端服务                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │Gateway  │ │User     │ │Project  │ │AI       │ │Notify   │ ...          │
│  │网关服务 │ │用户服务 │ │项目服务 │ │AI服务   │ │通知服务 │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 项目目录结构

```
mota-app/
├── src/
│   ├── core/                        # 核心框架层
│   │   ├── ai/                      # AI核心服务
│   │   │   ├── AIService.ts         # AI服务统一接口
│   │   │   ├── StreamHandler.ts     # SSE/WebSocket流式处理
│   │   │   ├── VoiceService.ts      # 语音服务接口
│   │   │   ├── MultimodalService.ts # 多模态服务接口
│   │   │   └── types.ts             # AI相关类型定义
│   │   ├── http/                    # HTTP通信层
│   │   │   ├── request.ts           # 请求封装
│   │   │   ├── interceptors.ts      # 拦截器
│   │   │   └── types.ts             # 请求类型定义
│   │   ├── storage/                 # 本地存储
│   │   │   ├── index.ts             # 存储管理
│   │   │   └── sqlite.ts            # SQLite封装
│   │   ├── auth/                    # 认证服务
│   │   │   ├── index.ts             # 认证管理
│   │   │   └── token.ts             # Token管理
│   │   └── push/                    # 推送服务
│   │       ├── index.ts             # 推送管理
│   │       └── handlers.ts          # 推送处理器
│   │
│   ├── stores/                      # 状态管理 (Pinia)
│   │   ├── user.ts                  # 用户状态
│   │   ├── project.ts               # 项目状态
│   │   ├── task.ts                  # 任务状态
│   │   ├── ai.ts                    # AI对话状态
│   │   └── notification.ts          # 通知状态
│   │
│   ├── services/                    # API服务层
│   │   ├── auth.ts                  # 认证API
│   │   ├── user.ts                  # 用户API
│   │   ├── project.ts               # 项目API
│   │   ├── task.ts                  # 任务API
│   │   ├── ai.ts                    # AI API
│   │   ├── notification.ts          # 通知API
│   │   └── index.ts                 # 统一导出
│   │
│   ├── pages/                       # 页面组件
│   │   ├── index/                   # 首页/工作台
│   │   │   └── index.vue
│   │   ├── login/                   # 登录页
│   │   │   └── index.vue
│   │   ├── ai/                      # AI模块
│   │   │   ├── chat/                # AI对话
│   │   │   │   └── index.vue
│   │   │   └── solution/            # 方案生成
│   │   │       └── index.vue
│   │   ├── project/                 # 项目模块
│   │   │   ├── list/                # 项目列表
│   │   │   │   └── index.vue
│   │   │   └── detail/              # 项目详情
│   │   │       └── index.vue
│   │   ├── task/                    # 任务模块
│   │   │   ├── list/                # 任务列表
│   │   │   │   └── index.vue
│   │   │   └── detail/              # 任务详情
│   │   │       └── index.vue
│   │   ├── message/                 # 消息模块
│   │   │   └── index.vue
│   │   └── profile/                 # 个人中心
│   │       └── index.vue
│   │
│   ├── components/                  # 公共组件
│   │   ├── ai/                      # AI相关组件
│   │   │   ├── AIChatBubble.vue     # AI对话气泡
│   │   │   ├── AIInputBar.vue       # AI输入栏
│   │   │   ├── AIStreamText.vue     # 流式文本显示
│   │   │   └── AIVoiceButton.vue    # 语音输入按钮
│   │   ├── project/                 # 项目组件
│   │   │   ├── ProjectCard.vue      # 项目卡片
│   │   │   └── ProjectProgress.vue  # 项目进度
│   │   ├── task/                    # 任务组件
│   │   │   ├── TaskCard.vue         # 任务卡片
│   │   │   ├── TaskStatus.vue       # 任务状态
│   │   │   └── TaskPriority.vue     # 任务优先级
│   │   ├── common/                  # 通用组件
│   │   │   ├── NavBar.vue           # 导航栏
│   │   │   ├── TabBar.vue           # 底部标签栏
│   │   │   ├── Empty.vue            # 空状态
│   │   │   ├── Loading.vue          # 加载状态
│   │   │   └── RefreshList.vue      # 下拉刷新列表
│   │   └── index.ts                 # 组件统一导出
│   │
│   ├── hooks/                       # 组合式函数
│   │   ├── useAI.ts                 # AI相关hooks
│   │   ├── useAuth.ts               # 认证hooks
│   │   ├── useProject.ts            # 项目hooks
│   │   ├── useTask.ts               # 任务hooks
│   │   └── usePush.ts               # 推送hooks
│   │
│   ├── utils/                       # 工具函数
│   │   ├── format.ts                # 格式化
│   │   ├── validate.ts              # 验证
│   │   ├── platform.ts              # 平台判断
│   │   └── index.ts                 # 统一导出
│   │
│   ├── styles/                      # 全局样式
│   │   ├── variables.scss           # 样式变量
│   │   ├── mixins.scss              # 混入
│   │   └── global.scss              # 全局样式
│   │
│   ├── static/                      # 静态资源
│   │   ├── images/                  # 图片
│   │   ├── icons/                   # 图标
│   │   └── fonts/                   # 字体
│   │
│   ├── App.vue                      # 根组件
│   ├── main.ts                      # 入口文件
│   ├── manifest.json                # 应用配置
│   ├── pages.json                   # 页面配置
│   └── uni.scss                     # uni-app样式变量
│
├── nativeplugins/                   # 原生插件
│   ├── mota-ai-voice/               # 语音AI插件
│   ├── mota-ai-vision/              # 视觉AI插件
│   └── mota-push/                   # 推送插件
│
├── unpackage/                       # 打包输出目录
├── .env                             # 环境变量
├── .env.development                 # 开发环境变量
├── .env.production                  # 生产环境变量
├── vite.config.ts                   # Vite配置
├── tsconfig.json                    # TypeScript配置
├── package.json                     # 项目依赖
└── README.md                        # 项目说明
```

---

## 3. AI-First 架构设计

### 3.1 AI服务层设计

```typescript
// src/core/ai/types.ts
export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status: 'pending' | 'streaming' | 'complete' | 'error'
  metadata?: {
    model?: string
    tokens?: number
    duration?: number
  }
}

export interface AIStreamEvent {
  type: 'start' | 'delta' | 'complete' | 'error'
  content?: string
  error?: string
}

export interface AIServiceConfig {
  baseUrl: string
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// src/core/ai/AIService.ts
export interface IAIService {
  // 基础对话
  chat(messages: AIMessage[], config?: Partial<AIServiceConfig>): Promise<AIMessage>
  
  // 流式对话
  chatStream(
    messages: AIMessage[], 
    onEvent: (event: AIStreamEvent) => void,
    config?: Partial<AIServiceConfig>
  ): Promise<void>
  
  // 方案生成
  generateSolution(prompt: string, context?: string): Promise<string>
  
  // 取消请求
  abort(): void
}
```

### 3.2 流式通信基础设施

```typescript
// src/core/ai/StreamHandler.ts
export class StreamHandler {
  private controller: AbortController | null = null
  
  // SSE 流式处理
  async handleSSE(
    url: string, 
    body: any,
    onEvent: (event: AIStreamEvent) => void
  ): Promise<void> {
    this.controller = new AbortController()
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal: this.controller.signal,
    })
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    onEvent({ type: 'start' })
    
    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      // 解析SSE格式数据
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            onEvent({ type: 'complete' })
          } else {
            try {
              const json = JSON.parse(data)
              onEvent({ type: 'delta', content: json.content || json.choices?.[0]?.delta?.content })
            } catch (e) {
              // 处理非JSON数据
            }
          }
        }
      }
    }
  }
  
  // WebSocket 流式处理
  handleWebSocket(
    url: string,
    onEvent: (event: AIStreamEvent) => void
  ): WebSocket {
    const ws = new WebSocket(url)
    
    ws.onopen = () => onEvent({ type: 'start' })
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onEvent({ type: 'delta', content: data.content })
    }
    ws.onclose = () => onEvent({ type: 'complete' })
    ws.onerror = (error) => onEvent({ type: 'error', error: String(error) })
    
    return ws
  }
  
  abort() {
    this.controller?.abort()
    this.controller = null
  }
}
```

### 3.3 语音服务接口预留

```typescript
// src/core/ai/VoiceService.ts
export interface IVoiceService {
  // 语音识别 (ASR)
  startRecognition(options?: VoiceRecognitionOptions): Promise<void>
  stopRecognition(): Promise<string>
  
  // 语音合成 (TTS)
  speak(text: string, options?: VoiceSynthesisOptions): Promise<void>
  stopSpeaking(): void
  
  // 事件监听
  onResult(callback: (text: string, isFinal: boolean) => void): void
  onError(callback: (error: Error) => void): void
}

export interface VoiceRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
}

export interface VoiceSynthesisOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
}
```

---

## 4. 网络架构设计

### 4.1 API请求架构

mota-app 采用**直连网关**模式，复用现有的 mota-gateway API网关：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              mota-app 移动端                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                          HTTP 请求层                                   │ │
│  │  • BaseURL: https://api.mota.com (生产) / http://localhost:8080 (开发)│ │
│  │  • Authorization: Bearer {token}                                       │ │
│  │  • Content-Type: application/json                                      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          mota-gateway (API网关)                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │路由转发 │ │JWT认证  │ │限流熔断 │ │日志监控 │ │跨域处理 │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ mota-user     │          │ mota-project  │          │ mota-ai       │
│ /api/users/*  │          │ /api/projects │          │ /api/ai/*     │
└───────────────┘          └───────────────┘          └───────────────┘
```

### 4.2 API路由映射

| 移动端功能 | API路径 | 后端服务 |
|-----------|---------|---------|
| 登录认证 | `/api/auth/*` | mota-auth-service |
| 用户信息 | `/api/users/*` | mota-user-service |
| 项目管理 | `/api/projects/*` | mota-project-service |
| 任务管理 | `/api/tasks/*` | mota-task-service |
| AI对话 | `/api/ai/*` | mota-ai-service |
| 消息通知 | `/api/notifications/*` | mota-notify-service |
| 日历日程 | `/api/calendar/*` | mota-calendar-service |

### 4.3 环境配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.mota.com
```

### 4.4 请求封装设计

```typescript
// src/core/http/request.ts
import { useUserStore } from '@/stores/user'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

interface RequestConfig extends UniApp.RequestOptions {
  showLoading?: boolean
  showError?: boolean
}

export async function request<T>(config: RequestConfig): Promise<T> {
  const { showLoading = false, showError = true, ...options } = config
  const userStore = useUserStore()
  
  // 显示加载
  if (showLoading) {
    uni.showLoading({ title: '加载中...' })
  }
  
  try {
    const response = await uni.request({
      ...options,
      url: `${BASE_URL}${options.url}`,
      header: {
        'Content-Type': 'application/json',
        'Authorization': userStore.token ? `Bearer ${userStore.token}` : '',
        ...options.header,
      },
    })
    
    // 处理响应
    if (response.statusCode === 200) {
      const data = response.data as any
      // 兼容 Result 格式和直接数据格式
      if (data.code !== undefined) {
        if (data.code === 200) {
          return data.data as T
        }
        throw new Error(data.message || '请求失败')
      }
      return data as T
    }
    
    // 处理HTTP错误
    if (response.statusCode === 401) {
      userStore.logout()
      uni.reLaunch({ url: '/pages/login/index' })
      throw new Error('登录已过期')
    }
    
    throw new Error(`HTTP ${response.statusCode}`)
  } finally {
    if (showLoading) {
      uni.hideLoading()
    }
  }
}

export const http = {
  get: <T>(url: string, params?: object) =>
    request<T>({ url, method: 'GET', data: params }),
  post: <T>(url: string, data?: object) =>
    request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: object) =>
    request<T>({ url, method: 'PUT', data }),
  delete: <T>(url: string, params?: object) =>
    request<T>({ url, method: 'DELETE', data: params }),
}
```

---

## 5. 功能模块设计

### 5.1 第一阶段功能清单（AI核心MVP）

#### 5.1.1 登录认证模块
| 功能 | 描述 | API |
|------|------|-----|
| 账号密码登录 | 用户名/邮箱 + 密码 | POST /auth/login |
| Token刷新 | 自动刷新访问令牌 | POST /auth/refresh |
| 退出登录 | 清除本地Token | POST /auth/logout |
| 记住登录 | 本地存储登录状态 | - |

#### 5.1.2 AI助手对话模块
| 功能 | 描述 | API |
|------|------|-----|
| AI对话 | 与AI助手进行对话 | POST /ai/chat |
| 流式响应 | SSE流式输出AI回复 | POST /ai/chat/stream |
| 对话历史 | 保存和加载对话记录 | GET /ai/sessions |
| 快捷指令 | 预设AI指令模板 | GET /ai/prompts |

#### 5.1.3 项目管理模块
| 功能 | 描述 | API |
|------|------|-----|
| 项目列表 | 查看所有项目 | GET /projects |
| 项目详情 | 查看项目信息 | GET /projects/:id |
| 项目进度 | 查看项目进度 | GET /projects/:id/progress |
| 项目成员 | 查看项目成员 | GET /projects/:id/members |

#### 5.1.4 任务管理模块
| 功能 | 描述 | API |
|------|------|-----|
| 我的任务 | 查看分配给我的任务 | GET /tasks/my |
| 任务详情 | 查看任务信息 | GET /tasks/:id |
| 更新状态 | 更新任务状态 | PUT /tasks/:id/status |
| 任务评论 | 添加任务评论 | POST /tasks/:id/comments |

#### 5.1.5 消息通知模块
| 功能 | 描述 | API |
|------|------|-----|
| 通知列表 | 查看所有通知 | GET /notifications |
| 标记已读 | 标记通知已读 | PUT /notifications/:id/read |
| 推送通知 | 接收推送消息 | WebSocket |
| 通知设置 | 通知偏好设置 | PUT /notifications/settings |

#### 5.1.6 个人中心模块
| 功能 | 描述 | API |
|------|------|-----|
| 个人信息 | 查看/编辑个人资料 | GET/PUT /users/profile |
| 修改密码 | 修改登录密码 | PUT /users/password |
| 系统设置 | 应用设置 | - |
| 关于我们 | 应用信息 | - |

### 5.2 页面路由配置

```json
// pages.json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "工作台" }
    },
    {
      "path": "pages/login/index",
      "style": { "navigationBarTitleText": "登录", "navigationStyle": "custom" }
    },
    {
      "path": "pages/ai/chat/index",
      "style": { "navigationBarTitleText": "AI助手" }
    },
    {
      "path": "pages/project/list/index",
      "style": { "navigationBarTitleText": "项目" }
    },
    {
      "path": "pages/project/detail/index",
      "style": { "navigationBarTitleText": "项目详情" }
    },
    {
      "path": "pages/task/list/index",
      "style": { "navigationBarTitleText": "我的任务" }
    },
    {
      "path": "pages/task/detail/index",
      "style": { "navigationBarTitleText": "任务详情" }
    },
    {
      "path": "pages/message/index",
      "style": { "navigationBarTitleText": "消息" }
    },
    {
      "path": "pages/profile/index",
      "style": { "navigationBarTitleText": "我的" }
    }
  ],
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#10B981",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "工作台",
        "iconPath": "static/icons/home.png",
        "selectedIconPath": "static/icons/home-active.png"
      },
      {
        "pagePath": "pages/ai/chat/index",
        "text": "AI助手",
        "iconPath": "static/icons/ai.png",
        "selectedIconPath": "static/icons/ai-active.png"
      },
      {
        "pagePath": "pages/project/list/index",
        "text": "项目",
        "iconPath": "static/icons/project.png",
        "selectedIconPath": "static/icons/project-active.png"
      },
      {
        "pagePath": "pages/task/list/index",
        "text": "任务",
        "iconPath": "static/icons/task.png",
        "selectedIconPath": "static/icons/task-active.png"
      },
      {
        "pagePath": "pages/profile/index",
        "text": "我的",
        "iconPath": "static/icons/profile.png",
        "selectedIconPath": "static/icons/profile-active.png"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "摩塔",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#f5f5f5"
  }
}
```

---

## 6. UI/UX设计规范

### 6.1 设计主题

延续 mota-web 的设计风格，主题色为薄荷绿 `#10B981`。

```scss
// src/styles/variables.scss
$primary-color: #10B981;      // 主色 - 薄荷绿
$primary-light: #34D399;      // 主色浅
$primary-dark: #059669;       // 主色深

$success-color: #22C55E;      // 成功
$warning-color: #F59E0B;      // 警告
$error-color: #EF4444;        // 错误
$info-color: #3B82F6;         // 信息

$text-primary: #1F2937;       // 主文字
$text-secondary: #6B7280;     // 次要文字
$text-placeholder: #9CA3AF;   // 占位符文字

$bg-primary: #FFFFFF;         // 主背景
$bg-secondary: #F3F4F6;       // 次要背景
$bg-tertiary: #E5E7EB;        // 三级背景

$border-color: #E5E7EB;       // 边框色
$divider-color: #F3F4F6;      // 分割线

$border-radius-sm: 8rpx;
$border-radius-md: 12rpx;
$border-radius-lg: 16rpx;
$border-radius-xl: 24rpx;
```

### 6.2 移动端适配要点

1. **安全区域适配**: 适配刘海屏、底部安全区
2. **触摸反馈**: 所有可点击元素有触摸反馈
3. **手势操作**: 支持下拉刷新、上拉加载、左滑删除等
4. **键盘适配**: 输入框弹起键盘时自动调整布局
5. **暗黑模式**: 支持系统暗黑模式

---

## 7. 开发阶段规划

### 7.1 第一阶段：AI核心MVP（6-8周）

```
Week 1-2: 项目初始化与基础架构
├── 初始化uni-app项目
├── 配置TypeScript、Vite
├── 搭建目录结构
├── 实现HTTP请求封装
├── 实现AI服务层基础架构
└── 实现流式通信（SSE）

Week 3-4: 核心功能开发
├── 登录认证模块
├── AI助手对话页面（流式输出）
├── 首页/工作台页面
└── 个人中心页面

Week 5-6: 项目与任务模块
├── 项目列表页面
├── 项目详情页面
├── 任务列表页面
├── 任务详情页面
└── 任务状态更新

Week 7-8: 消息与打包发布
├── 消息通知模块
├── 推送服务集成
├── UI优化与测试
├── iOS打包
├── Android打包
└── 鸿蒙打包
```

### 7.2 第二阶段：AI增强（4-6周）

```
├── AI方案生成功能
├── 语音交互集成
├── 日程管理模块
├── 智能提醒功能
└── 文档AI摘要
```

### 7.3 第三阶段：AI全面（4-6周）

```
├── 图像识别/OCR
├── 知识图谱展示
├── 智能搜索
├── 报表AI分析
└── 端侧AI能力
```

---

## 8. 技术要点

### 8.1 多平台构建配置

```json
// manifest.json 关键配置
{
  "app-plus": {
    "distribute": {
      "ios": {
        "dSYMs": false,
        "idfa": false
      },
      "android": {
        "minSdkVersion": 21
      }
    }
  },
  "mp-harmony": {
    "appid": "your-harmony-appid"
  }
}
```

### 8.2 推送服务集成

- **iOS**: APNs (Apple Push Notification service)
- **Android**: 集成各厂商推送（小米、华为、OPPO、vivo）或使用 UniPush
- **鸿蒙**: 华为推送服务 (Huawei Push Kit)

### 8.3 与后端API对接

复用 mota-service 现有API，主要对接的服务：
- `mota-gateway`: API网关
- `mota-auth-service`: 认证服务
- `mota-user-service`: 用户服务
- `mota-project-service`: 项目服务
- `mota-task-service`: 任务服务
- `mota-ai-service`: AI服务
- `mota-notify-service`: 通知服务

---

## 9. 附录

### 9.1 参考资源

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [uni-app 鸿蒙支持文档](https://uniapp.dcloud.net.cn/tutorial/harmony/)
- [uView Plus 组件库](https://uview-plus.jiangruyi.com/)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)

### 9.2 开发环境要求

- Node.js >= 18.0
- HBuilderX >= 4.0（uni-app开发IDE）
- Xcode >= 15（iOS开发）
- Android Studio >= Hedgehog（Android开发）
- DevEco Studio >= 4.0（鸿蒙开发）

---

*文档版本: v1.0 | 更新日期: 2025-01-30*