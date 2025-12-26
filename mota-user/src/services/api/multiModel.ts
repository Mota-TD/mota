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