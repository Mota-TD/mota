/**
 * AI 相关 API
 */
import { get, post, del } from '../request'

// AI 历史记录类型
export type AIRecordType = 'solution' | 'ppt' | 'marketing' | 'news'

// AI 历史记录状态
export type AIRecordStatus = 'completed' | 'failed' | 'processing'

// AI 历史记录
export interface AIHistoryRecord {
  id: string
  title: string
  type: AIRecordType
  status: AIRecordStatus
  creator: string
  creatorId: number
  content?: string
  createdAt: string
  updatedAt?: string
}

// AI 历史记录列表响应
export interface AIHistoryListResponse {
  list: AIHistoryRecord[]
  total: number
}

// 新闻项
export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  sourceIcon?: string
  publishTime: string
  category: string
  tags: string[]
  url: string
  isStarred?: boolean
  relevance: number
}

// 新闻列表响应
export interface NewsListResponse {
  list: NewsItem[]
  total: number
}

// 方案生成请求
export interface GenerateSolutionRequest {
  solutionType: string
  companyName: string
  businessDesc: string
  requirements: string
  additionalInfo?: string
}

// 生成的方案
export interface GeneratedSolution {
  id: string
  title: string
  content: string
  type: string
  createdAt: string
}

/**
 * 获取 AI 历史记录列表
 */
