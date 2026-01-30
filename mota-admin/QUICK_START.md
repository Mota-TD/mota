# Mota Admin 快速启动指南

## 🚀 快速开始

### 1. 安装依赖
```bash
cd mota-admin
npm install
```

### 2. 启动开发服务器
```bash
npm run start:dev
```

访问: http://localhost:8000

---

## 📖 功能使用指南

### 1. 登录系统

**默认登录方式**: 账户密码登录

**登录流程**:
1. 访问 http://localhost:8000/user/login
2. 输入用户名和密码
3. 点击登录按钮
4. 系统自动保存Token并跳转到首页

**Token管理**:
- Token自动保存到localStorage
- Token过期前5分钟自动刷新
- 登出时自动清除Token

### 2. API调用示例

#### 使用认证服务
```typescript
import { login, logout, getCurrentUser } from '@/services/auth';
import { saveLoginInfo, clearLoginInfo } from '@/utils/token';

// 登录
const handleLogin = async () => {
  const response = await login({
    username: 'admin',
    password: '123456',
    type: 'account',
  });
  
  if (response.code === 0) {
    const { token, refreshToken, expiresIn } = response.data;
    saveLoginInfo(token, refreshToken, expiresIn);
  }
};

// 获取用户信息
const fetchUser = async () => {
  const response = await getCurrentUser();
  if (response.code === 0) {
    console.log(response.data); // UserInfo
  }
};

// 登出
const handleLogout = async () => {
  await logout();
  clearLoginInfo();
};
```

#### 使用租户服务
```typescript
import { getTenantList, createTenant } from '@/services/tenant';
import type { PageParams, CreateTenantParams } from '@/types';

// 获取租户列表
const fetchTenants = async () => {
  const params: PageParams = {
    current: 1,
    pageSize: 10,
  };
  
  const response = await getTenantList(params);
  if (response.code === 0) {
    const { list, total } = response.data;
    console.log(`共 ${total} 个租户`, list);
  }
};

// 创建租户
const createNewTenant = async () => {
  const params: CreateTenantParams = {
    name: '测试租户',
    code: 'TEST001',
    contactName: '张三',
    contactPhone: '13800138000',
    contactEmail: 'test@example.com',
    packageId: 'pkg_001',
  };
  
  const response = await createTenant(params);
  if (response.code === 0) {
    console.log('创建成功', response.data);
  }
};
```

#### 使用用户服务
```typescript
import { getUserList, createUser } from '@/services/user';
import type { PageParams, CreateUserParams } from '@/types';

// 获取用户列表
const fetchUsers = async () => {
  const params: PageParams = {
    current: 1,
    pageSize: 10,
  };
  
  const response = await getUserList(params);
  if (response.code === 0) {
    const { list, total } = response.data;
    console.log(`共 ${total} 个用户`, list);
  }
};

// 创建用户
const createNewUser = async () => {
  const params: CreateUserParams = {
    username: 'testuser',
    password: '123456',
    name: '测试用户',
    email: 'user@example.com',
    role: 'operator',
  };
  
  const response = await createUser(params);
  if (response.code === 0) {
    console.log('创建成功', response.data);
  }
};
```

### 3. 使用基础组件

#### 页面加载组件
```typescript
import { PageLoading } from '@/components';

const MyPage = () => {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <PageLoading tip="加载中..." />;
  }
  
  return <div>页面内容</div>;
};
```

#### 错误边界组件
```typescript
import { ErrorBoundary } from '@/components';

const App = () => {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
};
```

### 4. Token管理

#### 手动管理Token
```typescript
import {
  getToken,
  setToken,
  removeToken,
  isTokenExpired,
  saveLoginInfo,
  clearLoginInfo,
} from '@/utils/token';

// 获取Token
const token = getToken();

// 保存Token
setToken('your-token-here');

// 检查Token是否过期
const expired = isTokenExpired();

// 保存完整登录信息
saveLoginInfo('token', 'refresh-token', 3600);

// 清除所有登录信息
clearLoginInfo();
```

