/**
 * AI知识库 API
 * 对应功能: AI-001到AI-010
 */
import { get, post, del } from '../request'

// ==================== 类型定义 ====================

// 知识文档
export interface AIKnowledgeDocument {
  id: number
  title: string
  originalFilename: string
  filePath: string
  fileType: string
  fileSize: number
  mimeType: string
  contentText?: string
  contentHtml?: string
  parseStatus: 'pending' | 'parsing' | 'completed' | 'failed'
  parseError?: string
  parsedAt?: string
  pageCount?: number
  wordCount?: number
  charCount?: number
  language: string
  categoryId?: number
  folderId?: number
  teamId?: number
  creatorId: number
  createdAt: string
  updatedAt: string
}

// 文档列表响应
export interface DocumentListResponse {
  records: AIKnowledgeDocument[]
  total: number
  size: number
  current: number
  pages: number
}

// OCR记录
export interface AIOcrRecord {
  id: number
  documentId?: number
  imagePath: string
  imageType: string
  imageWidth?: number
  imageHeight?: number
  ocrEngine: string
  ocrLanguage: string
  recognizedText?: string
  confidence?: number
  textRegions?: string
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'
  ocrError?: string
  processingTime?: number
  creatorId: number
  createdAt: string
}

// 语音转文字结果
export interface SpeechToTextResult {
  audioPath: string
  status: string
  message: string
  transcribedText?: string
  segments?: Array<{
    start: number
    end: number
    text: string
  }>
}

// 表格提取结果
export interface TableExtractionResult {
  tableIndex: number
  pageNumber: number
  rowCount: number
  columnCount: number
  headers: string[]
  data: string[][]
  confidence: number
}

// 关键信息提取结果
export interface KeyInfoExtractionResult {
  entities: Array<{
    type: string
    text: string
    confidence: number
  }>
  relations: Array<{
    type: string
    subject: string
    object: string
    confidence: number
  }>
  events: Array<{
    type: string
    trigger: string
    time?: string
    location?: string
  }>
}

// 摘要结果
export interface SummaryResult {
  summary: string
  summaryType: string
  summaryLength: string
  keyPoints: string[]
  keywords: string[]
  wordCount: number
  compressionRatio: number
}

// 分类结果
export interface ClassificationResult {
  documentId: number
  categories: Array<{
    categoryId: number
    categoryName: string
    confidence: number
    isPrimary: boolean
  }>
}

// 标签结果
export interface TagResult {
  documentId: number
  tags: Array<{
    name: string
    type: string
    confidence: number
  }>
}

// 语义检索结果
export interface SemanticSearchResult {
  results: Array<{
    documentId: number
    title: string
    content: string
    score: number
    fileType: string
  }>
  total: number
  query: string
  searchTime: number
  searchType: string
}

// 知识库统计
export interface KnowledgeBaseStats {
  totalDocuments: number
  parsedDocuments: number
  vectorizedDocuments: number
  totalVectors: number
  totalTokens: string
  storageUsed: string
  lastUpdated: string
}

// ==================== AI-001 文档解析 ====================

/**
 * 上传文档
 */
export function uploadDocument(file: File, teamId?: number): Promise<AIKnowledgeDocument> {
  const formData = new FormData()
  formData.append('file', file)
  if (teamId) {
    formData.append('teamId', teamId.toString())
  }
  formData.append('creatorId', '1') // TODO: 从用户状态获取
  return post<AIKnowledgeDocument>('/api/v1/ai/knowledge/documents/upload', formData)
}

/**
 * 批量上传文档
 */
export async function uploadDocuments(files: File[], teamId?: number): Promise<AIKnowledgeDocument[]> {
  const results: AIKnowledgeDocument[] = []
  for (const file of files) {
    const doc = await uploadDocument(file, teamId)
    results.push(doc)
  }
  return results
}

/**
 * 获取文档列表
 */
export function getDocumentList(params?: {
  page?: number
  size?: number
  teamId?: number
  categoryId?: number
  fileType?: string
  parseStatus?: string
  keyword?: string
}): Promise<DocumentListResponse> {
  return get<DocumentListResponse>('/api/v1/ai/knowledge/documents', params)
}

/**
 * 获取文档详情
 */
export function getDocumentById(id: number): Promise<AIKnowledgeDocument> {
  return get<AIKnowledgeDocument>(`/api/v1/ai/knowledge/documents/${id}`)
}

/**
 * 删除文档
 */
export function deleteDocument(id: number): Promise<void> {
  return del<void>(`/api/v1/ai/knowledge/documents/${id}`)
}

/**
 * 重新解析文档
 */
export function reparseDocument(id: number): Promise<void> {
  return post<void>(`/api/v1/ai/knowledge/documents/${id}/reparse`)
}

// ==================== AI-002 OCR识别 ====================

