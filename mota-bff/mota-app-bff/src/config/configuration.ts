export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  
  jwt: {
    secret: process.env.JWT_SECRET || 'mota-app-bff-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 1,
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300000, // 5 minutes
    max: parseInt(process.env.CACHE_MAX, 10) || 1000,
  },
  
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  
  services: {
    timeout: parseInt(process.env.SERVICE_TIMEOUT, 10) || 30000,
    user: process.env.USER_SERVICE_URL || 'http://localhost:8081',
    tenant: process.env.TENANT_SERVICE_URL || 'http://localhost:8082',
    project: process.env.PROJECT_SERVICE_URL || 'http://localhost:8083',
    task: process.env.TASK_SERVICE_URL || 'http://localhost:8084',
    collab: process.env.COLLAB_SERVICE_URL || 'http://localhost:8085',
    knowledge: process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:8086',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:8087',
    notify: process.env.NOTIFY_SERVICE_URL || 'http://localhost:8088',
    calendar: process.env.CALENDAR_SERVICE_URL || 'http://localhost:8089',
    search: process.env.SEARCH_SERVICE_URL || 'http://localhost:8090',
    file: process.env.FILE_SERVICE_URL || 'http://localhost:8091',
    report: process.env.REPORT_SERVICE_URL || 'http://localhost:8092',
  },
  
  // Mobile-specific configurations
  mobile: {
    // Data compression settings
    compression: {
      enabled: true,
      threshold: 1024, // bytes
    },
    // Pagination defaults for mobile
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 50,
    },
    // Image optimization
    image: {
      thumbnailSize: 200,
      maxWidth: 1080,
      quality: 80,
    },
    // Offline sync settings
    sync: {
      batchSize: 50,
      maxRetries: 3,
      retryDelay: 1000,
    },
  },
});