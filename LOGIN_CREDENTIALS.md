# 登录凭据说明

## Admin后台登录信息

**登录地址**: http://localhost:8000/user/login

**默认账号**:
- 用户名: `admin`
- 密码: `admin123`

## 当前状态

✅ 后端服务已启动
✅ 前端服务已启动
✅ 前端登录表单已修复（移除了不支持的字段）
✅ Spring Security CORS配置已修复
✅ 前端响应码检查已修复 (code === 200)

## 问题诊断（已解决）

根据日志分析，登录请求已经到达认证服务，但被Spring Security拦截。原因已确认：

1. **CSRF保护**: ✅ 已禁用 (`.csrf(csrf -> csrf.disable())`)
2. **CORS配置**: ✅ 已修复 - 认证服务原先使用 `.cors(cors -> cors.disable())` 禁用了CORS，但又定义了 `corsConfigurationSource()` Bean，配置矛盾。现已修复为 `.cors(cors -> cors.configurationSource(corsConfigurationSource()))`
3. **Spring Security配置**: ✅ 已正确配置 `/api/v1/auth/**` 路径 permitAll

## 注意事项

1. **响应码变更**: 后端API成功响应码为 `200`，而不是 `0`
2. **字段名变更**: 
   - Token字段名为 `accessToken` 而不是 `token`
   - 过期时间 `expiresIn` 返回字符串类型（如 "86400"）
3. **获取用户信息接口**: `/api/v1/auth/current-user` 当前返回500错误，需要后端修复

## 已修复的问题

1. ✅ 登录请求参数已调整为后端期望的格式（移除了 `type` 和 `autoLogin` 字段）
2. ✅ 前端类型定义已更新以匹配后端API响应
3. ✅ 登录成功码已从 `0` 改为 `200`
4. ✅ 认证服务 Spring Security CORS 配置已修复
5. ✅ 前端3处响应码检查已修复:
   - `mota-admin/src/utils/refreshToken.ts` 第90行
   - `mota-admin/src/pages/Tenant/TenantDetail/index.tsx` 第49行
   - `mota-admin/src/pages/Tenant/TenantList/index.tsx` 第277行

## 建议的解决方案

### 方案1: 检查认证服务的Security配置

需要确认 `mota-auth-service` 的Spring Security配置中：
- `/api/v1/auth/login` 是否在白名单中
- CSRF是否正确配置
- CORS是否正确配置

### 方案2: 使用Postman/curl直接测试

绕过浏览器的安全限制，直接测试后端API：

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

如果curl能成功（返回200和token），说明问题在前端；如果curl也失败，说明问题在后端。

### 方案3: 检查浏览器控制台

查看浏览器开发者工具的Network标签：
- 请求URL是否正确
- 请求Headers是否正确
- 是否有CORS错误
- 响应状态码和响应体

## 待修复的问题

1. ✅ ~~登录接口返回403~~ - 已修复 Spring Security CORS 配置
2. ⚠️ `/api/v1/auth/current-user` 接口返回500错误 - 建议从JWT中解析用户信息作为备选方案（前端已实现）
3. ✅ ~~后端认证服务的安全配置~~ - 已修复

## API端点

- 登录: `POST http://localhost:8080/api/v1/auth/login`
- 获取当前用户: `GET http://localhost:8080/api/v1/auth/current-user`
- 登出: `POST http://localhost:8080/api/v1/auth/logout`
- 刷新Token: `POST http://localhost:8080/api/v1/auth/refresh`

## 测试登录

可以使用以下curl命令测试登录：

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

成功响应示例：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": "86400",
    "userId": "1",
    "username": "admin",
    "nickname": "系统管理员",
    "orgId": "ORG001",
    "orgName": "摩塔科技"
  },
  "timestamp": "1770084929157",
  "success": true
}