/**
 * OCR识别图片
 */
export function recognizeImage(file: File, documentId?: number): Promise<AIOcrRecord> {
  const formData = new FormData()
  formData.append('file', file)
  if (documentId) {
    formData.append('documentId', documentId.toString())
  }
  formData.append('creatorId', '1')
  return post<AIOcrRecord>('/api/v1/ai/knowledge/ocr/recognize', formData)
}

/**
 * 获取OCR记录
 */
export function getOcrRecords(documentId: number): Promise<AIOcrRecord[]> {
  return get<AIOcrRecord[]>('/api/v1/ai/knowledge/ocr/records', { documentId })
}

// ==================== AI-003 语音转文字 ====================

/**
 * 语音转文字
 */
export function transcribeAudio(file: File): Promise<SpeechToTextResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('creatorId', '1')
  return post<SpeechToTextResult>('/api/v1/ai/knowledge/speech/transcribe', formData)
}

// ==================== AI-004 表格提取 ====================

/**
 * 提取表格
 */
export function extractTables(documentId: number): Promise<TableExtractionResult[]> {
  return get<TableExtractionResult[]>(`/api/v1/ai/knowledge/documents/${documentId}/tables`)
}

// ==================== AI-005 关键信息提取 ====================

/**
 * 提取关键信息
 */
export function extractKeyInfo(documentId: number): Promise<KeyInfoExtractionResult> {
  return get<KeyInfoExtractionResult>(`/api/v1/ai/knowledge/documents/${documentId}/key-info`)
}

// ==================== AI-006 自动摘要 ====================

/**
 * 生成摘要
 */
export function generateSummary(
  documentId: number,
  summaryType: 'extractive' | 'abstractive' | 'hybrid' = 'abstractive',
  summaryLength: 'short' | 'medium' | 'long' = 'medium'
): Promise<SummaryResult> {
  return post<SummaryResult>(`/api/v1/ai/knowledge/documents/${documentId}/summary?summaryType=${summaryType}&summaryLength=${summaryLength}`)
}

// ==================== AI-007 主题分类 ====================

/**
 * 自动分类文档
 */
export function classifyDocument(documentId: number): Promise<ClassificationResult> {
  return post<ClassificationResult>(`/api/v1/ai/knowledge/documents/${documentId}/classify`)
}

// ==================== AI-008 自动标签 ====================

/**
 * 生成标签
 */
export function generateTags(documentId: number): Promise<TagResult> {
  return post<TagResult>(`/api/v1/ai/knowledge/documents/${documentId}/tags`)
}

// ==================== AI-009 向量化存储 ====================

/**
 * 向量化文档
 */
export function vectorizeDocument(documentId: number): Promise<{
  documentId: number
  status: string
  message: string
}> {
  return post(`/api/v1/ai/knowledge/documents/${documentId}/vectorize`)
}

// ==================== AI-010 语义检索 ====================

/**
 * 语义检索
 */
export function semanticSearch(params: {
  query: string
  teamId?: number
  topK?: number
  threshold?: number
}): Promise<SemanticSearchResult> {
  return get<SemanticSearchResult>('/api/v1/ai/knowledge/search', params)
}

/**
 * 混合检索
 */
export function hybridSearch(params: {
  query: string
  teamId?: number
  topK?: number
  semanticWeight?: number
  keywordWeight?: number
}): Promise<SemanticSearchResult> {
  return get<SemanticSearchResult>('/api/v1/ai/knowledge/search/hybrid', params)
}

// ==================== 批量操作 ====================

/**
 * 批量解析文档
 */
export function batchParse(documentIds: number[]): Promise<{
  total: number
  success: number
  failed: number
}> {
  return post('/api/v1/ai/knowledge/documents/batch/parse', documentIds)
}

/**
 * 批量向量化文档
 */
export function batchVectorize(documentIds: number[]): Promise<{
  total: number
  success: number
  failed: number
}> {
  return post('/api/v1/ai/knowledge/documents/batch/vectorize', documentIds)
}

/**
 * 批量分类文档
 */
export function batchClassify(documentIds: number[]): Promise<{
  total: number
  classifications: ClassificationResult[]
}> {
  return post('/api/v1/ai/knowledge/documents/batch/classify', documentIds)
}

/**
 * 批量生成标签
 */
export function batchGenerateTags(documentIds: number[]): Promise<{
  total: number
  tagResults: TagResult[]
}> {
  return post('/api/v1/ai/knowledge/documents/batch/tags', documentIds)
}

// ==================== 统计信息 ====================

/**
 * 获取知识库统计信息
 */
export function getKnowledgeBaseStats(teamId?: number): Promise<KnowledgeBaseStats> {
  return get<KnowledgeBaseStats>('/api/v1/ai/knowledge/stats', { teamId })
}