#### 自动刷新Token
```typescript
import {
  checkAndRefreshToken,
  startTokenRefreshTimer,
  stopTokenRefreshTimer,
} from '@/utils/refreshToken';

// 检查并刷新Token
await checkAndRefreshToken();

// 启动自动刷新定时器（通常在app.tsx中自动启动）
const timer = startTokenRefreshTimer();

// 停止自动刷新定时器
stopTokenRefreshTimer(timer);
```

---

## 🔧 配置说明

### 环境变量

#### 开发环境 (`.env.development`)
```bash
API_BASE_URL=http://localhost:8080/api/v1
APP_TITLE=摩塔管理后台(开发)
MOCK=none
REACT_APP_ENV=dev
```

#### 生产环境 (`.env.production`)
```bash
API_BASE_URL=https://api.mota.com/api/v1
APP_TITLE=摩塔管理后台
REACT_APP_ENV=prod
```

### API配置

API基础URL配置在 [`src/app.tsx`](src/app.tsx):
```typescript
export const request: RequestConfig = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  // ...
};
```

---

## 📁 项目结构

```
mota-admin/
├── src/
│   ├── types/              # TypeScript类型定义
│   │   ├── common.ts       # 通用类型
│   │   ├── auth.ts         # 认证类型
│   │   ├── tenant.ts       # 租户类型
│   │   └── user.ts         # 用户类型
│   │
│   ├── services/           # API服务层
│   │   ├── auth.ts         # 认证服务
│   │   ├── tenant.ts       # 租户服务
│   │   └── user.ts         # 用户服务
│   │
│   ├── utils/              # 工具函数
│   │   ├── token.ts        # Token管理
│   │   └── refreshToken.ts # Token自动刷新
│   │
│   ├── components/         # 通用组件
│   │   ├── PageLoading/    # 页面加载
│   │   └── ErrorBoundary/  # 错误边界
│   │
│   ├── pages/              # 页面组件
│   │   ├── user/login/     # 登录页面
│   │   ├── Dashboard/      # 仪表盘
│   │   ├── Tenant/         # 租户管理
│   │   └── UserManage/     # 用户管理
│   │
│   └── app.tsx             # 应用配置
│
├── config/                 # 配置文件
│   ├── config.ts           # Umi配置
│   ├── routes.ts           # 路由配置
│   └── defaultSettings.ts  # 默认设置
│
└── docs/                   # 文档
    ├── 01-项目初始化总结.md
    └── 02-第一阶段开发完成总结.md
```

---

## 🐛 常见问题

### 1. Token过期后无法自动刷新？
**原因**: Token刷新定时器未启动  
**解决**: 检查 [`app.tsx`](src/app.tsx) 中的 `getInitialState` 是否正确启动了定时器

### 2. API请求返回401？
**原因**: Token无效或过期  
**解决**: 
1. 检查Token是否保存到localStorage
2. 检查API_BASE_URL是否正确
3. 检查后端服务是否正常运行

### 3. 登录后页面不跳转？
**原因**: redirect参数错误或路由配置问题  
**解决**: 检查登录页面的跳转逻辑和路由配置

### 4. TypeScript类型错误？
**原因**: 类型定义不完整或不匹配  
**解决**: 
1. 检查 [`src/types/`](src/types/) 中的类型定义
2. 确保API响应格式与类型定义匹配

---

## 📚 相关文档

- [项目初始化总结](docs/01-项目初始化总结.md)
- [第一阶段开发完成总结](docs/02-第一阶段开发完成总结.md)
- [Ant Design Pro文档](https://pro.ant.design/)
- [UmiJS文档](https://umijs.org/)
- [TypeScript文档](https://www.typescriptlang.org/)

---

## 🎯 下一步计划

1. 对接后端API服务
2. 完善租户管理页面
3. 完善用户管理页面
4. 开发内容管理模块
5. 开发数据分析模块

---

**最后更新**: 2026-01-30  
**维护团队**: Mota技术团队