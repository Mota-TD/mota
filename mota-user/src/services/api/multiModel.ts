import { get, post, put, del } from '../request';

/**
 * 多模型支持API服务
 * 实现 MM-001 到 MM-008 功能
 */

// ==================== 提供商管理 ====================

/**
 * 获取所有提供商列表
 */
export async function getProviders() {
  return get('/api/multi-model/providers');
}

/**
 * 获取提供商详情
 */
export async function getProviderById(providerId: number) {
  return get(`/api/multi-model/providers/${providerId}`);
}

/**
 * 创建提供商
 */
export async function createProvider(data: any) {
  return post('/api/multi-model/providers', data);
}

/**
 * 更新提供商
 */
export async function updateProvider(providerId: number, data: any) {
  return put(`/api/multi-model/providers/${providerId}`, data);
}

// ==================== 模型管理 ====================

/**
 * 获取所有模型列表
 */
export async function getModels(providerId?: number) {
  return get('/api/multi-model/models', providerId ? { providerId } : undefined);
}

/**
 * 获取模型详情
 */
export async function getModelById(modelId: number) {
  return get(`/api/multi-model/models/${modelId}`);
}

/**
 * 创建模型配置
 */
export async function createModel(data: any) {
  return post('/api/multi-model/models', data);
}

/**
 * 更新模型配置
 */
export async function updateModel(modelId: number, data: any) {
  return put(`/api/multi-model/models/${modelId}`, data);
}

/**
 * 设置默认模型
 */
export async function setDefaultModel(modelId: number) {
  return post(`/api/multi-model/models/${modelId}/set-default`);
}

// ==================== 路由规则管理 ====================

/**
 * 获取路由规则列表
 */
export async function getRoutingRules() {
  return get('/api/multi-model/routing-rules');
}

/**
 * 创建路由规则
 */
export async function createRoutingRule(data: any) {
  return post('/api/multi-model/routing-rules', data);
}

/**
 * 更新路由规则
 */
export async function updateRoutingRule(ruleId: number, data: any) {
  return put(`/api/multi-model/routing-rules/${ruleId}`, data);
}

/**
 * 删除路由规则
 */
export async function deleteRoutingRule(ruleId: number) {
  return del(`/api/multi-model/routing-rules/${ruleId}`);
}

/**
 * 选择模型
 */
export async function selectModel(context: any) {
  return post('/api/multi-model/select-model', context);
}

// ==================== 降级策略管理 ====================

/**
 * 获取降级策略列表
 */
export async function getFallbackStrategies() {
  return get('/api/multi-model/fallback-strategies');
}

/**
 * 创建降级策略
 */
export async function createFallbackStrategy(data: any) {
  return post('/api/multi-model/fallback-strategies', data);
}

/**
 * 更新降级策略
 */
export async function updateFallbackStrategy(strategyId: number, data: any) {
  return put(`/api/multi-model/fallback-strategies/${strategyId}`, data);
}

/**
 * 获取熔断器状态
 */
export async function getCircuitBreakerStatus() {
  return get('/api/multi-model/circuit-breaker/status');
}

/**
 * 重置熔断器
 */
export async function resetCircuitBreaker(modelId: number) {
  return post(`/api/multi-model/circuit-breaker/${modelId}/reset`);
}

// ==================== 成本控制 ====================

/**
 * 获取成本预算列表
 */
export async function getCostBudgets() {
  return get('/api/multi-model/cost-budgets');
}

/**
 * 创建成本预算
 */
export async function createCostBudget(data: any) {
  return post('/api/multi-model/cost-budgets', data);
}

/**
 * 更新成本预算
 */
export async function updateCostBudget(budgetId: number, data: any) {
  return put(`/api/multi-model/cost-budgets/${budgetId}`, data);
}

/**
 * 获取成本统计
 */
