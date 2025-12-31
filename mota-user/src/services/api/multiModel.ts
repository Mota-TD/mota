import { get, post, put, del } from '../request';

/**
 * 多模型支持API服务
 * 实现 MM-001 到 MM-008 功能
 */

// ==================== 类型定义 ====================

export interface Provider {
  id: number;
  providerName: string;
  providerCode: string;
  providerType: 'international' | 'domestic';
  apiBaseUrl: string;
  priority: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  isEnabled: boolean;
}

export interface Model {
  id: number;
  modelName: string;
  modelCode: string;
  providerId: number;
  providerName: string;
  contextWindow: number;
  inputPrice: number;
  outputPrice: number;
  supportsStreaming: boolean;
  supportsFunctionCall: boolean;
  supportsVision: boolean;
  isDefault: boolean;
  isEnabled: boolean;
}

export interface RoutingRule {
  id: number;
  ruleName: string;
  ruleType: 'default' | 'user_level' | 'cost' | 'load_balance' | 'task_type';
  priority: number;
  targetModelId: number;
  targetModelName: string;
  weight: number;
  isEnabled: boolean;
}

export interface FallbackStrategy {
  id: number;
  strategyName: string;
  primaryModelId: number;
  primaryModelName: string;
  fallbackModelIds: number[];
  fallbackModelNames: string[];
  maxRetries: number;
  retryDelayMs: number;
  circuitBreakerEnabled: boolean;
  circuitBreakerThreshold: number;
  isEnabled: boolean;
}

export interface CostStatistics {
  totalCalls: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
  byProvider: {
    providerId: number;
    providerName: string;
    cost: number;
    percent: number;
  }[];
}

// ==================== Mock 数据函数 ====================

/**
 * 获取Mock提供商数据
 */
export function getMockProviders(): Provider[] {
  return [
    {
      id: 1,
      providerName: '豆包 (火山引擎)',
      providerCode: 'doubao',
      providerType: 'domestic',
      apiBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      priority: 100,
      healthStatus: 'healthy',
      isEnabled: true
    },
    {
      id: 2,
      providerName: 'OpenAI',
      providerCode: 'openai',
      providerType: 'international',
      apiBaseUrl: 'https://api.openai.com/v1',
      priority: 90,
      healthStatus: 'healthy',
      isEnabled: true
    },
    {
      id: 3,
      providerName: 'Anthropic',
      providerCode: 'anthropic',
      providerType: 'international',
      apiBaseUrl: 'https://api.anthropic.com/v1',
      priority: 85,
      healthStatus: 'healthy',
      isEnabled: true
    },
    {
      id: 4,
      providerName: '阿里云通义',
      providerCode: 'aliyun',
      providerType: 'domestic',
      apiBaseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      priority: 80,
      healthStatus: 'healthy',
      isEnabled: true
    },
    {
      id: 5,
      providerName: '百度文心',
      providerCode: 'baidu',
      providerType: 'domestic',
      apiBaseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom',
      priority: 70,
      healthStatus: 'degraded',
      isEnabled: true
    }
  ];
}

/**
 * 获取Mock模型数据
 */
export function getMockModels(): Model[] {
  return [
    {
      id: 1,
      modelName: '豆包Pro 32K',
      modelCode: 'doubao-pro-32k',
      providerId: 1,
      providerName: '豆包 (火山引擎)',
      contextWindow: 32768,
      inputPrice: 0.008,
      outputPrice: 0.012,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isDefault: true,
      isEnabled: true
    },
    {
      id: 2,
      modelName: '豆包Pro 128K',
      modelCode: 'doubao-pro-128k',
      providerId: 1,
      providerName: '豆包 (火山引擎)',
      contextWindow: 131072,
      inputPrice: 0.012,
      outputPrice: 0.018,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 3,
      modelName: '豆包Lite 32K',
      modelCode: 'doubao-lite-32k',
      providerId: 1,
      providerName: '豆包 (火山引擎)',
      contextWindow: 32768,
      inputPrice: 0.003,
      outputPrice: 0.006,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 4,
      modelName: 'GPT-4',
      modelCode: 'gpt-4',
      providerId: 2,
      providerName: 'OpenAI',
      contextWindow: 128000,
      inputPrice: 0.03,
      outputPrice: 0.06,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: true,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 5,
      modelName: 'GPT-3.5 Turbo',
      modelCode: 'gpt-3.5-turbo',
      providerId: 2,
      providerName: 'OpenAI',
      contextWindow: 16000,
      inputPrice: 0.001,
      outputPrice: 0.002,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 6,
      modelName: 'Claude 3 Sonnet',
      modelCode: 'claude-3-sonnet',
      providerId: 3,
      providerName: 'Anthropic',
      contextWindow: 200000,
      inputPrice: 0.003,
      outputPrice: 0.015,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: true,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 7,
      modelName: 'Claude 3 Opus',
      modelCode: 'claude-3-opus',
      providerId: 3,
      providerName: 'Anthropic',
      contextWindow: 200000,
      inputPrice: 0.015,
      outputPrice: 0.075,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: true,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 8,
      modelName: '通义千问-Turbo',
      modelCode: 'qwen-turbo',
      providerId: 4,
      providerName: '阿里云通义',
      contextWindow: 8000,
      inputPrice: 0.008,
      outputPrice: 0.012,
      supportsStreaming: true,
      supportsFunctionCall: true,
      supportsVision: false,
      isDefault: false,
      isEnabled: true
    },
    {
      id: 9,
      modelName: '文心一言4.0',
      modelCode: 'ernie-4.0',
      providerId: 5,
      providerName: '百度文心',
      contextWindow: 8000,
      inputPrice: 0.012,
      outputPrice: 0.012,
      supportsStreaming: true,
      supportsFunctionCall: false,
      supportsVision: false,
      isDefault: false,
      isEnabled: true
    }
  ];
}

