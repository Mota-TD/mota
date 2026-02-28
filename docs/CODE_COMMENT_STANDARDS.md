# 摩塔 Mota 项目代码注释规范

本文档定义了项目中代码注释的标准和最佳实践，适用于所有开发人员。

---

## 目录

1. [总体原则](#总体原则)
2. [Java 后端注释规范](#java-后端注释规范)
3. [TypeScript/React 前端注释规范](#typescriptreact-前端注释规范)
4. [Vue/uni-app 移动端注释规范](#vueuni-app-移动端注释规范)
5. [配置文件注释规范](#配置文件注释规范)
6. [禁止事项](#禁止事项)
7. [代码审查检查清单](#代码审查检查清单)

---

## 总体原则

### 1. 注释的目的

- **解释为什么（Why）**，而不是做什么（What）
- 代码应该自解释"做什么"，注释用来解释"为什么这样做"
- 记录复杂的业务逻辑和设计决策
- 标记潜在的陷阱和注意事项

### 2. 注释的基本要求

- ✅ 使用**中文**编写注释（与团队保持一致）
- ✅ 注释要**简洁准确**，避免冗余
- ✅ 及时**更新注释**，保持与代码同步
- ✅ 使用**标准格式**，便于 IDE 解析和文档生成

### 3. 何时需要注释

| 情况 | 是否需要注释 |
|------|-------------|
| 类/接口定义 | ✅ 必须 |
| 公共方法 | ✅ 必须 |
| 复杂算法/业务逻辑 | ✅ 必须 |
| 配置项 | ✅ 必须 |
| 私有方法（复杂的） | ⚠️ 建议 |
| 简单的 getter/setter | ❌ 不需要 |
| 自解释的代码 | ❌ 不需要 |

---

## Java 后端注释规范

### 1. 类注释

```java
/**
 * 用户认证服务实现类
 * <p>
 * 提供用户登录、注册、令牌刷新等功能。
 * 支持多种认证方式：密码、手机验证码、第三方OAuth。
 * </p>
 *
 * @author Mota
 * @since 1.0.0
 * @see AuthService
 * @see JwtTokenProvider
 */
@Service
public class AuthServiceImpl implements AuthService {
    // ...
}
```

**必填项：**
- 类的功能描述
- `@author` - 作者
- `@since` - 版本号

**可选项：**
- `@see` - 相关类引用
- `@deprecated` - 如果已废弃

### 2. 接口注释

```java
/**
 * 认证服务接口
 * <p>
 * 定义用户认证相关的核心业务操作。
 * </p>
 *
 * @author Mota
 * @since 1.0.0
 */
public interface AuthService {

    /**
     * 用户登录
     *
     * @param request 登录请求，包含用户名和密码
     * @return 登录响应，包含访问令牌和刷新令牌
     * @throws AuthenticationException 认证失败时抛出
     */
    LoginResponse login(LoginRequest request);
}
```

### 3. 方法注释

```java
/**
 * 生成JWT访问令牌
 * <p>
 * 使用HS256算法签名，令牌有效期为{@link CommonConstants#ACCESS_TOKEN_EXPIRE}秒。
 * </p>
 *
 * @param userId   用户唯一标识
 * @param username 用户名
 * @param roles    用户角色列表
 * @return 签名后的JWT令牌字符串
 * @throws IllegalArgumentException 如果userId为空
 * @since 1.0.0
 */
public String generateToken(Long userId, String username, List<String> roles) {
    // ...
}
```

**方法注释必须包含：**
- 方法功能描述
- `@param` - 每个参数的说明
- `@return` - 返回值说明（void 方法除外）
- `@throws` - 可能抛出的异常

### 4. 字段注释

```java
/**
 * 用户服务
 */
@Autowired
private UserService userService;

/**
 * 访问令牌有效期（秒）
 * <p>
 * 默认值：86400（24小时）
 * </p>
 */
private static final long ACCESS_TOKEN_EXPIRE = 86400L;
```

### 5. 常量注释

```java
/**
 * 通用常量定义
 *
 * @author Mota
 * @since 1.0.0
 */
public final class CommonConstants {

    /**
     * 成功响应码
     */
    public static final int SUCCESS_CODE = 200;

    /**
     * 访问令牌有效期（秒）
     * <p>
     * 24小时 = 86400秒
     * </p>
     */
    public static final long ACCESS_TOKEN_EXPIRE = 86400L;

    /**
     * 访问令牌有效期（毫秒）
     * <p>
     * 24小时 = 86400000毫秒
     * </p>
     */
    public static final long ACCESS_TOKEN_EXPIRE_MS = ACCESS_TOKEN_EXPIRE * 1000L;
}
```

### 6. 枚举注释

```java
/**
 * 用户状态枚举
 *
 * @author Mota
 * @since 1.0.0
 */
public enum UserStatus {

    /**
     * 正常状态
     */
    ACTIVE(1, "正常"),

    /**
     * 禁用状态
     */
    DISABLED(0, "禁用"),

    /**
     * 已删除（逻辑删除）
     */
    DELETED(-1, "已删除");

    private final int code;
    private final String description;
}
```

### 7. TODO/FIXME 标记

```java
// TODO: 后续版本需要支持多租户
// FIXME: 并发情况下可能存在缓存不一致问题
// HACK: 临时解决方案，需要重构
// NOTE: 这里使用悲观锁是因为...
// WARNING: 修改此方法需要同步更新消费端
```

**标准格式：**
```
// TODO: [描述] - [负责人] - [日期]
// TODO: 实现邮件通知功能 - zhangsan - 2024-03-15
```

---

## TypeScript/React 前端注释规范

### 1. 组件注释

```tsx
/**
 * 用户列表组件
 * 
 * 展示用户列表数据，支持分页、搜索、筛选功能。
 * 
 * @example
 * ```tsx
 * <UserList 
 *   pageSize={20} 
 *   onSelect={(user) => console.log(user)} 
 * />
 * ```
 * 
 * @author Mota
 * @since 1.0.0
 */
const UserList: React.FC<UserListProps> = ({ pageSize, onSelect }) => {
  // ...
};
```

### 2. 接口/类型注释

```typescript
/**
 * 用户信息接口
 */
interface UserInfo {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 邮箱地址 */
  email: string;
  /** 头像URL */
  avatar?: string;
  /** 用户角色列表 */
  roles: string[];
  /** 创建时间 (ISO 8601格式) */
  createdAt: string;
}

/**
 * 分页请求参数
 */
interface PageRequest {
  /** 当前页码，从1开始 */
  current: number;
  /** 每页条数，默认10 */
  pageSize: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向：ascend | descend */
  sortOrder?: 'ascend' | 'descend';
}
```

### 3. 函数注释

```typescript
/**
 * 刷新访问令牌
 * 
 * 当访问令牌过期时，使用刷新令牌获取新的访问令牌。
 * 如果刷新令牌也过期，将跳转到登录页面。
 * 
 * @param refreshToken 刷新令牌
 * @returns 新的访问令牌，如果刷新失败返回 null
 * @throws {Error} 网络请求失败时抛出
 * 
 * @example
 * ```ts
 * const newToken = await refreshAccessToken(refreshToken);
 * if (newToken) {
 *   localStorage.setItem('token', newToken);
 * }
 * ```
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  // ...
}
```

### 4. Hook 注释

```typescript
/**
 * 用户认证状态管理 Hook
 * 
 * 提供登录状态检查、登录、登出等功能。
 * 
 * @returns 认证状态和操作方法
 * 
 * @example
 * ```tsx
 * const { isLoggedIn, user, login, logout } = useAuth();
 * ```
 */
function useAuth() {
  // ...
}
```

### 5. 工具函数注释

```typescript
/**
 * 格式化日期时间
 * 
 * @param date 日期对象或时间戳
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 * 
 * @example
 * ```ts
 * formatDateTime(new Date()) // '2024-03-15 10:30:45'
 * formatDateTime(1710483045000, 'YYYY/MM/DD') // '2024/03/15'
 * ```
 */
function formatDateTime(date: Date | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  // ...
}
```

### 6. 常量注释

```typescript
/**
 * API 基础路径
 */
export const API_BASE_URL = '/api/v1';

/**
 * 令牌存储键名
 */
export const TOKEN_KEY = 'mota_access_token';

/**
 * 刷新令牌存储键名
 */
export const REFRESH_TOKEN_KEY = 'mota_refresh_token';

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 30000;
```

---

## Vue/uni-app 移动端注释规范

### 1. 组件注释

```vue
<script setup lang="ts">
/**
 * 新闻列表组件
 * 
 * 展示新闻列表，支持下拉刷新和上拉加载更多。
 * 
 * @author Mota
 * @since 1.0.0
 */

import { ref, onMounted } from 'vue';

/** 新闻列表数据 */
const newsList = ref<NewsItem[]>([]);

/** 是否正在加载 */
const loading = ref(false);

/**
 * 加载新闻列表
 * @param page 页码
 */
async function loadNews(page: number) {
  // ...
}
</script>
```

### 2. 页面注释

```vue
<!--
  新闻详情页面
  
  功能：
  - 展示新闻详细内容
  - 支持收藏、分享
  - 展示相关新闻推荐
  
  @author Mota
  @since 1.0.0
-->
<template>
  <!-- 新闻标题区域 -->
  <view class="news-header">
    <!-- ... -->
  </view>
  
  <!-- 新闻内容区域 -->
  <view class="news-content">
    <!-- ... -->
  </view>
</template>
```

---

## 配置文件注释规范

### 1. YAML 配置文件

```yaml
# 服务器配置
server:
  port: 8081  # 服务端口
  servlet:
    context-path: /  # 上下文路径

# JWT 配置
jwt:
  # 密钥（生产环境请使用环境变量）
  secret: ${JWT_SECRET:your-default-secret-key}
  # 访问令牌有效期（秒），默认24小时
  access-token-expire: 86400
  # 刷新令牌有效期（秒），默认7天
  refresh-token-expire: 604800
```

### 2. Properties 配置文件

```properties
# 数据库配置
# 数据库连接URL
spring.datasource.url=jdbc:mysql://localhost:3306/mota
# 数据库用户名
spring.datasource.username=root
# 数据库密码（生产环境使用加密配置）
spring.datasource.password=${DB_PASSWORD}
```

### 3. JSON 配置文件

由于 JSON 不支持注释，建议使用以下方式：

```json
{
  "_comment": "API配置文件",
  "_version": "1.0.0",
  "apiEndpoint": "https://api.example.com",
  "timeout": 30000,
  "retryCount": 3
}
```

或使用 JSON5/JSONC 格式：

```jsonc
{
  // API配置文件 v1.0.0
  "apiEndpoint": "https://api.example.com",
  "timeout": 30000,  // 请求超时时间（毫秒）
  "retryCount": 3    // 重试次数
}
```

---

## 禁止事项

### ❌ 不要这样做

```java
// 错误示例1：无意义的注释
// 设置用户名
user.setUsername(username);

// 错误示例2：注释与代码不一致
// 检查用户是否存在
user.setPassword(password);  // 实际是设置密码

// 错误示例3：注释掉的代码
// user.setEmail(email);
// user.setPhone(phone);

// 错误示例4：过于详细的注释
// 首先，我们需要检查用户名是否为空
// 如果用户名不为空，我们就继续检查密码
// 密码需要满足以下条件：长度大于8位，包含大小写字母和数字...
if (isValid(username, password)) {
    // ...
}

// 错误示例5：使用缩写或专业术语不解释
// 使用FIFO策略处理MQ消息
processMessage(msg);
```

### ✅ 应该这样做

```java
// 正确示例1：解释为什么
// 使用悲观锁防止并发下的重复扣款
@Lock(LockModeType.PESSIMISTIC_WRITE)
public void deductBalance(Long userId, BigDecimal amount) {
    // ...
}

// 正确示例2：记录业务规则
// 根据运营要求，VIP用户积分翻倍
int points = calculatePoints(amount);
if (user.isVip()) {
    points *= 2;
}

// 正确示例3：解释复杂逻辑
/**
 * 计算用户等级
 * 
 * 等级规则：
 * - 积分 < 1000: 普通会员
 * - 积分 1000-5000: 银卡会员
 * - 积分 5000-20000: 金卡会员
 * - 积分 > 20000: 钻石会员
 */
public UserLevel calculateLevel(int points) {
    // ...
}
```

---

## 代码审查检查清单

### 注释相关检查项

- [ ] 所有公共类是否有类注释？
- [ ] 所有公共方法是否有方法注释？
- [ ] 注释是否与代码逻辑一致？
- [ ] 是否有过期或错误的注释？
- [ ] 复杂业务逻辑是否有足够说明？
- [ ] 配置项是否有注释说明？
- [ ] TODO/FIXME 是否有负责人和日期？
- [ ] 是否存在注释掉的无用代码？
- [ ] 注释是否使用统一的语言（中文）？
- [ ] 注释格式是否符合规范？

### 自动化检查

推荐配置以下工具进行自动检查：

#### Java (Checkstyle)

```xml
<!-- checkstyle.xml -->
<module name="JavadocType">
    <property name="scope" value="public"/>
</module>
<module name="JavadocMethod">
    <property name="scope" value="public"/>
</module>
```

#### TypeScript (ESLint)

```json
{
  "rules": {
    "jsdoc/require-jsdoc": ["warn", {
      "publicOnly": true,
      "require": {
        "FunctionDeclaration": true,
        "ClassDeclaration": true,
        "MethodDefinition": true
      }
    }]
  }
}
```

---

## 附录：注释模板

### IDEA Live Template (Java)

```
/**
 * $DESCRIPTION$
 *
 * @author Mota
 * @since 1.0.0
 */
```

### VS Code Snippet (TypeScript)

```json
{
  "Function Comment": {
    "prefix": "jsdoc",
    "body": [
      "/**",
      " * $1",
      " *",
      " * @param $2",
      " * @returns $3",
      " */"
    ]
  }
}
```

---

**文档版本：** 1.0.0  
**最后更新：** 2024-03-15  
**维护者：** Mota Team