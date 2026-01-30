/**
 * AI服务类型定义
 */

// AI消息角色
export enum AIMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

// AI消息类型
export interface AIMessage {
  id?: string
  role: AIMessageRole
  content: string
  timestamp?: number
  metadata?: Record<string, any>
}

// AI对话会话
export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: number
  updatedAt: number
  projectId?: string
  taskId?: string
}

// AI流式响应事件
export interface AIStreamEvent {
  type: 'start' | 'chunk' | 'end' | 'error'
  content?: string
  error?: string
  metadata?: Record<string, any>
}

// AI请求配置
export interface AIRequestConfig {
  conversationId?: string
  projectId?: string
  taskId?: string
  stream?: boolean
  temperature?: number
  maxTokens?: number
  context?: Record<string, any>
}

// AI功能类型
export enum AIFeatureType {
  CHAT = 'chat',                           // 智能对话
  PROJECT_ANALYSIS = 'project_analysis',   // 项目分析
  TASK_SUGGEST = 'task_suggest',           // 任务建议
  PROGRESS_PREDICT = 'progress_predict',   // 进度预测
  RISK_ASSESS = 'risk_assess',             // 风险评估
  RESOURCE_OPTIMIZE = 'resource_optimize', // 资源优化
  DOCUMENT_GENERATE = 'document_generate'  // 文档生成
}

// AI项目分析结果
export interface AIProjectAnalysis {
  projectId: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  suggestions: string[]
  riskLevel: 'low' | 'medium' | 'high'
  completionPrediction: {
    estimatedDate: string
    confidence: number
  }
}

// AI任务建议
export interface AITaskSuggestion {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedHours: number
  assigneeRecommendations: Array<{
    userId: string
    userName: string
    score: number
    reason: string
  }>
  dependencies: string[]
}

// AI进度预测
export interface AIProgressPrediction {
  projectId: string
  currentProgress: number
  predictedProgress: number
  estimatedCompletionDate: string
  confidence: number
  factors: Array<{
    name: string
    impact: number
    description: string
  }>
  recommendations: string[]
}

// AI风险评估
export interface AIRiskAssessment {
  projectId: string
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  risks: Array<{
    id: string
    category: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    probability: number
    impact: number
    mitigation: string
  }>
  recommendations: string[]
}

// AI方案生成请求
export interface AISolutionRequest {
  projectId?: string
  title: string
  description: string
  requirements?: string[]
  constraints?: string[]
  context?: Record<string, any>
}

// AI方案生成结果
export interface AISolution {
  id: string
  title: string
  summary: string
  sections: AISolutionSection[]
  timeline?: AISolutionTimeline
  resources?: AISolutionResource[]
  risks?: AISolutionRisk[]
  createdAt: number
}

// 方案章节
export interface AISolutionSection {
  id: string
  title: string
  content: string
  order: number
  subsections?: AISolutionSection[]
}

// 方案时间线
export interface AISolutionTimeline {
  phases: Array<{
    name: string
    duration: string
    tasks: string[]
    milestones: string[]
  }>
  totalDuration: string
}

// 方案资源
export interface AISolutionResource {
  type: 'human' | 'equipment' | 'budget' | 'other'
  name: string
  quantity: string
  description?: string
}

// 方案风险
export interface AISolutionRisk {
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
}

// AI响应基础类型
export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  requestId?: string
}

// SSE连接状态
export enum SSEConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// SSE事件回调
export interface SSEEventCallbacks {
  onOpen?: () => void
  onMessage?: (event: AIStreamEvent) => void
  onError?: (error: Error) => void
  onClose?: () => void
}