/**
 * 获取Mock路由规则数据
 */
export function getMockRoutingRules(): RoutingRule[] {
  return [
    {
      id: 1,
      ruleName: '默认路由 (豆包)',
      ruleType: 'default',
      priority: 0,
      targetModelId: 1,
      targetModelName: '豆包Pro 32K',
      weight: 100,
      isEnabled: true
    },
    {
      id: 2,
      ruleName: 'VIP用户路由',
      ruleType: 'user_level',
      priority: 100,
      targetModelId: 4,
      targetModelName: 'GPT-4',
      weight: 100,
      isEnabled: true
    },
    {
      id: 3,
      ruleName: '成本优先路由',
      ruleType: 'cost',
      priority: 50,
      targetModelId: 3,
      targetModelName: '豆包Lite 32K',
      weight: 80,
      isEnabled: true
    },
    {
      id: 4,
      ruleName: '负载均衡路由',
      ruleType: 'load_balance',
      priority: 30,
      targetModelId: 8,
      targetModelName: '通义千问-Turbo',
      weight: 50,
      isEnabled: false
    }
  ];
}

/**
 * 获取Mock降级策略数据
 */
export function getMockFallbackStrategies(): FallbackStrategy[] {
  return [
    {
      id: 1,
      strategyName: '豆包Pro降级策略',
      primaryModelId: 1,
      primaryModelName: '豆包Pro 32K',
      fallbackModelIds: [3, 6],
      fallbackModelNames: ['豆包Lite 32K', 'Claude 3 Sonnet'],
      maxRetries: 3,
      retryDelayMs: 1000,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 5,
      isEnabled: true
    },
    {
      id: 2,
      strategyName: 'GPT-4降级策略',
      primaryModelId: 4,
      primaryModelName: 'GPT-4',
      fallbackModelIds: [7, 5],
      fallbackModelNames: ['Claude 3 Opus', 'GPT-3.5 Turbo'],
      maxRetries: 3,
      retryDelayMs: 1000,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 5,
      isEnabled: true
    },
    {
      id: 3,
      strategyName: '国内模型降级策略',
      primaryModelId: 8,
      primaryModelName: '通义千问-Turbo',
      fallbackModelIds: [9, 1],
      fallbackModelNames: ['文心一言4.0', '豆包Pro 32K'],
      maxRetries: 2,
      retryDelayMs: 500,
      circuitBreakerEnabled: true,
      circuitBreakerThreshold: 3,
      isEnabled: true
    }
  ];
}

/**
 * 获取Mock成本统计数据
 */
export function getMockCostStatistics(): CostStatistics {
  return {
    totalCalls: 15680,
    totalCost: 3520.50,
    avgResponseTime: 850,
    successRate: 99.5,
    byProvider: [
      { providerId: 1, providerName: '豆包 (火山引擎)', cost: 1760.25, percent: 50 },
      { providerId: 2, providerName: 'OpenAI', cost: 880.15, percent: 25 },
      { providerId: 3, providerName: 'Anthropic', cost: 528.08, percent: 15 },
      { providerId: 4, providerName: '阿里云通义', cost: 352.02, percent: 10 }
    ]
  };
}

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