export async function getCostStatistics(params?: {
  period?: string;
  providerId?: number;
  modelId?: number;
}) {
  return get('/api/multi-model/cost-statistics', params);
}

/**
 * 获取调用日志
 */
export async function getCallLogs(params?: {
  page?: number;
  size?: number;
  modelId?: number;
  status?: string;
}) {
  return get('/api/multi-model/call-logs', params);
}

/**
 * 检查预算
 */
export async function checkBudget(userId: number, estimatedCost: number) {
  return post('/api/multi-model/check-budget', { userId, estimatedCost });
}

/**
 * 健康检查
 */
export async function healthCheck() {
  return get('/api/multi-model/health-check');
}

// ==================== Mock数据（开发用） ====================

/**
 * 获取Mock提供商列表
 */
export function getMockProviders() {
  return [
    {
      id: 1,
      providerCode: 'openai',
      providerName: 'OpenAI',
      providerType: 'international',
      apiBaseUrl: 'https://api.openai.com/v1',
      isEnabled: true,
      healthStatus: 'healthy',
      priority: 100
    },
    {
      id: 2,
      providerCode: 'anthropic',
      providerName: 'Anthropic',
      providerType: 'international',
      apiBaseUrl: 'https://api.anthropic.com/v1',
      isEnabled: true,
      healthStatus: 'healthy',
      priority: 90
    },
    {
      id: 3,
      providerCode: 'aliyun',
      providerName: '阿里云通义千问',
      providerType: 'domestic',
      apiBaseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      isEnabled: true,
      healthStatus: 'healthy',
      priority: 80
    },
    {
      id: 4,
      providerCode: 'baidu',
      providerName: '百度文心一言',
      providerType: 'domestic',
      apiBaseUrl: 'https://aip.baidubce.com',
      isEnabled: true,
      healthStatus: 'healthy',
      priority: 70
    }
  ];
}

/**
 * 获取Mock模型列表
 */
export function getMockModels() {
  return [
    {
      id: 1,
      providerId: 1,
      providerName: 'OpenAI',
      modelCode: 'gpt-4',
      modelName: 'GPT-4',
      modelType: 'chat',
      maxTokens: 8192,
      contextWindow: 8192,
      inputPrice: 0.03,
      outputPrice: 0.06,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 2,
      providerId: 1,
      providerName: 'OpenAI',
      modelCode: 'gpt-4-turbo',
      modelName: 'GPT-4 Turbo',
      modelType: 'chat',
      maxTokens: 128000,
      contextWindow: 128000,
      inputPrice: 0.01,
      outputPrice: 0.03,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: true,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 3,
      providerId: 1,
      providerName: 'OpenAI',
      modelCode: 'gpt-3.5-turbo',
      modelName: 'GPT-3.5 Turbo',
      modelType: 'chat',
      maxTokens: 16385,
      contextWindow: 16385,
      inputPrice: 0.0005,
      outputPrice: 0.0015,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isEnabled: true,
      isDefault: true
    },
    {
      id: 4,
      providerId: 2,
      providerName: 'Anthropic',
      modelCode: 'claude-3-opus',
      modelName: 'Claude 3 Opus',
      modelType: 'chat',
      maxTokens: 200000,
      contextWindow: 200000,
      inputPrice: 0.015,
      outputPrice: 0.075,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: true,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 5,
      providerId: 2,
      providerName: 'Anthropic',
      modelCode: 'claude-3-sonnet',
      modelName: 'Claude 3 Sonnet',
      modelType: 'chat',
      maxTokens: 200000,
      contextWindow: 200000,
      inputPrice: 0.003,
      outputPrice: 0.015,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: true,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 6,
      providerId: 3,
      providerName: '阿里云通义千问',
      modelCode: 'qwen-turbo',
      modelName: '通义千问-Turbo',
      modelType: 'chat',
      maxTokens: 8000,
      contextWindow: 8000,
      inputPrice: 0.008,
      outputPrice: 0.008,
      supportsStreaming: true,
      supportsFunctionCall: false,
      supportsVision: false,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 7,
      providerId: 3,
      providerName: '阿里云通义千问',
      modelCode: 'qwen-plus',
      modelName: '通义千问-Plus',
      modelType: 'chat',
      maxTokens: 32000,
      contextWindow: 32000,
      inputPrice: 0.02,
      outputPrice: 0.02,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 8,
      providerId: 4,
      providerName: '百度文心一言',
      modelCode: 'ernie-bot-4',
      modelName: '文心一言4.0',
      modelType: 'chat',
      maxTokens: 8000,
      contextWindow: 8000,
      inputPrice: 0.12,
      outputPrice: 0.12,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isEnabled: true,
      isDefault: false
    },
    {
      id: 9,
      providerId: 4,
      providerName: '百度文心一言',
      modelCode: 'ernie-bot-turbo',
      modelName: '文心一言Turbo',
      modelType: 'chat',
      maxTokens: 8000,
      contextWindow: 8000,
      inputPrice: 0.008,
      outputPrice: 0.008,
      supportsStreaming: true,
      supportsFunctionCall: false,
      supportsVision: false,
      isEnabled: true,
      isDefault: false
    }
  ];
}

