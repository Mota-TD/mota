import { api } from '@/lib/api-client';

// AI 类型定义
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  createdAt?: string;
  contentType?: string;
  intentType?: string;
  intentConfidence?: number;
  tokensUsed?: number;
  responseTimeMs?: number;
  isError?: boolean;
  errorMessage?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  metadata?: {
    model?: string;
    tokens?: number;
    duration?: number;
  };
}

export interface ChatSession {
  id: string;
  userId?: number;
  sessionType?: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  modelName?: string;
  totalTokens?: number;
  messageCount?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  lastMessageAt?: string;
  contextType?: string;
  contextId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  model?: string;
  context?: {
    projectId?: string;
    taskId?: string;
    documentId?: string;
  };
}

export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
  userMessage?: ChatMessage;
  assistantMessage?: ChatMessage;
  intent?: IntentResult;
}

// 意图识别结果
export interface IntentResult {
  intentType: string;
  confidence: number;
  parameters?: Record<string, unknown>;
}

// AI 建议
export interface AISuggestion {
  id: string;
  type: 'task' | 'project' | 'schedule' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    type: string;
    params: Record<string, unknown>;
  };
  createdAt: string;
}

// 工作建议
export interface AIWorkSuggestion {
  id: number;
  userId: number;
  suggestionType: string;
  suggestionTitle: string;
  suggestionContent: string;
  suggestionReason?: string;
  relatedType?: string;
  relatedId?: number;
  priorityLevel: number;
  impactScore?: number;
  actionItems?: string;
  isRead: boolean;
  isAccepted?: boolean;
  isDismissed: boolean;
  feedbackComment?: string;
  validUntil?: string;
  createdAt: string;
}

// 翻译结果
export interface AITranslation {
  id: number;
  userId: number;
  sourceType: string;
  sourceId?: number;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  wordCount: number;
  translationEngine: string;
  modelUsed?: string;
  tokensUsed?: number;
  translationTimeMs?: number;
  qualityScore?: number;
  isReviewed: boolean;
  reviewedText?: string;
  feedbackRating?: number;
  createdAt: string;
}

// 文档摘要结果
export interface DocumentSummaryResult {
  documentId?: number;
  summaryType: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
  summaryWordCount: number;
  compressionRatio?: number;
}

// 数据分析
export interface AIDataAnalysis {
  id: number;
  userId: number;
  analysisType: string;
  analysisScope: string;
  scopeId?: number;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  analysisTitle: string;
  analysisContent: string;
  keyFindings?: string;
  metrics?: string;
  charts?: string;
  recommendations?: string;
  dataSources?: string;
  modelUsed?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
  isSaved: boolean;
  feedbackRating?: number;
  createdAt: string;
}

// 日程建议
export interface AIScheduleSuggestion {
  id: number;
  userId: number;
  suggestionType: string;
  suggestionDate: string;
  suggestionTitle: string;
  suggestionContent: string;
  currentSchedule?: string;
  suggestedSchedule?: string;
  affectedEvents?: string;
  optimizationScore?: number;
  timeSavedMinutes?: number;
  priorityLevel: number;
  isRead: boolean;
  isApplied?: boolean;
  isDismissed: boolean;
  feedbackComment?: string;
  createdAt: string;
}

// 工作报告
export interface AIWorkReport {
  id: number;
  userId: number;
  reportType: string;
  reportScope: string;
  scopeId?: number;
  reportTitle: string;
  reportPeriodStart?: string;
  reportPeriodEnd?: string;
  reportContent: string;
  summary?: string;
  accomplishments?: string;
  inProgress?: string;
  blockers?: string;
  nextSteps?: string;
  metrics?: string;
  charts?: string;
  attachments?: string;
  modelUsed?: string;
  tokensUsed?: number;
  generationTimeMs?: number;
  isDraft: boolean;
  isSent: boolean;
  sentTo?: string;
  sentAt?: string;
  feedbackRating?: number;
  createdAt: string;
  updatedAt: string;
}

