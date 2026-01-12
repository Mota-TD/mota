# =====================================================
# Mota BFF服务 Dockerfile
# 基于NestJS构建的Backend For Frontend服务
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

# 复制源代�?
COPY . .

# 构建应用
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm build; \
    elif [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# 清理开发依�?
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm prune --prod; \
    elif [ -f yarn.lock ]; then \
        yarn install --production --frozen-lockfile; \
    else \
        npm prune --production; \
    fi

# ==================== 运行阶段 ====================
FROM node:20-alpine AS runner

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# 设置工作目录
WORKDIR /app

# 安装运行时依�?
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# 创建日志目录
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检�?
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 使用tini作为init进程
ENTRYPOINT ["/sbin/tini", "--"]

# 启动应用
CMD ["node", "dist/main.js"]