export function getAIHistory(params?: {
  type?: AIRecordType
  status?: AIRecordStatus
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<AIHistoryListResponse> {
  return get<AIHistoryListResponse>('/api/v1/ai/history', params)
}

/**
 * 获取 AI 历史记录详情
 */
export function getAIHistoryById(id: string): Promise<AIHistoryRecord> {
  return get<AIHistoryRecord>(`/api/v1/ai/history/${id}`)
}

/**
 * 删除 AI 历史记录
 */
export function deleteAIHistory(id: string): Promise<void> {
  return del<void>(`/api/v1/ai/history/${id}`)
}

/**
 * 获取新闻列表
 */
export function getNews(params?: {
  category?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<NewsListResponse> {
  return get<NewsListResponse>('/api/v1/ai/news', params)
}

/**
 * 收藏/取消收藏新闻
 */
export function toggleNewsStar(id: string): Promise<{ isStarred: boolean }> {
  return post<{ isStarred: boolean }>(`/api/v1/ai/news/${id}/star`)
}

/**
 * 刷新新闻
 */
export function refreshNews(): Promise<NewsListResponse> {
  return post<NewsListResponse>('/api/v1/ai/news/refresh')
}

/**
 * 生成方案
 */
export function generateSolution(data: GenerateSolutionRequest): Promise<GeneratedSolution> {
  return post<GeneratedSolution>('/api/v1/ai/solution/generate', data)
}

/**
 * 获取方案类型列表
 */
export function getSolutionTypes(): Promise<Array<{
  value: string
  label: string
  desc: string
  icon: string
}>> {
  return get('/api/v1/ai/solution/types')
}

/**
 * 获取快捷模板
 */
export function getQuickTemplates(): Promise<Array<{
  label: string
  value: string
}>> {
  return get('/api/v1/ai/solution/templates')
}

// ============ PPT 相关 API ============

// PPT 模板
export interface PPTTemplate {
  value: string
  label: string
  color: string
  icon: string
}

// PPT 配色方案
export interface PPTColorScheme {
  value: string
  label: string
  colors: string[]
}

// PPT 生成请求
export interface GeneratePPTRequest {
  title: string
  content: string
  template: string
  colorScheme: string
  slideCount: number
  style: string
}

// PPT 页面
export interface PPTPage {
  id: number
  title: string
  type: string
}

// 生成的 PPT
export interface GeneratedPPT {
  id: string
  title: string
  slides: number
  template: string
  createdAt: string
  pages: PPTPage[]
}

/**
 * 获取 PPT 模板列表
 */
export function getPPTTemplates(): Promise<PPTTemplate[]> {
  return get('/api/v1/ai/ppt/templates')
}

/**
 * 获取 PPT 配色方案
 */
export function getPPTColorSchemes(): Promise<PPTColorScheme[]> {
  return get('/api/v1/ai/ppt/color-schemes')
}

/**
 * 获取 PPT 快捷模板
 */
export function getPPTQuickTemplates(): Promise<Array<{ label: string; value: string }>> {
  return get('/api/v1/ai/ppt/quick-templates')
}

/**
 * 生成 PPT
 */
export function generatePPT(data: GeneratePPTRequest): Promise<GeneratedPPT> {
  return post('/api/v1/ai/ppt/generate', data)
}

/**
 * 下载 PPT
 */
export function downloadPPT(id: string, format: string): Promise<Blob> {
  return get(`/api/v1/ai/ppt/${id}/download?format=${format}`)
}

// ============ 模型训练相关 API ============

// 训练统计
export interface TrainingStats {
  totalDocuments: number
  totalTokens: string
  lastTraining: string
  modelVersion: string
  accuracy: number
}

// 训练历史记录
export interface TrainingHistory {
  id: number
  version: string
  date: string
  documents: number
  status: string
  accuracy: number
}

// 知识库文档
export interface KnowledgeDocument {
  id: number
  name: string
  size: string
  uploadTime: string
  status: 'indexed' | 'pending'
}

/**
 * 获取训练统计
 */
export function getTrainingStats(): Promise<TrainingStats> {
  return get('/api/v1/ai/training/stats')
}

/**
 * 获取训练历史
 */
export function getTrainingHistory(): Promise<TrainingHistory[]> {
  return get('/api/v1/ai/training/history')
}

/**
 * 获取知识库文档列表
 */
export function getKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
  return get('/api/v1/ai/training/documents')
}

/**
 * 上传知识库文档
 */
export function uploadKnowledgeDocument(file: File): Promise<KnowledgeDocument> {
  const formData = new FormData()
  formData.append('file', file)
  return post('/api/v1/ai/training/documents', formData)
}

/**
 * 删除知识库文档
 */
export function deleteKnowledgeDocument(id: number): Promise<void> {
  return del(`/api/v1/ai/training/documents/${id}`)
}

/**
 * 开始训练
 */
export function startTraining(): Promise<{ taskId: string }> {
  return post('/api/v1/ai/training/start')
}

/**
 * 获取训练进度
 */
export function getTrainingProgress(taskId: string): Promise<{ progress: number; status: string }> {
  return get(`/api/v1/ai/training/progress/${taskId}`)
}

/**
 * 保存训练设置
 */
export function saveTrainingSettings(settings: {
  epochs?: number
  learningRate?: string
  batchSize?: number
}): Promise<void> {
  return post('/api/v1/ai/training/settings', settings)
}

/**
 * 保存业务配置
 */
export function saveBusinessConfig(config: {
  companyName?: string
  industry?: string
  businessDesc?: string
}): Promise<void> {
  return post('/api/v1/ai/training/business-config', config)
}

// ============ 项目协同 AI 功能 ============

// AI 任务分解建议
export interface TaskDecompositionSuggestion {
  id: string
  name: string
  description: string
  suggestedDepartment?: string
  suggestedPriority: string
  estimatedDays: number
  dependencies?: string[]
}

// AI 任务分解请求
export interface TaskDecompositionRequest {
  projectName: string
  projectDescription: string
  departments: string[]
  startDate?: string
  endDate?: string
}

// AI 任务分解响应
export interface TaskDecompositionResponse {
  /** 任务分解建议列表 */
  suggestions: TaskDecompositionSuggestion[]
  /** 预估总工期（天） */
  totalEstimatedDays: number
  /** 风险评估 */
  riskAssessment: string
  /** 数据来源：ai（真实AI生成）或 mock（模拟数据） */
  source: 'ai' | 'mock'
  /** 使用的AI模型名称（仅当source为ai时有值） */
  model?: string
  /** 生成时间 */
  generatedAt: string
}

// AI 进度预测
export interface ProgressPrediction {
  projectId: number | string
  currentProgress: number
  predictedProgress: number
  predictedCompletionDate: string
  confidence: number
  factors: string[]
}

// AI 风险预警
export interface RiskWarning {
  id: string
  type: 'delay' | 'resource' | 'dependency' | 'quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedTasks: string[]
  suggestions: string[]
  createdAt: string
}

// AI 项目报告
export interface ProjectReport {
  id: string
  projectId: number | string
  projectName: string
  reportType: 'daily' | 'weekly' | 'monthly'
  summary: string
  highlights: string[]
  issues: string[]
  nextSteps: string[]
  statistics: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    overdueTasks: number
    progressChange: number
  }
  generatedAt: string
}

/**
 * AI 任务分解 - 根据项目描述自动建议任务拆解
 */
export function generateTaskDecomposition(data: TaskDecompositionRequest): Promise<TaskDecompositionResponse> {
  return post<TaskDecompositionResponse>('/api/v1/ai/project/decompose', data)
}

/**
 * AI 进度预测 - 基于历史数据预测项目完成时间
 */
export function predictProjectProgress(projectId: number | string): Promise<ProgressPrediction> {
  return get<ProgressPrediction>(`/api/v1/ai/project/${projectId}/predict`)
}

/**
 * AI 风险预警 - 自动识别可能延期的任务
 */
export function getProjectRiskWarnings(projectId: number | string): Promise<RiskWarning[]> {
  return get<RiskWarning[]>(`/api/v1/ai/project/${projectId}/risks`)
}

/**
 * AI 智能报告 - 自动生成项目进度报告
 */
export function generateProjectReport(projectId: number | string, reportType: 'daily' | 'weekly' | 'monthly'): Promise<ProjectReport> {
  return post<ProjectReport>(`/api/v1/ai/project/${projectId}/report`, { reportType })
}

/**
 * 获取 AI 建议的任务优先级
 */
export function suggestTaskPriority(taskDescription: string, deadline?: string): Promise<{
  suggestedPriority: string
  reason: string
}> {
  return post('/api/v1/ai/project/suggest-priority', { taskDescription, deadline })
}

/**
 * AI 智能分配 - 根据成员能力和工作负载建议任务分配
 */
export function suggestTaskAssignment(taskId: number): Promise<{
  suggestedAssignees: Array<{
    userId: number
    userName: string
    matchScore: number
    currentWorkload: number
    reason: string
  }>
}> {
  return get(`/api/v1/ai/project/task/${taskId}/suggest-assignee`)
}

/**
 * AI 工作计划生成 - 根据部门任务自动生成工作计划建议
 */
export function generateWorkPlanSuggestion(departmentTaskId: number): Promise<{
  summary: string
  milestones: Array<{
    name: string
    targetDate: string
    deliverables: string[]
  }>
  resourceRequirements: string
  risks: string[]
}> {
  return get(`/api/v1/ai/project/department-task/${departmentTaskId}/work-plan-suggestion`)
}