/**
 * 获取Mock路由规则
 */
export function getMockRoutingRules() {
  return [
    {
      id: 1,
      ruleName: '默认路由',
      ruleType: 'default',
      priority: 0,
      conditions: {},
      targetModelId: 3,
      targetModelName: 'GPT-3.5 Turbo',
      weight: 100,
      isEnabled: true
    },
    {
      id: 2,
      ruleName: '高级用户路由',
      ruleType: 'user_level',
      priority: 10,
      conditions: { userLevel: 'premium' },
      targetModelId: 1,
      targetModelName: 'GPT-4',
      weight: 100,
      isEnabled: true
    },
    {
      id: 3,
      ruleName: '成本优先路由',
      ruleType: 'cost',
      priority: 5,
      conditions: { maxCostPerCall: 0.01 },
      targetModelId: 3,
      targetModelName: 'GPT-3.5 Turbo',
      weight: 100,
      isEnabled: true
    }
  ];
}

/**
 * 获取Mock降级策略
 */
export function getMockFallbackStrategies() {
  return [
    {
      id: 1,
      strategyName: 'GPT-4降级策略',
      primaryModelId: 1,
      primaryModelName: 'GPT-4',
      fallbackModelIds: [2, 3],
      fallbackModelNames: ['GPT-4 Turbo', 'GPT-3.5 Turbo'],
      maxRetries: 3,
      retryDelayMs: 1000,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 5,
      isEnabled: true
    },
    {
      id: 2,
      strategyName: 'Claude降级策略',
      primaryModelId: 4,
      primaryModelName: 'Claude 3 Opus',
      fallbackModelIds: [5, 3],
      fallbackModelNames: ['Claude 3 Sonnet', 'GPT-3.5 Turbo'],
      maxRetries: 3,
      retryDelayMs: 1000,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 5,
      isEnabled: true
    }
  ];
}

/**
 * 获取Mock成本统计
 */
export function getMockCostStatistics() {
  return {
    totalCalls: 15680,
    totalTokens: 4520000,
    totalCost: 3500.00,
    avgCostPerCall: 0.223,
    avgResponseTime: 1250,
    successRate: 99.5,
    byProvider: [
      { providerId: 1, providerName: 'OpenAI', calls: 8500, cost: 2100.00, percent: 60 },
      { providerId: 2, providerName: 'Anthropic', calls: 3200, cost: 800.00, percent: 23 },
      { providerId: 3, providerName: '国内模型', calls: 3980, cost: 600.00, percent: 17 }
    ],
    trend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      calls: 400 + Math.floor(Math.random() * 200),
      cost: 80 + Math.random() * 50
    }))
  };
}