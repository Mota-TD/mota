# Mota Admin 最终配置指南

## ✅ 当前状态

### 开发服务器
- **状态**: ✅ 运行中
- **地址**: http://localhost:8000
- **进程ID**: 26852
- **构建工具**: Webpack (MFSU加速)

### 配置更改
1. ✅ 禁用了Mock数据（`.env.development`）
2. ✅ 禁用了Mako构建工具（`config/config.ts`）
3. ✅ 配置使用真实后端API

## 🔧 配置详情

### 1. 环境变量（`.env.development`）
```bash
# API Gateway地址
API_BASE_URL=http://localhost:8080/api/v1

# Mock数据开关（已禁用）
MOCK=disable

# 环境标识
REACT_APP_ENV=dev
```

### 2. Umi配置（`config/config.ts`）
- ✅ 禁用了Mako构建工具
- ✅ 使用默认Webpack构建
- ✅ 禁用了Mock配置
- ✅ 启用了MFSU加速

## 📋 后端服务要求

### 需要启动的服务

**mota-service 后端服务必须运行在 `http://localhost:8080`**

启动后端服务：
```bash
cd mota-service

# 启动用户服务
cd mota-user-service
mvn spring-boot:run

# 启动项目服务
cd mota-project-service
mvn spring-boot:run

# 启动其他必要的微服务...
```

### API端点检查

前端会调用以下API端点：
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/current-user` - 获取当前用户信息
- `POST /api/v1/auth/logout` - 用户登出
- 其他业务API...

## 🚀 使用步骤

### 1. 确保后端服务运行
```bash
# 检查后端服务是否运行
curl http://localhost:8080/api/v1/health

# 或在浏览器访问
http://localhost:8080/api/v1/health
```

### 2. 访问前端应用
```
http://localhost:8000
```

### 3. 登录测试
- 访问登录页面：`http://localhost:8000/user/login`
- 输入真实的用户名和密码
- 系统将调用后端API进行认证

## ⚠️ 常见问题

### 1. 登录时显示 "Network Error"

**原因**: 后端服务未启动或端口不正确

**解决方案**:
```bash
# 检查后端服务
netstat -ano | findstr :8080

# 如果没有输出，说明后端未启动
# 需要启动 mota-service
```

### 2. CORS跨域错误

**原因**: 后端未配置CORS

**解决方案**: 在后端添加CORS配置
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:8000");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 3. 编译错误

**如果遇到编译问题**:
```bash
# 停止服务器 (Ctrl+C)
cd mota-admin

# 清理缓存
rm -rf .umi node_modules/.cache

# 重新启动
npm run dev
```

## 📁 项目结构

```
mota-admin/
├── src/
│   ├── pages/              # 24个管理页面
│   ├── services/           # API服务层（调用真实API）
│   ├── components/         # 通用组件
│   └── models/             # 状态管理
├── config/
│   ├── config.ts           # Umi配置（已禁用Mako和Mock）
│   ├── routes.ts           # 路由配置
│   └── proxy.ts            # 代理配置
├── .env.development        # 环境变量（Mock已禁用）
└── package.json            # 项目配置
```

## 🎯 下一步操作

### 1. 启动后端服务
```bash
cd mota-service
# 按照后端服务启动指南启动所有必要的微服务
```

### 2. 测试登录功能
- 访问 http://localhost:8000
- 使用真实账号登录
- 验证API调用是否正常

### 3. 开发业务功能
- 所有页面已创建完成
- 需要实现具体的业务逻辑
- 连接真实的后端API

## 📚 相关文档

- `docs/` - 完整的项目文档
- `README.md` - 项目说明
- `mota-service/docs/07-后端服务启动指南.md` - 后端启动指南

## 🔗 访问地址

- **前端地址**: http://localhost:8000
- **后端API**: http://localhost:8080/api/v1
- **API文档**: http://localhost:8080/swagger-ui.html (如果配置了Swagger)

---

**当前状态**: ✅ 前端服务运行中，等待后端服务启动
**最后更新**: 2026-02-02 14:49 (UTC+8)