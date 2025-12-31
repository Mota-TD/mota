/**
 * 统一AI客户端管理器
 * 支持在不同AI模型提供商之间切换
 */

import { doubaoClient, initializeDoubaoClient, DoubaoClient } from '../doubao/doubaoClient'
import { claudeClient, initializeClaudeClient, ClaudeClient } from '../claude/claudeClient'

// AI提供商类型
export type AIProvider = 'doubao' | 'claude'

// AI客户端接口
export interface AIClientInterface {
  sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    options?: {
      model?: string
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string>

  generateTaskDecomposition(params: {
    projectName: string
    projectDescription: string
    departments: string[]
    startDate?: string
    endDate?: string
  }): Promise<{
    suggestions: Array<{
      id: string
      name: string
      description: string
      suggestedDepartment?: string
      suggestedPriority: string
      estimatedDays: number
      dependencies?: string[]
    }>
    totalEstimatedDays: number
    riskAssessment: string
  }>

  suggestTaskAssignment(params: {
    taskId: number
    taskName: string
    taskDescription: string
    teamMembers: Array<{
      id: string
      name: string
      department: string
      currentWorkload: number
      skills: string[]
    }>
  }): Promise<{
    suggestedAssignees: Array<{
      userId: number
      userName: string
      matchScore: number
      currentWorkload: number
      reason: string
    }>
  }>

  generateRiskWarnings(params: {
    projectId: string | number
    projectName: string
    departmentTasks: Array<{
      name: string
      status: string
      progress: number
      endDate?: string
    }>
    tasks: Array<{
      name: string
      status: string
      progress: number
      endDate?: string
    }>
  }): Promise<Array<{
    id: string
    type: 'delay' | 'resource' | 'dependency' | 'quality'
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    affectedTasks: string[]
    suggestions: string[]
    createdAt: string
  }>>

  checkConnection(): Promise<boolean>
}

// AI客户端管理器配置
interface AIClientManagerConfig {
  defaultProvider: AIProvider
  doubaoApiKey?: string
  claudeApiKey?: string
}

/**
 * AI客户端管理器类
 */
class AIClientManager {
  private currentProvider: AIProvider
  private doubaoClient: DoubaoClient
  private claudeClient: ClaudeClient
  private initialized: boolean = false

  constructor() {
    this.currentProvider = 'doubao' // 默认使用豆包
    this.doubaoClient = doubaoClient
    this.claudeClient = claudeClient
  }

  /**
   * 初始化AI客户端
   */
  initialize(config?: Partial<AIClientManagerConfig>): void {
    // 从环境变量获取默认提供商
    const defaultProvider = config?.defaultProvider ||
      (import.meta.env.VITE_AI_PROVIDER as AIProvider) ||
      'doubao'
    
    this.currentProvider = defaultProvider

    // 初始化豆包客户端
    const doubaoKey = config?.doubaoApiKey || import.meta.env.VITE_DOUBAO_API_KEY
    const doubaoEndpointId = import.meta.env.VITE_DOUBAO_ENDPOINT_ID
    if (doubaoKey || doubaoEndpointId) {
      initializeDoubaoClient(doubaoKey, doubaoEndpointId)
      console.log('豆包AI客户端已初始化')
    }

    // 初始化Claude客户端
    const claudeKey = config?.claudeApiKey || import.meta.env.VITE_CLAUDE_API_KEY
    if (claudeKey) {
      initializeClaudeClient(claudeKey)
      console.log('Claude AI客户端已初始化')
    }

    this.initialized = true
    console.log(`AI客户端管理器已初始化，当前提供商: ${this.currentProvider}`)
  }

  /**
   * 获取当前AI提供商
   */
  getCurrentProvider(): AIProvider {
    return this.currentProvider
  }

  /**
   * 切换AI提供商
   */
  switchProvider(provider: AIProvider): void {
    this.currentProvider = provider
    console.log(`AI提供商已切换为: ${provider}`)
  }

  /**
   * 获取当前AI客户端
   */
  getClient(): AIClientInterface {
    if (this.currentProvider === 'doubao') {
      return this.doubaoClient as unknown as AIClientInterface
    }
    return this.claudeClient as unknown as AIClientInterface
  }

