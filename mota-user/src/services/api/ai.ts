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