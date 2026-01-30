/**
 * 文档AI摘要类型定义
 */

// 文档类型
export enum DocumentType {
  PDF = 'pdf',
  WORD = 'word',
  EXCEL = 'excel',
  TEXT = 'text',
  MARKDOWN = 'markdown',
  OTHER = 'other'
}

// 文档状态
export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 文档信息
export interface Document {
  id: string
  name: string
  type: DocumentType
  size: number
  status: DocumentStatus
  url: string
  summary?: string
  keywords?: string[]
  keyPoints?: string[]
  projectId?: string
  uploadedBy: string
  uploadedAt: string
  processedAt?: string
}

// 文档摘要
export interface DocumentSummary {
  documentId: string
  summary: string
  keywords: string[]
  keyPoints: string[]
  entities?: Array<{
    type: string
    value: string
    count: number
  }>
  sentiment?: {
    score: number
    label: 'positive' | 'neutral' | 'negative'
  }
}

// 文档上传请求
export interface DocumentUploadRequest {
  file: File
  projectId?: string
  autoSummarize?: boolean
}

// 文档查询请求
export interface DocumentQueryRequest {
  projectId?: string
  type?: DocumentType
  status?: DocumentStatus
  keyword?: string
  page?: number
  pageSize?: number
}

// 文档列表响应
export interface DocumentListResponse {
  list: Document[]
  total: number
  page: number
  pageSize: number
}

// AI摘要请求
export interface SummarizeRequest {
  documentId: string
  maxLength?: number
  extractKeywords?: boolean
  extractKeyPoints?: boolean
}