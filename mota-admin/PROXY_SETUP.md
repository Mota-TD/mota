# 前端代理配置说明

## 问题背景

在开发环境中，前端运行在 `http://localhost:8000`，后端运行在 `http://localhost:8080`，由于端口不同，浏览器的同源策略会阻止跨域请求，导致登录等API调用失败（403 Forbidden - Invalid CORS request）。

## 解决方案

使用**开发服务器代理**来避免跨域问题。所有发往 `/api/` 的请求会被前端开发服务器代理转发到后端服务器。

## 配置文件

### 1. 代理配置 (config/proxy.ts)

```typescript
export default {
  dev: {
    '/api/': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  // ... 其他环境配置
};
```

**参数说明：**
- `target`: 后端服务器地址
- `changeOrigin`: 修改请求头中的Origin，让后端认为请求来自同源
- `pathRewrite`: 路径重写规则（这里不需要重写，保持原样）

### 2. 请求配置 (src/app.tsx)

```typescript
export const request: RequestConfig = {
  // 使用相对路径，通过代理转发到后端
  baseURL: '/api/v1',
  timeout: 30000,
  // ...
};
```

**关键点：**
- 使用相对路径 `/api/v1` 而不是绝对路径 `http://localhost:8080/api/v1`
- 这样请求会发送到前端开发服务器，然后被代理转发

## 工作原理

1. 浏览器发送请求到：`http://localhost:8000/api/v1/auth/login`
2. 前端开发服务器（Umi）识别到 `/api/` 前缀
3. 根据代理配置，将请求转发到：`http://localhost:8080/api/v1/auth/login`
4. 后端处理请求并返回响应
5. 前端开发服务器将响应返回给浏览器

**优势：**
- 浏览器只与 `http://localhost:8000` 通信，没有跨域问题
- 不需要修改后端的CORS配置
- 开发环境下工作流程更简单

## 验证代理是否生效

启动前端开发服务器后，终端会显示：

```
[HPM] Proxy created: /api/  -> http://localhost:8080
[HPM] Proxy rewrite rule created: "^" ~> ""
```

看到这两行说明代理已成功配置。

## 注意事项

1. **仅开发环境有效**：代理配置只在 `npm run start:dev` 时生效
2. **生产环境**：需要使用Nginx等反向代理来处理跨域，或者配置后端CORS
3. **代理配置修改**：修改 `proxy.ts` 后，开发服务器会自动重启
4. **baseURL配置**：必须使用相对路径，否则代理不会生效

## 测试登录

1. 访问：http://localhost:8000/user/login
2. 输入默认账号：
   - 用户名：`admin`
   - 密码：`admin123`
3. 点击登录

如果配置正确，应该能够成功登录并跳转到首页。

## 相关文件

- [`config/proxy.ts`](config/proxy.ts) - 代理配置
- [`src/app.tsx`](src/app.tsx) - 请求基础配置
- [`src/pages/user/login/index.tsx`](src/pages/user/login/index.tsx) - 登录页面