import { api } from '@/lib/api-client';

// 文档类型
export interface Document {
  id: string;
  title: string;
  type: 'markdown' | 'pdf' | 'word' | 'excel' | 'ppt' | 'image' | 'folder' | 'other';
  size?: number;
  parentId: string | null;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  starred: boolean;
  tags: string[];
  permission: 'private' | 'team' | 'public';
  collaborators?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'editor' | 'viewer';
  }>;
  version?: number;
  comments?: number;
}

// 文档列表响应
export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

// 面包屑路径
export interface BreadcrumbItem {
  id: string;
  title: string;
}

// 文档服务
export const documentService = {
  // 获取文档列表
  async getDocuments(params?: {
    folderId?: string | null;
    search?: string;
    tab?: string;
  }): Promise<Document[]> {
    const response = await api.get<Document[]>('/api/v1/documents', { params });
    return response.data || [];
  },

  // 获取文档详情
  async getDocument(id: string): Promise<Document | null> {
    const response = await api.get<Document>(`/api/v1/documents/${id}`);
    return response.data || null;
  },

  // 获取面包屑路径
  async getBreadcrumbPath(folderId: string): Promise<BreadcrumbItem[]> {
    const response = await api.get<BreadcrumbItem[]>(`/api/v1/documents/${folderId}/path`);
    return response.data || [];
  },

  // 创建文档/文件夹
  async create(data: {
    title: string;
    type: string;
    parentId?: string | null;
    template?: string;
    permission?: string;
  }): Promise<Document> {
    const response = await api.post<Document>('/api/v1/documents', data);
    return response.data;
  },

  // 上传文档
  async upload(formData: FormData): Promise<Document[]> {
    const response = await api.post<Document[]>('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data || [];
  },

  // 更新文档
  async update(id: string, data: Partial<Document>): Promise<Document> {
    const response = await api.put<Document>(`/api/v1/documents/${id}`, data);
    return response.data;
  },

  // 删除文档
  async delete(id: string): Promise<void> {
    await api.delete(`/api/v1/documents/${id}`);
  },

  // 切换收藏
  async toggleStar(id: string): Promise<{ starred: boolean }> {
    const response = await api.post<{ starred: boolean }>(`/api/v1/documents/${id}/star`);
    return response.data || { starred: false };
  },

  // 分享文档
  async share(id: string, data: {
    permission: string;
    collaborators?: string[];
  }): Promise<void> {
    await api.post(`/api/v1/documents/${id}/share`, data);
  },

  // 获取文档版本历史
  async getVersions(id: string): Promise<any[]> {
    const response = await api.get<any[]>(`/api/v1/documents/${id}/versions`);
    return response.data || [];
  },
};