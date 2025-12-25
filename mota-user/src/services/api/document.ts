import request from '../request';

// 文档类型定义
export interface Document {
  id: number;
  title: string;
  content: string;
  contentType: string;
  summary?: string;
  projectId: number;
  folderId?: number;
  creatorId: number;
  status: string;
  isTemplate: boolean;
  visibility: string;
  viewCount: number;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

// 文档收藏类型定义
export interface DocumentFavorite {
  id: number;
  userId: number;
  documentId: number;
  folderName?: string;
  note?: string;
  createdAt: string;
  documentTitle?: string;
  documentSummary?: string;
  documentStatus?: string;
  projectName?: string;
  creatorName?: string;
  documentUpdatedAt?: string;
}

// 文档访问记录类型定义
export interface DocumentAccessLog {
  id: number;
  userId: number;
  documentId: number;
  accessType: string;
  accessCount: number;
  firstAccessAt: string;
  lastAccessAt: string;
  documentTitle?: string;
  documentSummary?: string;
  documentStatus?: string;
  projectName?: string;
  creatorName?: string;
}

// 收藏夹分类
export interface FavoriteFolder {
  folderName: string;
  count: number;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  title: string;
  content: string;
  changeSummary?: string;
  editorId: number;
  versionType: string;
  diffContent?: string;
  contentHash?: string;
  createdAt: string;
}

export interface DocumentCollaborator {
  id: number;
  documentId: number;
  userId: number;
  permission: string;
  isOnline: boolean;
  lastActiveAt?: string;
  cursorPosition?: string;
  createdAt: string;
}

export interface DocumentComment {
  id: number;
  documentId: number;
  userId: number;
  content: string;
  position?: string;
  parentId?: number;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== 文档CRUD ==========

export const createDocument = (document: Partial<Document>) => {
  return request.post<Document>('/api/documents', document);
};

export const updateDocument = (id: number, document: Partial<Document>) => {
  return request.put<Document>(`/api/documents/${id}`, document);
};

export const deleteDocument = (id: number) => {
  return request.del<boolean>(`/api/documents/${id}`);
};

export const getDocument = (id: number) => {
  return request.get<Document>(`/api/documents/${id}`);
};

export const getDocumentsByProject = (projectId: number, page = 1, pageSize = 20) => {
  return request.get<Document[]>(`/api/documents/project/${projectId}?page=${page}&pageSize=${pageSize}`);
};

export const getDocumentsByFolder = (folderId: number) => {
  return request.get<Document[]>(`/api/documents/folder/${folderId}`);
};

export const searchDocuments = (keyword: string, projectId?: number, page = 1, pageSize = 20) => {
  let url = `/api/documents/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`;
  if (projectId) {
    url += `&projectId=${projectId}`;
  }
  return request.get<Document[]>(url);
};

export const getRecentDocuments = (userId: number, limit = 10) => {
  return request.get<Document[]>(`/api/documents/recent?userId=${userId}&limit=${limit}`);
};

// ========== 版本管理 ==========

export const createVersion = (documentId: number, version: Partial<DocumentVersion>) => {
  return request.post<DocumentVersion>(`/api/documents/${documentId}/versions`, version);
};

export const getVersionHistory = (documentId: number, page = 1, pageSize = 20) => {
  return request.get<DocumentVersion[]>(`/api/documents/${documentId}/versions?page=${page}&pageSize=${pageSize}`);
};

export const getVersion = (documentId: number, versionNumber: number) => {
  return request.get<DocumentVersion>(`/api/documents/${documentId}/versions/${versionNumber}`);
};

export const rollbackToVersion = (documentId: number, versionNumber: number) => {
  return request.post<Document>(`/api/documents/${documentId}/rollback/${versionNumber}`);
};

export const compareVersions = (documentId: number, fromVersion: number, toVersion: number) => {
  return request.get<string>(`/api/documents/${documentId}/versions/compare?fromVersion=${fromVersion}&toVersion=${toVersion}`);
};

// ========== 协作功能 ==========

export const getCollaborators = (documentId: number) => {
  return request.get<DocumentCollaborator[]>(`/api/documents/${documentId}/collaborators`);
};

export const addCollaborator = (documentId: number, userId: number, permission: string) => {
  return request.post<DocumentCollaborator>(`/api/documents/${documentId}/collaborators?userId=${userId}&permission=${permission}`);
};

export const removeCollaborator = (documentId: number, userId: number) => {
  return request.del<boolean>(`/api/documents/${documentId}/collaborators/${userId}`);
};

export const updateCollaboratorPermission = (documentId: number, userId: number, permission: string) => {
  return request.put<DocumentCollaborator>(`/api/documents/${documentId}/collaborators/${userId}/permission?permission=${permission}`);
};

export const getOnlineCollaborators = (documentId: number) => {
  return request.get<DocumentCollaborator[]>(`/api/documents/${documentId}/collaborators/online`);
};

export const updateCollaboratorCursor = (documentId: number, userId: number, cursorPosition: string) => {
  return request.put<void>(`/api/documents/${documentId}/collaborators/${userId}/cursor?cursorPosition=${encodeURIComponent(cursorPosition)}`);
};

// ========== 评论功能 ==========

export const getComments = (documentId: number) => {
  return request.get<DocumentComment[]>(`/api/documents/${documentId}/comments`);
};

export const addComment = (documentId: number, userId: number, content: string, position?: string) => {
  let url = `/api/documents/${documentId}/comments?userId=${userId}&content=${encodeURIComponent(content)}`;
  if (position) {
    url += `&position=${encodeURIComponent(position)}`;
  }
  return request.post<DocumentComment>(url);
};

export const deleteComment = (commentId: number) => {
  return request.del<boolean>(`/api/documents/comments/${commentId}`);
};

export const replyComment = (commentId: number, userId: number, content: string) => {
  return request.post<DocumentComment>(`/api/documents/comments/${commentId}/reply?userId=${userId}&content=${encodeURIComponent(content)}`);
};

export const resolveComment = (commentId: number) => {
  return request.post<boolean>(`/api/documents/comments/${commentId}/resolve`);
};

// ========== 模板功能 ==========

export const getTemplates = (projectId?: number) => {
  let url = '/api/documents/templates';
  if (projectId) {
    url += `?projectId=${projectId}`;
  }
  return request.get<Document[]>(url);
};

export const createFromTemplate = (templateId: number, projectId: number, creatorId: number) => {
  return request.post<Document>(`/api/documents/from-template/${templateId}?projectId=${projectId}&creatorId=${creatorId}`);
};

export const saveAsTemplate = (documentId: number) => {
  return request.post<Document>(`/api/documents/${documentId}/save-as-template`);
};

// ========== 导出功能 ==========

export const exportToPdf = (documentId: number) => {
  return request.get<Blob>(`/api/documents/${documentId}/export/pdf`, { responseType: 'blob' });
};

export const exportToWord = (documentId: number) => {
  return request.get<Blob>(`/api/documents/${documentId}/export/word`, { responseType: 'blob' });
};

export const exportToMarkdown = (documentId: number) => {
  return request.get<string>(`/api/documents/${documentId}/export/markdown`);
};

export const exportToHtml = (documentId: number) => {
  return request.get<string>(`/api/documents/${documentId}/export/html`);
};

// ========== 权限管理 ==========

export const hasPermission = (documentId: number, userId: number, permission: string) => {
  return request.get<boolean>(`/api/documents/${documentId}/permission?userId=${userId}&permission=${permission}`);
};

export const setVisibility = (documentId: number, visibility: string) => {
  return request.put<void>(`/api/documents/${documentId}/visibility?visibility=${visibility}`);
};

// ========== 统计功能 ==========

export const getDocumentStats = (documentId: number) => {
  return request.get<Record<string, unknown>>(`/api/documents/${documentId}/stats`);
};

export const getProjectDocumentStats = (projectId: number) => {
  return request.get<Record<string, unknown>>(`/api/documents/project/${projectId}/stats`);
};

// ========== 收藏夹功能 ==========

export const addFavorite = (documentId: number, userId: number, folderName?: string, note?: string) => {
  let url = `/api/documents/${documentId}/favorite?userId=${userId}`;
  if (folderName) {
    url += `&folderName=${encodeURIComponent(folderName)}`;
  }
  if (note) {
    url += `&note=${encodeURIComponent(note)}`;
  }
  return request.post<DocumentFavorite>(url);
};

export const removeFavorite = (documentId: number, userId: number) => {
  return request.del<boolean>(`/api/documents/${documentId}/favorite?userId=${userId}`);
};

export const isFavorited = (documentId: number, userId: number) => {
  return request.get<boolean>(`/api/documents/${documentId}/favorite/check?userId=${userId}`);
};

export const getUserFavorites = (userId: number, page = 1, pageSize = 20) => {
  return request.get<DocumentFavorite[]>(`/api/documents/favorites?userId=${userId}&page=${page}&pageSize=${pageSize}`);
};

export const getUserFavoritesByFolder = (userId: number, folderName: string) => {
  return request.get<DocumentFavorite[]>(`/api/documents/favorites/folder?userId=${userId}&folderName=${encodeURIComponent(folderName)}`);
};

export const getUserFavoriteFolders = (userId: number) => {
  return request.get<FavoriteFolder[]>(`/api/documents/favorites/folders?userId=${userId}`);
};

export const updateFavoriteFolder = (documentId: number, userId: number, folderName: string) => {
  return request.put<boolean>(`/api/documents/${documentId}/favorite/folder?userId=${userId}&folderName=${encodeURIComponent(folderName)}`);
};

export const batchRemoveFavorites = (userId: number, documentIds: number[]) => {
  return request.post<boolean>(`/api/documents/favorites/batch/delete?userId=${userId}`, documentIds);
};

// ========== 最近访问功能 ==========

export const recordAccess = (documentId: number, userId: number, accessType = 'view') => {
  return request.post<void>(`/api/documents/${documentId}/access?userId=${userId}&accessType=${accessType}`);
};

export const getRecentAccessDocuments = (userId: number, limit = 10) => {
  return request.get<DocumentAccessLog[]>(`/api/documents/recent?userId=${userId}&limit=${limit}`);
};

export const clearAccessHistory = (userId: number) => {
  return request.del<boolean>(`/api/documents/recent/clear?userId=${userId}`);
};

// ========== 导出功能（增强版） ==========

export const downloadDocument = async (documentId: number, format: 'pdf' | 'word' | 'markdown' | 'html', filename?: string) => {
  const response = await request.get<Blob>(`/api/documents/${documentId}/export/${format}`, {
    responseType: 'blob'
  });
  
  // 创建下载链接
  const blob = new Blob([response], {
    type: format === 'pdf' ? 'application/pdf' :
          format === 'word' ? 'application/msword' :
          format === 'markdown' ? 'text/markdown' : 'text/html'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const extension = format === 'word' ? 'doc' : format;
  link.download = filename ? `${filename}.${extension}` : `document.${extension}`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};