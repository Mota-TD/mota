# =====================================================
# Mota 管理后台 Dockerfile
# 基于Ant Design Pro构建的运营管理后台
# =====================================================

# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制package文件
COPY package*.json ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

# 安装依赖
RUN if [ -f pnpm-lock.yaml ]; then \
        npm install -g pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile; \
    else \
        npm ci; \
    fi

# 复制源代码
COPY . .

# 设置构建时环境变量
ARG REACT_APP_API_URL=/api
ARG REACT_APP_ENV=production

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_ENV=${REACT_APP_ENV}

# 构建应用
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm build; \
    elif [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# ==================== 运行阶段 ====================
FROM nginx:alpine AS runner

# 安装运行时依赖
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# 设置时区
ENV TZ=Asia/Shanghai

# 复制Nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建非root用户运行nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]