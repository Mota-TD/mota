/**
 * 文档AI摘要服务实现
 */

import { get, post, del } from '../http/request'
import type {
  Document,
  DocumentSummary,
  DocumentQueryRequest,
  DocumentListResponse,
  SummarizeRequest
} from './types'

class DocumentService {
  private baseUrl = '/api/document'

  /**
   * 获取文档列表
   */
  async getDocuments(params?: DocumentQueryRequest): Promise<DocumentListResponse> {
    return get<DocumentListResponse>(`${this.baseUrl}/documents`, params)
  }

  /**
   * 获取文档详情
   */
  async getDocument(documentId: string): Promise<Document> {
    return get<Document>(`${this.baseUrl}/documents/${documentId}`)
  }

  /**
   * 上传文档
   */
  async uploadDocument(file: File, projectId?: string): Promise<Document> {
    // 注意：实际实现需要使用 FormData 和 uni.uploadFile
    const formData = new FormData()
    formData.append('file', file)
    if (projectId) {
      formData.append('projectId', projectId)
    }

    return post<Document>(`${this.baseUrl}/upload`, formData)
  }

  /**
   * 删除文档
   */
  async deleteDocument(documentId: string): Promise<void> {
    return del(`${this.baseUrl}/documents/${documentId}`)
  }

  /**
   * 生成文档摘要
   */
  async summarizeDocument(request: SummarizeRequest): Promise<DocumentSummary> {
    return post<DocumentSummary>(`${this.baseUrl}/summarize`, request)
  }

  /**
   * 获取文档摘要
   */
  async getDocumentSummary(documentId: string): Promise<DocumentSummary> {
    return get<DocumentSummary>(`${this.baseUrl}/documents/${documentId}/summary`)
  }

  /**
   * 提取关键词
   */
  async extractKeywords(documentId: string): Promise<string[]> {
    const response = await post<{ keywords: string[] }>(
      `${this.baseUrl}/documents/${documentId}/keywords`
    )
    return response.keywords
  }

  /**
   * 提取关键信息
   */
  async extractKeyPoints(documentId: string): Promise<string[]> {
    const response = await post<{ keyPoints: string[] }>(
      `${this.baseUrl}/documents/${documentId}/keypoints`
    )
    return response.keyPoints
  }

  /**
   * 搜索文档
   */
  async searchDocuments(keyword: string, projectId?: string): Promise<Document[]> {
    const response = await this.getDocuments({
      keyword,
      projectId,
      pageSize: 50
    })
    return response.list
  }
}

export const documentService = new DocumentService()
export default documentService