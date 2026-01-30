/**
 * AI服务核心实现
 */

import { get, post, del } from '../http/request'
import type {
  AIMessage,
  AIConversation,
  AIRequestConfig,
  AIResponse,
  AIProjectAnalysis,
  AITaskSuggestion,
  AIProgressPrediction,
  AIRiskAssessment,
  AIFeatureType
} from './types'

class AIService {
  private baseUrl = '/api/ai'

  /**
   * 发送AI对话消息（非流式）
   */
  async sendMessage(
    message: string,
    config?: AIRequestConfig
  ): Promise<AIResponse<AIMessage>> {
    return post(`${this.baseUrl}/chat`, {
      message,
      conversationId: config?.conversationId,
      projectId: config?.projectId,
      taskId: config?.taskId,
      context: config?.context
    })
  }

  /**
   * 获取对话历史
   */
  async getConversation(conversationId: string): Promise<AIResponse<AIConversation>> {
    return get(`${this.baseUrl}/conversations/${conversationId}`)
  }

  /**
   * 获取对话列表
   */
  async getConversations(params?: {
    projectId?: string
    page?: number
    pageSize?: number
  }): Promise<AIResponse<{ list: AIConversation[]; total: number }>> {
    return get(`${this.baseUrl}/conversations`, params)
  }

  /**
   * 创建新对话
   */
  async createConversation(params: {
    title?: string
    projectId?: string
    taskId?: string
  }): Promise<AIResponse<AIConversation>> {
    return post(`${this.baseUrl}/conversations`, params)
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string): Promise<AIResponse<void>> {
    return del(`${this.baseUrl}/conversations/${conversationId}`)
  }

  /**
   * 项目分析
   */
  async analyzeProject(projectId: string): Promise<AIResponse<AIProjectAnalysis>> {
    return post(`${this.baseUrl}/analyze/project`, { projectId })
  }

  /**
   * 任务建议
   */
  async suggestTasks(params: {
    projectId: string
    context?: string
  }): Promise<AIResponse<AITaskSuggestion[]>> {
    return post(`${this.baseUrl}/suggest/tasks`, params)
  }

  /**
   * 进度预测
   */
  async predictProgress(projectId: string): Promise<AIResponse<AIProgressPrediction>> {
    return post(`${this.baseUrl}/predict/progress`, { projectId })
  }

  /**
   * 风险评估
   */
  async assessRisk(projectId: string): Promise<AIResponse<AIRiskAssessment>> {
    return post(`${this.baseUrl}/assess/risk`, { projectId })
  }

  /**
   * 智能分配任务
   */
  async assignTask(params: {
    taskId: string
    projectId: string
  }): Promise<AIResponse<{ userId: string; userName: string; reason: string }>> {
    return post(`${this.baseUrl}/assign/task`, params)
  }

  /**
   * 生成项目文档
   */
  async generateDocument(params: {
    projectId: string
    type: 'summary' | 'report' | 'plan'
    template?: string
  }): Promise<AIResponse<{ content: string; title: string }>> {
    return post(`${this.baseUrl}/generate/document`, params)
  }

  /**
   * 获取AI功能状态
   */
  async getFeatureStatus(feature: AIFeatureType): Promise<AIResponse<{
    enabled: boolean
    quota: number
    used: number
  }>> {
    return get(`${this.baseUrl}/features/${feature}/status`)
  }

  /**
   * 智能搜索
   */
  async smartSearch(params: {
    query: string
    scope?: 'project' | 'task' | 'document' | 'all'
    projectId?: string
  }): Promise<AIResponse<any[]>> {
    return post(`${this.baseUrl}/search`, params)
  }

  /**
   * 获取AI建议
   */
  async getSuggestions(params: {
    context: string
    type: 'task' | 'project' | 'workflow'
  }): Promise<AIResponse<string[]>> {
    return post(`${this.baseUrl}/suggestions`, params)
  }

  /**
   * 生成项目方案
   */
  async generateSolution(request: import('./types').AISolutionRequest): Promise<AIResponse<import('./types').AISolution>> {
    return post(`${this.baseUrl}/solution/generate`, request)
  }

  /**
   * 获取方案列表
   */
  async getSolutions(params?: {
    projectId?: string
    page?: number
    pageSize?: number
  }): Promise<AIResponse<{ list: import('./types').AISolution[]; total: number }>> {
    return get(`${this.baseUrl}/solutions`, params)
  }

  /**
   * 获取方案详情
   */
  async getSolution(solutionId: string): Promise<AIResponse<import('./types').AISolution>> {
    return get(`${this.baseUrl}/solutions/${solutionId}`)
  }

  /**
   * 删除方案
   */
  async deleteSolution(solutionId: string): Promise<AIResponse<void>> {
    return del(`${this.baseUrl}/solutions/${solutionId}`)
  }

  /**
   * 导出方案
   */
  async exportSolution(solutionId: string, format: 'pdf' | 'word' | 'markdown'): Promise<AIResponse<{ url: string }>> {
    return post(`${this.baseUrl}/solutions/${solutionId}/export`, { format })
  }
}

export const aiService = new AIService()
export default aiService