  /**
   * 发送消息
   */
  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string,
    options?: {
      model?: string
      maxTokens?: number
      temperature?: number
    }
  ): Promise<string> {
    const client = this.getClient()
    try {
      return await client.sendMessage(messages, systemPrompt, options)
    } catch (error) {
      console.error(`${this.currentProvider} API调用失败:`, error)
      
      // 如果当前是豆包，尝试回退到Claude
      if (this.currentProvider === 'doubao') {
        console.log('尝试回退到Claude...')
        try {
          return await this.claudeClient.sendMessage(messages, systemPrompt, options)
        } catch (fallbackError) {
          console.error('Claude回退也失败:', fallbackError)
          throw error
        }
      }
      throw error
    }
  }

  /**
   * AI任务分解
   */
  async generateTaskDecomposition(params: {
    projectName: string
    projectDescription: string
    departments: string[]
    startDate?: string
    endDate?: string
  }) {
    const client = this.getClient()
    try {
      return await client.generateTaskDecomposition(params)
    } catch (error) {
      console.error(`${this.currentProvider} 任务分解失败:`, error)
      
      // 回退逻辑
      if (this.currentProvider === 'doubao') {
        console.log('尝试使用Claude进行任务分解...')
        try {
          return await this.claudeClient.generateTaskDecomposition(params)
        } catch (fallbackError) {
          console.error('Claude回退也失败:', fallbackError)
          throw error
        }
      }
      throw error
    }
  }

  /**
   * AI智能分工推荐
   */
  async suggestTaskAssignment(params: {
    taskId: number
    taskName: string
    taskDescription: string
    teamMembers: Array<{
      id: string
      name: string
      department: string
      currentWorkload: number
      skills: string[]
    }>
  }) {
    const client = this.getClient()
    try {
      return await client.suggestTaskAssignment(params)
    } catch (error) {
      console.error(`${this.currentProvider} 分工推荐失败:`, error)
      
      if (this.currentProvider === 'doubao') {
        console.log('尝试使用Claude进行分工推荐...')
        try {
          return await this.claudeClient.suggestTaskAssignment(params)
        } catch (fallbackError) {
          console.error('Claude回退也失败:', fallbackError)
          throw error
        }
      }
      throw error
    }
  }

  /**
   * AI项目风险预警
   */
  async generateRiskWarnings(params: {
    projectId: string | number
    projectName: string
    departmentTasks: Array<{
      name: string
      status: string
      progress: number
      endDate?: string
    }>
    tasks: Array<{
      name: string
      status: string
      progress: number
      endDate?: string
    }>
  }) {
    const client = this.getClient()
    try {
      return await client.generateRiskWarnings(params)
    } catch (error) {
      console.error(`${this.currentProvider} 风险分析失败:`, error)
      
      if (this.currentProvider === 'doubao') {
        console.log('尝试使用Claude进行风险分析...')
        try {
          return await this.claudeClient.generateRiskWarnings(params)
        } catch (fallbackError) {
          console.error('Claude回退也失败:', fallbackError)
          throw error
        }
      }
      throw error
    }
  }

  /**
   * 检查连接状态
   */
  async checkConnection(): Promise<boolean> {
    const client = this.getClient()
    return await client.checkConnection()
  }

  /**
   * 获取可用的AI提供商列表
   */
  getAvailableProviders(): Array<{
    id: AIProvider
    name: string
    available: boolean
    description: string
  }> {
    return [
      {
        id: 'doubao',
        name: '豆包',
        available: Boolean(import.meta.env.VITE_DOUBAO_API_KEY),
        description: '火山引擎豆包大模型，国内访问速度快'
      },
      {
        id: 'claude',
        name: 'Claude',
        available: Boolean(import.meta.env.VITE_CLAUDE_API_KEY),
        description: 'Anthropic Claude模型，强大的推理能力'
      }
    ]
  }

  /**
   * 获取当前提供商信息
   */
  getCurrentProviderInfo() {
    const providers = this.getAvailableProviders()
    return providers.find(p => p.id === this.currentProvider)
  }
}

// 创建全局AI客户端管理器实例
export const aiClientManager = new AIClientManager()

// 初始化函数
export function initializeAIClient(config?: Partial<AIClientManagerConfig>): void {
  aiClientManager.initialize(config)
}

// 便捷导出
export { doubaoClient, claudeClient }