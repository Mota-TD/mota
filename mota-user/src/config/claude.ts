/**
 * Claude API 配置和初始化
 */

import { initializeClaudeClient } from '@/services/claude/claudeClient'

// Claude API 配置
export const CLAUDE_CONFIG = {
  // 从环境变量获取API Key
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  // API端点
  baseURL: 'https://api.anthropic.com/v1/messages',
  // 默认模型
  model: 'claude-3-sonnet-20240229',
  // 最大token数
  maxTokens: 4096,
  // 温度
  temperature: 0.7
}

/**
 * 初始化Claude API
 */
export function initClaudeAPI(): void {
  const apiKey = CLAUDE_CONFIG.apiKey
  
  if (apiKey) {
    initializeClaudeClient(apiKey)
    console.log('Claude API已初始化')
  } else {
    console.warn('未找到Claude API Key，AI功能将使用模拟数据')
    console.warn('请在环境变量中设置 VITE_CLAUDE_API_KEY')
  }
}

/**
 * 检查Claude API是否可用
 */
export function isClaudeAPIAvailable(): boolean {
  return Boolean(CLAUDE_CONFIG.apiKey)
}

/**
 * 获取Claude配置
 */
export function getClaudeConfig() {
  return {
    ...CLAUDE_CONFIG,
    apiKey: CLAUDE_CONFIG.apiKey ? '***' : undefined // 隐藏API Key
  }
}