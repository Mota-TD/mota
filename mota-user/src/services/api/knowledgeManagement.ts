import request from '../request';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// ========== 类型定义 ==========

// 文件信息
export interface KnowledgeFile {
  id: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  path: string;
  thumbnailPath?: string;
  projectId?: number;
  folderId?: number;
  uploaderId: number;
  uploaderName?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploadProgress?: number;
  tags: string[];
  category?: string;
  aiSuggestedCategory?: string;
  aiSuggestedTags?: string[];
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

// 分片上传初始化请求
export interface ChunkUploadInitRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  chunkSize: number;
  totalChunks: number;
  projectId?: number;
  folderId?: number;
  md5?: string;
}

// 分片上传初始化响应
export interface ChunkUploadInitResponse {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  expiresAt: string;
}

// 分片上传状态
export interface ChunkUploadStatus {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  progress: number;
  status: 'pending' | 'uploading' | 'merging' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// 分片上传完成响应
export interface ChunkUploadCompleteResponse {
  fileId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  thumbnailPath?: string;
}

// 缩略图信息
export interface ThumbnailInfo {
  fileId: number;
  thumbnailPath: string;
  width: number;
  height: number;
  format: string;
  size: number;
  generatedAt: string;
}

// 缩略图生成请求
export interface ThumbnailGenerateRequest {
  fileId: number;
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp';
  quality?: number;
}

// AI分类建议
export interface AICategorySuggestion {
  category: string;
  confidence: number;
  reason: string;
}

// AI标签建议
export interface AITagSuggestion {
  tag: string;
  confidence: number;
  source: 'content' | 'filename' | 'metadata';
}

// AI分类响应
export interface AIClassificationResponse {
  fileId: number;
  fileName: string;
  suggestedCategories: AICategorySuggestion[];
  suggestedTags: AITagSuggestion[];
  contentSummary?: string;
  keyPhrases?: string[];
  language?: string;
  processedAt: string;
}

// 批量AI分类请求
export interface BatchAIClassificationRequest {
  fileIds: number[];
  autoApply?: boolean;
}

// 批量AI分类响应
export interface BatchAIClassificationResponse {
  results: AIClassificationResponse[];
  successCount: number;
  failedCount: number;
  failedFileIds: number[];
}

// 文件分类
export interface FileCategory {
  id: number;
  name: string;
  parentId?: number;
  description?: string;
  icon?: string;
  color?: string;
  fileCount: number;
  children?: FileCategory[];
  createdAt: string;
  updatedAt: string;
}

// 文件标签
export interface FileTag {
  id: number;
  name: string;
  color?: string;
  fileCount: number;
  createdAt: string;
}

// ========== 版本控制类型定义 ==========

// 文件版本
export interface FileVersion {
  id: number;
  fileId: number;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  filePath: string;
  changeSummary?: string;
  changeType: 'create' | 'update' | 'rename' | 'restore';
  creatorId: number;
  creatorName?: string;
  createdAt: string;
  isLatest: boolean;
  contentHash?: string;
}

// 版本对比结果
export interface VersionDiff {
  fromVersion: number;
  toVersion: number;
  additions: number;
  deletions: number;
  modifications: number;
  diffContent?: string;
  diffHtml?: string;
  changes: VersionChange[];
}

// 版本变更详情
export interface VersionChange {
  id: number;
  versionId: number;
  changeType: 'add' | 'delete' | 'modify' | 'rename';
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  lineNumber?: number;
  description: string;
  createdAt: string;
}

// 变更记录
export interface ChangeLog {
  id: number;
  fileId: number;
  versionId: number;
  userId: number;
  userName?: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'rename' | 'move';
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// 自动保存配置
export interface AutoSaveConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxVersions: number;
  keepDays: number;
}

// ========== 大文件分片上传 API ==========

/**
 * 初始化分片上传
 */
export const initChunkUpload = (data: ChunkUploadInitRequest) => {
  return request.post<ChunkUploadInitResponse>('/api/knowledge/upload/init', data);
};

/**
 * 上传单个分片
 */
export const uploadChunk = async (
  uploadId: string,
  chunkIndex: number,
  chunk: Blob,
  _onProgress?: (progress: number) => void
): Promise<{ success: boolean; chunkIndex: number }> => {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('chunkIndex', String(chunkIndex));

  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/knowledge/upload/${uploadId}/chunk`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload chunk failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
};

/**
 * 获取分片上传状态
 */
export const getChunkUploadStatus = (uploadId: string) => {
  return request.get<ChunkUploadStatus>(`/api/knowledge/upload/${uploadId}/status`);
};

/**
 * 完成分片上传（合并分片）
 */
export const completeChunkUpload = (uploadId: string) => {
  return request.post<ChunkUploadCompleteResponse>(`/api/knowledge/upload/${uploadId}/complete`);
};

/**
 * 取消分片上传
 */
export const cancelChunkUpload = (uploadId: string) => {
  return request.del<boolean>(`/api/knowledge/upload/${uploadId}`);
};

/**
 * 检查文件是否已存在（秒传）
 */
export const checkFileExists = (md5: string, fileSize: number) => {
  return request.get<{ exists: boolean; fileId?: number; filePath?: string }>(
    `/api/knowledge/upload/check?md5=${md5}&size=${fileSize}`
  );
};

// ========== 缩略图 API ==========

/**
 * 生成缩略图
 */
export const generateThumbnail = (data: ThumbnailGenerateRequest) => {
  return request.post<ThumbnailInfo>('/api/knowledge/thumbnail/generate', data);
};

/**
 * 批量生成缩略图
 */
export const batchGenerateThumbnails = (fileIds: number[]) => {
  return request.post<{ results: ThumbnailInfo[]; failedIds: number[] }>(
    '/api/knowledge/thumbnail/batch',
    { fileIds }
  );
};

/**
 * 获取文件缩略图
 */
export const getThumbnail = (fileId: number) => {
  return request.get<ThumbnailInfo>(`/api/knowledge/thumbnail/${fileId}`);
};

/**
 * 获取缩略图URL
 */
export const getThumbnailUrl = (fileId: number, width?: number, height?: number) => {
  let url = `/api/knowledge/thumbnail/${fileId}/image`;
  const params: string[] = [];
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return url;
};

// ========== AI智能分类 API ==========

/**
 * 获取AI分类建议
 */
export const getAIClassification = (fileId: number) => {
  return request.get<AIClassificationResponse>(`/api/knowledge/ai/classify/${fileId}`);
};

/**
 * 批量获取AI分类建议
 */
export const batchAIClassification = (data: BatchAIClassificationRequest) => {
  return request.post<BatchAIClassificationResponse>('/api/knowledge/ai/classify/batch', data);
};

/**
 * 应用AI分类建议
 */
export const applyAIClassification = (
  fileId: number,
  category?: string,
  tags?: string[]
) => {
  return request.post<KnowledgeFile>(`/api/knowledge/ai/classify/${fileId}/apply`, {
    category,
    tags
  });
};

/**
 * 获取AI分类历史
 */
export const getAIClassificationHistory = (fileId: number) => {
  return request.get<AIClassificationResponse[]>(`/api/knowledge/ai/classify/${fileId}/history`);
};

/**
 * 训练AI分类模型（基于用户反馈）
 */
export const trainAIClassifier = (
  fileId: number,
  correctCategory: string,
  correctTags: string[]
) => {
  return request.post<{ success: boolean }>('/api/knowledge/ai/train', {
    fileId,
    correctCategory,
    correctTags
  });
};

// ========== 分类管理 API ==========

/**
 * 获取所有分类
 */
export const getCategories = () => {
  return request.get<FileCategory[]>('/api/knowledge/categories');
};

/**
 * 获取分类树
 */
export const getCategoryTree = () => {
  return request.get<FileCategory[]>('/api/knowledge/categories/tree');
};

/**
 * 创建分类
 */
export const createCategory = (data: Partial<FileCategory>) => {
  return request.post<FileCategory>('/api/knowledge/categories', data);
};

/**
 * 更新分类
 */
export const updateCategory = (id: number, data: Partial<FileCategory>) => {
  return request.put<FileCategory>(`/api/knowledge/categories/${id}`, data);
};

/**
 * 删除分类
 */
export const deleteCategory = (id: number) => {
  return request.del<boolean>(`/api/knowledge/categories/${id}`);
};

// ========== 标签管理 API ==========

/**
 * 获取所有标签
 */
export const getTags = () => {
  return request.get<FileTag[]>('/api/knowledge/tags');
};

/**
 * 获取热门标签
 */
export const getPopularTags = (limit = 20) => {
  return request.get<FileTag[]>(`/api/knowledge/tags/popular?limit=${limit}`);
};

/**
 * 创建标签
 */
export const createTag = (name: string, color?: string) => {
  return request.post<FileTag>('/api/knowledge/tags', { name, color });
};

/**
 * 删除标签
 */
export const deleteTag = (id: number) => {
  return request.del<boolean>(`/api/knowledge/tags/${id}`);
};

// ========== 文件管理 API ==========

/**
 * 获取文件列表
 */
export const getFiles = (params: {
  projectId?: number;
  folderId?: number;
  category?: string;
  tags?: string[];
  keyword?: string;
  page?: number;
  pageSize?: number;
}) => {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    projectId: params.projectId,
    folderId: params.folderId,
    category: params.category,
    keyword: params.keyword,
    page: params.page,
    pageSize: params.pageSize
  };
  if (params.tags && params.tags.length > 0) {
    queryParams.tags = params.tags.join(',');
  }
  return request.get<{ files: KnowledgeFile[]; total: number }>('/api/knowledge/files', queryParams);
};

/**
 * 获取文件详情
 */
export const getFile = (fileId: number) => {
  return request.get<KnowledgeFile>(`/api/knowledge/files/${fileId}`);
};

/**
 * 更新文件信息
 */
export const updateFile = (fileId: number, data: Partial<KnowledgeFile>) => {
  return request.put<KnowledgeFile>(`/api/knowledge/files/${fileId}`, data);
};

/**
 * 删除文件
 */
export const deleteFile = (fileId: number) => {
  return request.del<boolean>(`/api/knowledge/files/${fileId}`);
};

/**
 * 批量删除文件
 */
export const batchDeleteFiles = (fileIds: number[]) => {
  return request.post<{ successCount: number; failedIds: number[] }>(
    '/api/knowledge/files/batch/delete',
    { fileIds }
  );
};

/**
 * 移动文件到文件夹
 */
export const moveFile = (fileId: number, folderId: number) => {
  return request.put<KnowledgeFile>(`/api/knowledge/files/${fileId}/move`, { folderId });
};

/**
 * 设置文件分类
 */
export const setFileCategory = (fileId: number, category: string) => {
  return request.put<KnowledgeFile>(`/api/knowledge/files/${fileId}/category`, { category });
};

/**
 * 设置文件标签
 */
export const setFileTags = (fileId: number, tags: string[]) => {
  return request.put<KnowledgeFile>(`/api/knowledge/files/${fileId}/tags`, { tags });
};

/**
 * 添加文件标签
 */
export const addFileTag = (fileId: number, tag: string) => {
  return request.post<KnowledgeFile>(`/api/knowledge/files/${fileId}/tags`, { tag });
};

/**
 * 移除文件标签
 */
export const removeFileTag = (fileId: number, tag: string) => {
  return request.del<KnowledgeFile>(`/api/knowledge/files/${fileId}/tags/${encodeURIComponent(tag)}`);
};

// ========== 工具函数 ==========

/**
 * 计算文件MD5（用于秒传和断点续传）
 */
export const calculateFileMD5 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 分片上传大文件
 */
export const uploadLargeFile = async (
  file: File,
  options: {
    projectId?: number;
    folderId?: number;
    chunkSize?: number;
    onProgress?: (progress: number, uploadedChunks: number, totalChunks: number) => void;
    onChunkComplete?: (chunkIndex: number) => void;
    onComplete?: (response: ChunkUploadCompleteResponse) => void;
    onError?: (error: Error) => void;
  } = {}
): Promise<ChunkUploadCompleteResponse> => {
  const {
    projectId,
    folderId,
    chunkSize = 5 * 1024 * 1024, // 默认5MB
    onProgress,
    onChunkComplete,
    onComplete,
    onError
  } = options;

  try {
    // 计算分片数量
    const totalChunks = Math.ceil(file.size / chunkSize);

    // 计算文件MD5（可选，用于秒传）
    let md5: string | undefined;
    try {
      md5 = await calculateFileMD5(file);
      // 检查是否可以秒传
      const checkResult = await checkFileExists(md5, file.size);
      if (checkResult.exists && checkResult.fileId) {
        const response: ChunkUploadCompleteResponse = {
          fileId: checkResult.fileId,
          fileName: file.name,
          filePath: checkResult.filePath || '',
          fileSize: file.size,
          mimeType: file.type
        };
        onComplete?.(response);
        return response;
      }
    } catch {
      // MD5计算失败，继续正常上传
    }

    // 初始化分片上传
    const initResponse = await initChunkUpload({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      chunkSize,
      totalChunks,
      projectId,
      folderId,
      md5
    });

    const { uploadId, uploadedChunks } = initResponse;
    const uploadedSet = new Set(uploadedChunks);

    // 上传每个分片
    for (let i = 0; i < totalChunks; i++) {
      // 跳过已上传的分片（断点续传）
      if (uploadedSet.has(i)) {
        onProgress?.(((i + 1) / totalChunks) * 100, i + 1, totalChunks);
        continue;
      }

      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      await uploadChunk(uploadId, i, chunk);
      onChunkComplete?.(i);
      onProgress?.(((i + 1) / totalChunks) * 100, i + 1, totalChunks);
    }

    // 完成上传
    const completeResponse = await completeChunkUpload(uploadId);
    onComplete?.(completeResponse);
    return completeResponse;
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
};

/**
 * 获取文件类型图标
 */
export const getFileTypeIcon = (mimeType: string, extension: string): string => {
  if (mimeType.startsWith('image/')) return 'file-image';
  if (mimeType.startsWith('video/')) return 'file-video';
  if (mimeType.startsWith('audio/')) return 'file-audio';
  if (mimeType === 'application/pdf') return 'file-pdf';
  if (mimeType.includes('word') || extension === 'doc' || extension === 'docx') return 'file-word';
  if (mimeType.includes('excel') || extension === 'xls' || extension === 'xlsx') return 'file-excel';
  if (mimeType.includes('powerpoint') || extension === 'ppt' || extension === 'pptx') return 'file-ppt';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-zip';
  if (mimeType.startsWith('text/') || extension === 'txt' || extension === 'md') return 'file-text';
  return 'file';
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 检查文件是否支持预览
 */
export const isPreviewable = (mimeType: string): boolean => {
  const previewableTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'text/markdown'
  ];
  return previewableTypes.includes(mimeType) || mimeType.startsWith('image/');
};

/**
 * 检查文件是否支持缩略图
 */
export const supportsThumbnail = (mimeType: string): boolean => {
  const thumbnailTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'application/pdf',
    'video/mp4',
    'video/webm'
  ];
  return thumbnailTypes.includes(mimeType);
};

// ========== 版本控制 API ==========

/**
 * 获取文件版本历史
 */
export const getFileVersions = (fileId: number, page = 1, pageSize = 20) => {
  return request.get<{ versions: FileVersion[]; total: number }>(
    `/api/knowledge/files/${fileId}/versions`,
    { page, pageSize }
  );
};

/**
 * 获取指定版本详情
 */
export const getFileVersion = (fileId: number, versionNumber: number) => {
  return request.get<FileVersion>(`/api/knowledge/files/${fileId}/versions/${versionNumber}`);
};

/**
 * 获取最新版本
 */
export const getLatestVersion = (fileId: number) => {
  return request.get<FileVersion>(`/api/knowledge/files/${fileId}/versions/latest`);
};

/**
 * 创建新版本（手动保存）
 */
export const createFileVersion = (
  fileId: number,
  data: {
    file?: File;
    changeSummary?: string;
    changeType?: 'update' | 'rename';
  }
) => {
  const formData = new FormData();
  if (data.file) {
    formData.append('file', data.file);
  }
  if (data.changeSummary) {
    formData.append('changeSummary', data.changeSummary);
  }
  if (data.changeType) {
    formData.append('changeType', data.changeType);
  }
  return request.post<FileVersion>(`/api/knowledge/files/${fileId}/versions`, formData);
};

/**
 * 版本对比
 */
export const compareVersions = (
  fileId: number,
  fromVersion: number,
  toVersion: number
) => {
  return request.get<VersionDiff>(
    `/api/knowledge/files/${fileId}/versions/compare`,
    { fromVersion, toVersion }
  );
};

/**
 * 回滚到指定版本
 */
export const rollbackToVersion = (
  fileId: number,
  versionNumber: number,
  changeSummary?: string
) => {
  return request.post<FileVersion>(
    `/api/knowledge/files/${fileId}/versions/${versionNumber}/rollback`,
    { changeSummary }
  );
};

/**
 * 下载指定版本文件
 */
export const downloadVersion = (fileId: number, versionNumber: number) => {
  return `/api/knowledge/files/${fileId}/versions/${versionNumber}/download`;
};

/**
 * 删除指定版本（仅管理员）
 */
export const deleteVersion = (fileId: number, versionNumber: number) => {
  return request.del<boolean>(`/api/knowledge/files/${fileId}/versions/${versionNumber}`);
};

/**
 * 获取版本变更详情
 */
export const getVersionChanges = (fileId: number, versionNumber: number) => {
  return request.get<VersionChange[]>(
    `/api/knowledge/files/${fileId}/versions/${versionNumber}/changes`
  );
};

// ========== 变更记录 API ==========

/**
 * 获取文件变更记录
 */
export const getChangeLogs = (
  fileId: number,
  params?: {
    action?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }
) => {
  return request.get<{ logs: ChangeLog[]; total: number }>(
    `/api/knowledge/files/${fileId}/changelog`,
    params
  );
};

/**
 * 获取用户操作记录
 */
export const getUserChangeLogs = (
  userId: number,
  params?: {
    fileId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }
) => {
  return request.get<{ logs: ChangeLog[]; total: number }>(
    `/api/knowledge/changelog/user/${userId}`,
    params
  );
};

/**
 * 获取项目变更记录
 */
export const getProjectChangeLogs = (
  projectId: number,
  params?: {
    fileId?: number;
    action?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }
) => {
  return request.get<{ logs: ChangeLog[]; total: number }>(
    `/api/knowledge/changelog/project/${projectId}`,
    params
  );
};

// ========== 自动保存配置 API ==========

/**
 * 获取自动保存配置
 */
export const getAutoSaveConfig = (projectId?: number) => {
  const params = projectId ? { projectId } : undefined;
  return request.get<AutoSaveConfig>('/api/knowledge/config/autosave', params);
};

/**
 * 更新自动保存配置
 */
export const updateAutoSaveConfig = (config: Partial<AutoSaveConfig>, projectId?: number) => {
  return request.put<AutoSaveConfig>('/api/knowledge/config/autosave', {
    ...config,
    projectId
  });
};

/**
 * 清理旧版本（根据配置）
 */
export const cleanupOldVersions = (fileId?: number) => {
  return request.post<{ deletedCount: number }>('/api/knowledge/versions/cleanup', { fileId });
};

// ========== 版本控制工具函数 ==========

/**
 * 格式化变更类型
 */
export const formatChangeType = (changeType: string): string => {
  const typeMap: Record<string, string> = {
    create: '创建',
    update: '更新',
    rename: '重命名',
    restore: '恢复',
    delete: '删除',
    move: '移动',
    add: '新增',
    modify: '修改'
  };
  return typeMap[changeType] || changeType;
};

/**
 * 格式化操作类型
 */
export const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    create: '创建文件',
    update: '更新文件',
    delete: '删除文件',
    restore: '恢复版本',
    rename: '重命名',
    move: '移动文件'
  };
  return actionMap[action] || action;
};

/**
 * 获取变更类型颜色
 */
export const getChangeTypeColor = (changeType: string): string => {
  const colorMap: Record<string, string> = {
    create: '#52c41a',
    update: '#1890ff',
    rename: '#faad14',
    restore: '#722ed1',
    delete: '#ff4d4f',
    move: '#13c2c2',
    add: '#52c41a',
    modify: '#1890ff'
  };
  return colorMap[changeType] || '#8c8c8c';
};

/**
 * 计算版本差异统计
 */
export const calculateDiffStats = (diff: VersionDiff): string => {
  const parts: string[] = [];
  if (diff.additions > 0) parts.push(`+${diff.additions}`);
  if (diff.deletions > 0) parts.push(`-${diff.deletions}`);
  if (diff.modifications > 0) parts.push(`~${diff.modifications}`);
  return parts.join(' ') || '无变更';
};