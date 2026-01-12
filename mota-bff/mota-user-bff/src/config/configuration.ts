export default () => ({
  // 服务端口
  port: parseInt(process.env.PORT, 10) || 3001,

  // 后端服务地址
  services: {
    gateway: process.env.GATEWAY_URL || 'http://localhost:8080',
    user: process.env.USER_SERVICE_URL || 'http://localhost:8081',
    project: process.env.PROJECT_SERVICE_URL || 'http://localhost:8082',
    task: process.env.TASK_SERVICE_URL || 'http://localhost:8083',
    knowledge: process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:8084',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:8085',
    notify: process.env.NOTIFY_SERVICE_URL || 'http://localhost:8086',
    calendar: process.env.CALENDAR_SERVICE_URL || 'http://localhost:8087',
    search: process.env.SEARCH_SERVICE_URL || 'http://localhost:8088',
    file: process.env.FILE_SERVICE_URL || 'http://localhost:8089',
    report: process.env.REPORT_SERVICE_URL || 'http://localhost:8090',
    collab: process.env.COLLAB_SERVICE_URL || 'http://localhost:8091',
    tenant: process.env.TENANT_SERVICE_URL || 'http://localhost:8092',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'mota-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 默认5分钟
    max: parseInt(process.env.CACHE_MAX, 10) || 1000,
  },

  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  // HTTP客户端配置
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT, 10) || 30000,
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS, 10) || 5,
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
});