# Mota Admin 部署指南

## 目录
1. [系统要求](#系统要求)
2. [本地开发环境](#本地开发环境)
3. [生产环境构建](#生产环境构建)
4. [服务器部署](#服务器部署)
5. [Docker部署](#docker部署)
6. [环境配置](#环境配置)
7. [常见问题](#常见问题)
8. [监控与维护](#监控与维护)

## 系统要求

### 开发机器
- Node.js: >= 20.0.0
- npm: >= 10.0.0
- Git: 最新版本

### 服务器
- OS: Linux (Ubuntu 20.04+) 或 Windows Server 2019+
- 内存: 最少 2GB RAM
- 磁盘: 最少 5GB 可用空间
- 网络: 稳定的互联网连接

### 浏览器支持
- Chrome/Edge: 最新版本
- Firefox: 最新版本
- Safari: 最新版本

## 本地开发环境

### 1. 环境配置

```bash
# 克隆仓库
git clone <repository-url>
cd mota-admin

# 安装依赖
npm install

# 验证安装
npm run tsc --noEmit
npm run lint
```

### 2. 启动开发服务器

```bash
# 开发环境启动（使用Mock数据）
npm run start:dev

# 开发环境启动（连接真实后端）
npm start:no-mock

# 启动前置环境
npm start:pre

# 启动测试环境
npm start:test
```

### 3. 代码质量检查

```bash
# TypeScript类型检查
npm run tsc

# Biome代码规范检查
npm run biome:lint

# 完整lint检查（TypeScript + Biome）
npm run lint

# 生成代码覆盖率报告
npm run test:coverage
```

## 生产环境构建

### 1. 构建步骤

```bash
# 1. 检查代码质量
npm run lint

# 2. 分析构建体积（可选）
npm run analyze

# 3. 构建生产版本
npm run build

# 4. 验证构建结果
ls -la dist/
```

### 2. 构建输出

构建完成后，`dist/` 目录包含以下文件：

```
dist/
├── index.html              # 主入口HTML
├── umi.*.js               # 框架核心JS
├── vendors-async.*.js     # 第三方依赖
├── *.async.*.js           # 各页面异步chunks
├── *.css                  # 样式文件
└── *.map                  # Source maps（调试用）
```

### 3. 构建性能指标

- 构建时间：~4-5秒
- 主文件大小：1.77MB
- 第三方包：2.55MB
- 总体大小：4.32MB+（未压缩）
- 压缩后：约1.2MB（gzip）

## 服务器部署

### 方案1：Nginx部署（推荐）

#### 1. 安装Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. 配置Nginx

编辑 `/etc/nginx/sites-available/mota-admin`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS（可选）
    # return 301 https://$server_name$request_uri;

    root /var/www/mota-admin/dist;
    index index.html index.htm;

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json;
    gzip_min_length 1000;

    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # HTML文件不缓存
    location ~* \.html?$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 单页应用路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理（如需要）
    location /api/ {
        proxy_pass http://backend-server:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 日志配置
    access_log /var/log/nginx/mota-admin.access.log;
    error_log /var/log/nginx/mota-admin.error.log;
}

# HTTPS配置（使用Let's Encrypt证书）
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同上...
}
```

#### 3. 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/mota-admin \
           /etc/nginx/sites-enabled/mota-admin

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

#### 4. 部署应用

```bash
# 创建部署目录
sudo mkdir -p /var/www/mota-admin

# 上传dist文件
scp -r dist/* user@server:/var/www/mota-admin/dist/

# 设置权限
sudo chown -R www-data:www-data /var/www/mota-admin
sudo chmod -R 755 /var/www/mota-admin
```

### 方案2：Apache部署

编辑 `/etc/apache2/sites-available/mota-admin.conf`：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/mota-admin/dist

    # 启用mod_rewrite
    <Directory /var/www/mota-admin/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # 单页应用路由
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteRule ^index\.html$ - [L]
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/mota-admin-error.log
    CustomLog ${APACHE_LOG_DIR}/mota-admin-access.log combined
</VirtualHost>
```

启用配置：

```bash
sudo a2enmod rewrite
sudo a2ensite mota-admin.conf
sudo systemctl restart apache2
```

## Docker部署

### 1. 创建Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制Nginx配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# 复制构建输出
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建nginx配置 (default.conf)

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. 构建和运行Docker镜像

```bash
# 构建镜像
docker build -t mota-admin:latest .

# 运行容器
docker run -d \
  --name mota-admin \
  -p 80:80 \
  -p 443:443 \
  mota-admin:latest

# 查看日志
docker logs -f mota-admin
```

### 4. Docker Compose部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mota-admin:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./dist:/usr/share/nginx/html
      - /etc/letsencrypt:/etc/letsencrypt
    restart: always
    environment:
      - NODE_ENV=production

  nginx-ssl-renewal:
    image: certbot/certbot
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
    command: renew --non-interactive
    restart: monthly
```

运行：

```bash
docker-compose up -d
```

## 环境配置

### 1. 环境变量

创建 `.env.production` 文件：

```bash
# API配置
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_API_TIMEOUT=30000

# 功能开关
REACT_APP_ENABLE_MOCK=false
REACT_APP_LOG_LEVEL=error

# 应用配置
REACT_APP_APP_NAME=Mota Admin
REACT_APP_VERSION=1.0.0
```

### 2. API后端配置

更新API调用地址：

```typescript
// src/services/config.ts
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
```

### 3. 跨域配置

后端需配置CORS支持：

```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 常见问题

### Q1: 路由不工作

**问题**：刷新页面显示404

**解决**：
- Nginx：配置 `try_files $uri $uri/ /index.html;`
- Apache：启用 `mod_rewrite` 并配置重写规则
- 验证 `<base>` 标签配置正确

### Q2: 静态资源404

**问题**：CSS、JS文件加载失败

**解决**：
- 检查构建输出 `dist/` 目录完整
- 验证服务器root路径指向dist目录
- 检查文件权限（755）

### Q3: CORS错误

**问题**：API请求被浏览器阻止

**解决**：
- 配置后端CORS头
- 配置Nginx反向代理
- 在Nginx中添加必要的header

### Q4: 性能问题

**问题**：页面加载缓慢

**解决**：
- 启用Gzip压缩
- 配置CDN缓存
- 优化图片大小
- 检查后端API响应时间

### Q5: HTTPS证书问题

**问题**：HTTPS连接失败

**解决**：
```bash
# 使用Let's Encrypt免费证书
sudo certbot certonly --standalone -d your-domain.com

# 自动续期
sudo systemctl enable certbot.timer
```

## 监控与维护

### 1. 日志监控

```bash
# 查看Nginx日志
tail -f /var/log/nginx/mota-admin.access.log
tail -f /var/log/nginx/mota-admin.error.log

# 查看系统日志
journalctl -u nginx -f
```

### 2. 性能监控

```bash
# 检查磁盘使用
df -h /var/www/mota-admin

# 检查内存使用
free -h

# 检查Nginx进程
ps aux | grep nginx
```

### 3. 定期维护

```bash
# 更新依赖
npm update

# 清理缓存
rm -rf dist/
npm run build

# 备份数据
tar -czf mota-admin-backup-$(date +%Y%m%d).tar.gz dist/
```

### 4. 监控告警

使用以下工具进行监控：
- **Prometheus** - 指标收集
- **Grafana** - 可视化仪表板
- **AlertManager** - 告警管理
- **ELK Stack** - 日志分析

### 5. 备灾恢复

```bash
# 自动备份脚本
#!/bin/bash
BACKUP_DIR="/var/backups/mota-admin"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/dist-$(date +%Y%m%d).tar.gz /var/www/mota-admin/dist
find $BACKUP_DIR -type f -mtime +30 -delete  # 删除30天前的备份
```

## 部署检查清单

- [ ] Node.js >= 20.0.0 已安装
- [ ] npm依赖已安装 (`npm install`)
- [ ] 代码质量检查通过 (`npm run lint`)
- [ ] 生产构建成功 (`npm run build`)
- [ ] dist目录完整（91个文件）
- [ ] Nginx/Apache已配置
- [ ] SSL证书已配置
- [ ] 环境变量已设置
- [ ] API后端已连接
- [ ] 测试访问成功
- [ ] 日志收集已配置
- [ ] 监控告警已配置
- [ ] 备份策略已制定

## 快速部署命令

```bash
# 完整部署流程
git clone <repository> && cd mota-admin && \
npm install && \
npm run lint && \
npm run build && \
scp -r dist/* user@server:/var/www/mota-admin/dist/ && \
ssh user@server "sudo systemctl restart nginx"
```

## 支持和反馈

如遇到部署问题，请参考：
- 官方文档：查看相关docs文件
- 问题日志：检查 `/var/log/nginx/mota-admin.*.log`
- 构建日志：检查 `npm run build` 输出

---

**最后更新**：2026-02-02  
**版本**：1.0.0