// AI助手配置
export interface AIAssistantConfig {
  id?: number;
  userId?: number;
  assistantName: string;
  assistantAvatar?: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableContext: boolean;
  contextWindow: number;
  enableSuggestions: boolean;
  suggestionFrequency?: string;
  enableAutoSummary: boolean;
  enableAutoTranslation?: boolean;
  preferredLanguage: string;
  reportSchedule?: string;
  notificationSettings?: string;
}

// 知识库
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  totalSize: number;
  status: 'active' | 'processing' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  knowledgeBaseId: string;
  name: string;
  type: string;
  size: number;
  status: 'pending' | 'processing' | 'indexed' | 'error';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSearchResult {
  documentId: string;
  documentName: string;
  content: string;
  score: number;
  highlights: string[];
}

// 培训相关类型
export interface TrainingStats {
  totalDocuments: number;
  totalTokens: string;
  lastTraining: string;
  modelVersion: string;
  accuracy: number;
}

export interface TrainingHistory {
  id: number;
  version: string;
  date: string;
  documents: number;
  accuracy: number;
  status: 'completed' | 'failed' | 'training';
  duration?: number;
}

export interface TrainingDocument {
  id: number;
  name: string;
  size: string;
  uploadTime: string;
  status: 'indexed' | 'pending' | 'processing' | 'error';
  type?: string;
}

export interface TrainingSettings {
  epochs: number;
  learningRate: string;
  batchSize: number;
}

export interface BusinessConfig {
  companyName: string;
  industry: string;
  businessDesc: string;
}

// PPT 生成
export interface PPTGenerateRequest {
  topic: string;
  outline?: string[];
  style?: 'business' | 'academic' | 'creative' | 'minimal';
  pageCount?: number;
  language?: string;
}

export interface PPTGenerateResponse {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface PPTHistory {
  id: string;
  topic: string;
  style: string;
  pageCount: number;
  status: string;
  downloadUrl?: string;
  createdAt: string;
}

// AI 服务
export const aiService = {
  // 发送聊天消息
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/v1/ai/chat', data);
    return response.data;
  },

  // 流式聊天
  chatStream: async (data: ChatRequest, onMessage: (chunk: string) => void): Promise<void> => {
    const response = await fetch('/api/v1/ai/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Chat stream failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      onMessage(chunk);
    }
  },

  // 获取聊天会话列表
  getChatSessions: async (): Promise<ChatSession[]> => {
    const response = await api.get<ChatSession[]>('/api/v1/ai/sessions');
    return response.data;
  },

  // 获取聊天会话详情
  getChatSession: async (id: string): Promise<ChatSession> => {
    const response = await api.get<ChatSession>(`/api/v1/ai/sessions/${id}`);
    return response.data;
  },

  // 创建聊天会话
  createChatSession: async (title?: string): Promise<ChatSession> => {
    const response = await api.post<ChatSession>('/api/v1/ai/sessions', { title });
    return response.data;
  },

