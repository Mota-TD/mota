/**
 * 豆包 API 配置和初始化
 * 火山引擎豆包大模型配置
 */

import { initializeDoubaoClient } from '@/services/doubao/doubaoClient'

// 豆包 API 配置
export const DOUBAO_CONFIG = {
  // 从环境变量获取API Key
  apiKey: import.meta.env.VITE_DOUBAO_API_KEY,
  // API端点 - 火山引擎豆包API
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  // 默认模型 - 豆包Pro 32K
  model: import.meta.env.VITE_DOUBAO_MODEL || 'doubao-pro-32k',
  // 最大token数
  maxTokens: parseInt(import.meta.env.VITE_DOUBAO_MAX_TOKENS || '4096'),
  // 温度
  temperature: parseFloat(import.meta.env.VITE_DOUBAO_TEMPERATURE || '0.7')
}

// 可用的豆包模型列表
export const DOUBAO_MODELS = [
  {
    id: 'doubao-pro-32k',
    name: '豆包Pro 32K',
    description: '高性能通用模型，支持32K上下文',
    maxTokens: 32768,
    recommended: true
  },
  {
    id: 'doubao-pro-128k',
    name: '豆包Pro 128K',
    description: '超长上下文模型，支持128K上下文',
    maxTokens: 131072,
    recommended: false
  },
  {
    id: 'doubao-lite-32k',
    name: '豆包Lite 32K',
    description: '轻量级模型，响应更快',
    maxTokens: 32768,
    recommended: false
  },
  {
    id: 'doubao-lite-128k',
    name: '豆包Lite 128K',
    description: '轻量级长上下文模型',
    maxTokens: 131072,
    recommended: false
  }
]

/**
 * 初始化豆包 API
 */
export function initDoubaoAPI(): void {
  const apiKey = DOUBAO_CONFIG.apiKey
  
  if (apiKey) {
    initializeDoubaoClient(apiKey)
    console.log('豆包 API已初始化')
  } else {
    console.warn('未找到豆包 API Key，AI功能将使用模拟数据')
    console.warn('请在环境变量中设置 VITE_DOUBAO_API_KEY')
  }
}

/**
 * 检查豆包 API是否可用
 */
export function isDoubaoAPIAvailable(): boolean {
  return Boolean(DOUBAO_CONFIG.apiKey)
}

/**
 * 获取豆包配置
 */
export function getDoubaoConfig() {
  return {
    ...DOUBAO_CONFIG,
    apiKey: DOUBAO_CONFIG.apiKey ? '***' : undefined // 隐藏API Key
  }
}

/**
 * 获取推荐的模型
 */
export function getRecommendedModel() {
  return DOUBAO_MODELS.find(m => m.recommended) || DOUBAO_MODELS[0]
}

/**
 * 根据ID获取模型信息
 */
export function getModelById(modelId: string) {
  return DOUBAO_MODELS.find(m => m.id === modelId)
}