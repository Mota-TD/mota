export default () => ({
  // 服务端口
  port: parseInt(process.env.PORT || '3001', 10),

  // 后端服务地址
  services: {
    gateway: process.env.GATEWAY_URL || 'http://localhost:8080',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8081',
    user: process.env.USER_SERVICE_URL || 'http://localhost:8087',
    project: process.env.PROJECT_SERVICE_URL || 'http://localhost:8082',
    task: process.env.TASK_SERVICE_URL || 'http://localhost:8083',
    knowledge: process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:8084',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:8085',
    notify: process.env.NOTIFY_SERVICE_URL || 'http://localhost:8086',
    calendar: process.env.CALENDAR_SERVICE_URL || 'http://localhost:8093',
    search: process.env.SEARCH_SERVICE_URL || 'http://localhost:8088',
    file: process.env.FILE_SERVICE_URL || 'http://localhost:8089',
    report: process.env.REPORT_SERVICE_URL || 'http://localhost:8090',
    collab: process.env.COLLAB_SERVICE_URL || 'http://localhost:8091',
    tenant: process.env.TENANT_SERVICE_URL || 'http://localhost:8092',
  },

  // JWT配置 - 密钥必须与 auth-service 保持一致（Base64 编码）
  jwt: {
    secret: process.env.JWT_SECRET || 'bW90YS1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tZ2VuZXJhdGlvbi1tdXN0LWJlLWF0LWxlYXN0LTI1Ni1iaXRz',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 默认5分钟
    max: parseInt(process.env.CACHE_MAX || '1000', 10),
  },

  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },

  // HTTP客户端配置
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT || '30000', 10),
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS || '5', 10),
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
});