  // 删除聊天会话
  deleteChatSession: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/ai/sessions/${id}`);
  },

  // 获取 AI 建议
  getSuggestions: async (): Promise<AISuggestion[]> => {
    const response = await api.get<AISuggestion[]>('/api/v1/ai/suggestions');
    return response.data;
  },

  // 执行 AI 建议
  executeSuggestion: async (id: string): Promise<void> => {
    await api.post(`/api/v1/ai/suggestions/${id}/execute`);
  },

  // 忽略 AI 建议
  dismissSuggestion: async (id: string): Promise<void> => {
    await api.post(`/api/v1/ai/suggestions/${id}/dismiss`);
  },

  // 知识库相关
  // 获取知识库列表
  getKnowledgeBases: async (): Promise<KnowledgeBase[]> => {
    const response = await api.get<KnowledgeBase[]>('/api/v1/ai/knowledge-bases');
    return response.data;
  },

  // 创建知识库
  createKnowledgeBase: async (name: string, description?: string): Promise<KnowledgeBase> => {
    const response = await api.post<KnowledgeBase>('/api/v1/ai/knowledge-bases', { name, description });
    return response.data;
  },

  // 删除知识库
  deleteKnowledgeBase: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/ai/knowledge-bases/${id}`);
  },

  // 上传文档到知识库
  uploadDocument: async (knowledgeBaseId: string, file: File): Promise<KnowledgeDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<KnowledgeDocument>(
      `/api/v1/ai/knowledge-bases/${knowledgeBaseId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // 获取知识库文档列表
  getKnowledgeDocuments: async (knowledgeBaseId: string): Promise<KnowledgeDocument[]> => {
    const response = await api.get<KnowledgeDocument[]>(`/api/v1/ai/knowledge-bases/${knowledgeBaseId}/documents`);
    return response.data;
  },

  // 删除知识库文档
  deleteKnowledgeDocument: async (knowledgeBaseId: string, documentId: string): Promise<void> => {
    await api.delete(`/api/v1/ai/knowledge-bases/${knowledgeBaseId}/documents/${documentId}`);
  },

  // 知识库搜索
  searchKnowledge: async (knowledgeBaseId: string, query: string): Promise<KnowledgeSearchResult[]> => {
    const response = await api.post<KnowledgeSearchResult[]>(
      `/api/v1/ai/knowledge-bases/${knowledgeBaseId}/search`,
      { query }
    );
    return response.data;
  },

  // PPT 生成相关
  // 生成 PPT
  generatePPT: async (data: PPTGenerateRequest): Promise<PPTGenerateResponse> => {
    const response = await api.post<PPTGenerateResponse>('/api/v1/ai/ppt/generate', data);
    return response.data;
  },

  // 获取 PPT 生成状态
  getPPTStatus: async (id: string): Promise<PPTGenerateResponse> => {
    const response = await api.get<PPTGenerateResponse>(`/api/v1/ai/ppt/${id}/status`);
    return response.data;
  },

  // 获取 PPT 历史记录
  getPPTHistory: async (): Promise<PPTHistory[]> => {
    const response = await api.get<PPTHistory[]>('/api/v1/ai/ppt/history');
    return response.data;
  },

  // 删除 PPT 历史记录
  deletePPTHistory: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/ai/ppt/${id}`);
  },

  // 下载 PPT
  downloadPPT: async (id: string): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/v1/ai/ppt/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  // 方案生成相关
  // 获取方案生成历史
  getProposalHistory: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/api/v1/ai/proposals/history');
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 生成方案
  generateProposal: async (data: {
    template: any;
    title: string;
    requirements: string;
    keywords?: string[];
    references?: string[];
  }): Promise<any> => {
    const response = await api.post('/api/v1/ai/proposals/generate', data);
    return response.data;
  },

  // 导出方案
  exportProposal: async (id: string, format: 'word' | 'pdf' | 'markdown'): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/v1/ai/proposals/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  // AI 会话相关
  // 获取会话列表
  getConversations: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/api/v1/ai/conversations');
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 获取会话消息
  getConversationMessages: async (conversationId: string): Promise<any[]> => {
    try {
      const response = await api.get<any[]>(`/api/v1/ai/conversations/${conversationId}/messages`);
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 创建会话
  createConversation: async (title?: string): Promise<any> => {
    const response = await api.post('/api/v1/ai/conversations', { title });
    return response.data;
  },

  // 删除会话
  deleteConversation: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/ai/conversations/${id}`);
  },

  // 发送消息
  sendMessage: async (conversationId: string | null, content: string): Promise<any> => {
    const response = await api.post('/api/v1/ai/chat', {
      conversationId,
      message: content,
    });
    return response.data;
  },

  // 消息反馈
  feedbackMessage: async (messageId: string, feedback: 'like' | 'dislike'): Promise<void> => {
    await api.post(`/api/v1/ai/messages/${messageId}/feedback`, { feedback });
  },

  // AI 模型管理相关
  // 获取模型列表
  getModels: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/api/v1/ai/models');
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 创建模型
  createModel: async (data: any): Promise<any> => {
    const response = await api.post('/api/v1/ai/models', data);
    return response.data;
  },

  // 更新模型
  updateModel: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/api/v1/ai/models/${id}`, data);
    return response.data;
  },

  // 删除模型
  deleteModel: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/ai/models/${id}`);
  },

  // 切换模型状态
  toggleModelStatus: async (id: string, status: 'active' | 'inactive'): Promise<void> => {
    await api.patch(`/api/v1/ai/models/${id}/status`, { status });
  },

  // 设为默认模型
  setDefaultModel: async (id: string): Promise<void> => {
    await api.post(`/api/v1/ai/models/${id}/set-default`);
  },

  // 测试模型
  testModel: async (id: string, input: string): Promise<{ output: string; latency: number; tokens: number }> => {
    const response = await api.post<{ output: string; latency: number; tokens: number }>(`/api/v1/ai/models/${id}/test`, { input });
    return response.data;
  },

  // ==================== AI 助手扩展功能 ====================

  // 创建对话会话
  createAssistantSession: async (
    sessionType?: string,
    title?: string,
    contextType?: string,
    contextId?: number
  ): Promise<ChatSession> => {
    const response = await api.post<ChatSession>('/api/v1/ai/assistant/sessions', {
      sessionType,
      title,
      contextType,
      contextId
    });
    return response.data;
  },

  // 获取用户会话列表
  getUserSessions: async (limit: number = 20): Promise<ChatSession[]> => {
    try {
      const response = await api.get<ChatSession[]>('/api/v1/ai/assistant/sessions', { params: { limit } });
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 获取会话消息
  getSessionMessages: async (sessionId: string, limit: number = 50): Promise<ChatMessage[]> => {
    try {
      const response = await api.get<ChatMessage[]>(`/api/v1/ai/assistant/sessions/${sessionId}/messages`, { params: { limit } });
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 发送消息到会话
  sendAssistantMessage: async (
    sessionId: string,
    message: string,
    contentType: string = 'text'
  ): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>(`/api/v1/ai/assistant/sessions/${sessionId}/messages`, {
      message,
      contentType
    });
    return response.data;
  },

  // 快速对话
  quickChat: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/v1/ai/assistant/chat', { message });
    return response.data;
  },

  // 获取工作建议
  getWorkSuggestions: async (): Promise<AIWorkSuggestion[]> => {
    try {
      const response = await api.get<AIWorkSuggestion[]>('/api/v1/ai/assistant/suggestions/work');
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 采纳/忽略建议
  feedbackSuggestion: async (
    suggestionId: number,
    accepted: boolean,
    comment?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>(
      `/api/v1/ai/assistant/suggestions/work/${suggestionId}/feedback`,
      { accepted, comment }
    );
    return response.data;
  },

  // 翻译文本
  translateText: async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<AITranslation> => {
    const response = await api.post<AITranslation>('/api/v1/ai/assistant/translate', {
      text,
      sourceLanguage,
      targetLanguage
    });
    return response.data;
  },

  // 生成文本摘要
  generateTextSummary: async (
    text: string,
    summaryType: string = 'brief'
  ): Promise<DocumentSummaryResult> => {
    const response = await api.post<DocumentSummaryResult>('/api/v1/ai/assistant/summary/text', { text, summaryType });
    return response.data;
  },

  // 获取日程建议
  getScheduleSuggestions: async (date?: string): Promise<AIScheduleSuggestion[]> => {
    try {
      const response = await api.get<AIScheduleSuggestion[]>('/api/v1/ai/assistant/suggestions/schedule', { params: { date } });
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 应用日程建议
  applyScheduleSuggestion: async (suggestionId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(`/api/v1/ai/assistant/suggestions/schedule/${suggestionId}/apply`, {});
    return response.data;
  },

  // 生成工作报告
  generateWorkReport: async (
    reportType: string,
    reportScope: string,
    scopeId?: number
  ): Promise<AIWorkReport> => {
    const response = await api.post<AIWorkReport>('/api/v1/ai/assistant/reports', {
      reportType,
      reportScope,
      scopeId
    });
    return response.data;
  },

  // 获取报告列表
  getWorkReports: async (reportType?: string, limit: number = 20): Promise<AIWorkReport[]> => {
    try {
      const response = await api.get<AIWorkReport[]>('/api/v1/ai/assistant/reports', { params: { reportType, limit } });
      return response.data || [];
    } catch {
      return [];
    }
  },

  // 获取AI助手配置
  getAssistantConfig: async (): Promise<AIAssistantConfig> => {
    const response = await api.get<AIAssistantConfig>('/api/v1/ai/assistant/config');
    return response.data;
  },

  // 保存AI助手配置
  saveAssistantConfig: async (config: Partial<AIAssistantConfig>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put<{ success: boolean; message: string }>('/api/v1/ai/assistant/config', config);
    return response.data;
  },

  // ==================== AI 模型训练相关 ====================

  // 获取训练统计
  getTrainingStats: async (): Promise<TrainingStats> => {
    const response = await api.get<TrainingStats>('/api/v1/ai/training/stats');
    return response.data;
  },

  // 获取训练历史
  getTrainingHistory: async (): Promise<TrainingHistory[]> => {
    const response = await api.get<TrainingHistory[]>('/api/v1/ai/training/history');
    return response.data || [];
  },

  // 获取知识库文档列表（培训用）
  getTrainingDocuments: async (): Promise<TrainingDocument[]> => {
    const response = await api.get<TrainingDocument[]>('/api/v1/ai/training/documents');
    return response.data || [];
  },

  // 删除知识库文档（培训用）
  deleteTrainingDocument: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/v1/ai/training/documents/${id}`);
    return response.data;
  },

  // 开始训练
  startTraining: async (): Promise<{ success: boolean; message: string; taskId?: string }> => {
    const response = await api.post<{ success: boolean; message: string; taskId?: string }>('/api/v1/ai/training/start');
    return response.data;
  },

  // 获取训练进度
  getTrainingProgress: async (taskId: string): Promise<{ progress: number; status: string; message?: string }> => {
    try {
      const response = await api.get<{ progress: number; status: string; message?: string }>(`/api/v1/ai/training/progress/${taskId}`);
      return response.data;
    } catch {
      return { progress: 0, status: 'unknown' };
    }
  },

  // 保存训练设置
  saveTrainingSettings: async (settings: TrainingSettings): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/api/v1/ai/training/settings', settings);
    return response.data;
  },

  // 保存业务配置
  saveBusinessConfig: async (config: BusinessConfig): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/api/v1/ai/training/business-config', config);
    return response.data;
  },

  // 上传训练文档
  uploadTrainingDocument: async (file: File): Promise<TrainingDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<TrainingDocument>('/api/v1/ai/training/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ==================== 项目协同 AI 功能 ====================

  // AI 任务分解请求类型
  // AI 任务分解 - 根据项目描述自动建议任务拆解
  generateTaskDecomposition: async (data: {
    projectName: string;
    projectDescription: string;
    departments: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<{
    suggestions: Array<{
      id: string;
      name: string;
      description: string;
      suggestedDepartment?: string;
      suggestedPriority: string;
      estimatedDays: number;
      dependencies?: string[];
    }>;
    totalEstimatedDays: number;
    riskAssessment: string;
    source: 'ai' | 'mock';
    model?: string;
    generatedAt: string;
  }> => {
    const response = await api.post<{
      suggestions: Array<{
        id: string;
        name: string;
        description: string;
        suggestedDepartment?: string;
        suggestedPriority: string;
        estimatedDays: number;
        dependencies?: string[];
      }>;
      totalEstimatedDays: number;
      riskAssessment: string;
      source: 'ai' | 'mock';
      model?: string;
      generatedAt: string;
    }>('/api/v1/ai/project/decompose', data);
    return response.data;
  },

  // AI 进度预测 - 基于历史数据预测项目完成时间
  predictProjectProgress: async (projectId: string): Promise<{
    projectId: string;
    currentProgress: number;
    predictedProgress: number;
    predictedCompletionDate: string;
    confidence: number;
    factors: string[];
  }> => {
    const response = await api.get<{
      projectId: string;
      currentProgress: number;
      predictedProgress: number;
      predictedCompletionDate: string;
      confidence: number;
      factors: string[];
    }>(`/api/v1/ai/project/${projectId}/predict`);
    return response.data;
  },

  // AI 风险预警 - 自动识别可能延期的任务
  getProjectRiskWarnings: async (projectId: string): Promise<Array<{
    id: string;
    type: 'delay' | 'resource' | 'dependency' | 'quality';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    affectedTasks: string[];
    suggestions: string[];
    createdAt: string;
  }>> => {
    const response = await api.get<Array<{
      id: string;
      type: 'delay' | 'resource' | 'dependency' | 'quality';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      affectedTasks: string[];
      suggestions: string[];
      createdAt: string;
    }>>(`/api/v1/ai/project/${projectId}/risks`);
    return response.data || [];
  },

  // AI 智能报告 - 自动生成项目进度报告
  generateProjectReport: async (
    projectId: string,
    reportType: 'daily' | 'weekly' | 'monthly'
  ): Promise<{
    id: string;
    projectId: string;
    projectName: string;
    reportType: string;
    summary: string;
    highlights: string[];
    issues: string[];
    nextSteps: string[];
    statistics: {
      totalTasks: number;
      completedTasks: number;
      inProgressTasks: number;
      overdueTasks: number;
      progressChange: number;
    };
    generatedAt: string;
  }> => {
    const response = await api.post<{
      id: string;
      projectId: string;
      projectName: string;
      reportType: string;
      summary: string;
      highlights: string[];
      issues: string[];
      nextSteps: string[];
      statistics: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        overdueTasks: number;
        progressChange: number;
      };
      generatedAt: string;
    }>(`/api/v1/ai/project/${projectId}/report`, { reportType });
    return response.data;
  },

  // 获取 AI 建议的任务优先级
  suggestTaskPriority: async (
    taskDescription: string,
    deadline?: string
  ): Promise<{
    suggestedPriority: string;
    reason: string;
  }> => {
    const response = await api.post<{
      suggestedPriority: string;
      reason: string;
    }>('/api/v1/ai/project/suggest-priority', { taskDescription, deadline });
    return response.data;
  },

  // AI 智能分配 - 根据成员能力和工作负载建议任务分配
  suggestTaskAssignment: async (taskId: string): Promise<{
    suggestedAssignees: Array<{
      userId: string;
      userName: string;
      matchScore: number;
      currentWorkload: number;
      reason: string;
    }>;
  }> => {
    const response = await api.get<{
      suggestedAssignees: Array<{
        userId: string;
        userName: string;
        matchScore: number;
        currentWorkload: number;
        reason: string;
      }>;
    }>(`/api/v1/ai/project/task/${taskId}/suggest-assignee`);
    return response.data;
  },

  // AI 工作计划生成 - 根据部门任务自动生成工作计划建议
  generateWorkPlanSuggestion: async (departmentTaskId: string): Promise<{
    summary: string;
    milestones: Array<{
      name: string;
      targetDate: string;
      deliverables: string[];
    }>;
    resourceRequirements: string;
    risks: string[];
  }> => {
    const response = await api.get<{
      summary: string;
      milestones: Array<{
        name: string;
        targetDate: string;
        deliverables: string[];
      }>;
      resourceRequirements: string;
      risks: string[];
    }>(`/api/v1/ai/project/department-task/${departmentTaskId}/work-plan-suggestion`);
    return response.data;
  },
};

export default aiService;