# =====================================================
# Mota Frontend Dockerfile
# 多阶段构建：构建阶段 + 运行阶段
# =====================================================

# =====================================================
# 阶段1：构建阶段
# =====================================================
FROM node:18-alpine AS builder

LABEL maintainer="Mota Team"
LABEL description="Mota Frontend - 用户端前端应用"

# 设置工作目录
WORKDIR /app

# 设置 npm 镜像源（加速构建）
RUN npm config set registry https://registry.npmmirror.com

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# =====================================================
# 阶段2：运行阶段
# =====================================================
FROM nginx:1.25-alpine

LABEL maintainer="Mota Team"
LABEL description="Mota Frontend - 用户端前端应用"

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 删除默认配置
RUN rm -rf /etc/nginx/conf.d/*

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建非 root 用户运行 nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]