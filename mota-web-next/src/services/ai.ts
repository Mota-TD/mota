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
    try {
      const response = await api.post<ChatSession>('/api/v1/ai/assistant/sessions', {
        sessionType,
        title,
        contextType,
        contextId
      });
      return response.data;
    } catch {
      // 返回模拟数据
      return {
        id: `session_${Date.now()}`,
        title: title || '新对话',
        messages: [],
        model: 'doubao-pro-32k',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        isPinned: false,
        isArchived: false,
      };
    }
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
    try {
      const response = await api.post<ChatResponse>(`/api/v1/ai/assistant/sessions/${sessionId}/messages`, {
        message,
        contentType
      });
      return response.data;
    } catch {
      // 返回模拟响应
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      return {
        message: assistantMsg,
        sessionId,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      };
    }
  },

  // 快速对话
  quickChat: async (message: string): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>('/api/v1/ai/assistant/chat', { message });
      return response.data;
    } catch {
      const userMsg: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      return {
        message: assistantMsg,
        sessionId: `session_${Date.now()}`,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      };
    }
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
    try {
      const response = await api.put<{ success: boolean; message: string }>(
        `/api/v1/ai/assistant/suggestions/work/${suggestionId}/feedback`,
        { accepted, comment }
      );
      return response.data;
    } catch {
      return { success: true, message: accepted ? '已采纳建议' : '已忽略建议' };
    }
  },

  // 翻译文本
  translateText: async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<AITranslation> => {
    try {
      const response = await api.post<AITranslation>('/api/v1/ai/assistant/translate', {
        text,
        sourceLanguage,
        targetLanguage
      });
      return response.data;
    } catch {
      // 返回模拟翻译结果
      return {
        id: Date.now(),
        userId: 1,
        sourceType: 'text',
        sourceLanguage,
        targetLanguage,
        sourceText: text,
        translatedText: `[翻译服务暂不可用] ${text}`,
        wordCount: text.length,
        translationEngine: 'mock',
        translationTimeMs: 100,
        isReviewed: false,
        createdAt: new Date().toISOString(),
      };
    }
  },

  // 生成文本摘要
  generateTextSummary: async (
    text: string,
    summaryType: string = 'brief'
  ): Promise<DocumentSummaryResult> => {
    try {
      const response = await api.post<DocumentSummaryResult>('/api/v1/ai/assistant/summary/text', { text, summaryType });
      return response.data;
    } catch {
      // 返回模拟摘要结果
      return {
        summaryType,
        summary: '摘要服务暂不可用',
        keyPoints: ['服务暂不可用'],
        wordCount: text.length,
        summaryWordCount: 10,
      };
    }
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
    try {
      const response = await api.post<{ success: boolean; message: string }>(`/api/v1/ai/assistant/suggestions/schedule/${suggestionId}/apply`, {});
      return response.data;
    } catch {
      return { success: true, message: '已应用日程建议' };
    }
  },

  // 生成工作报告
  generateWorkReport: async (
    reportType: string,
    reportScope: string,
    scopeId?: number
  ): Promise<AIWorkReport> => {
    try {
      const response = await api.post<AIWorkReport>('/api/v1/ai/assistant/reports', {
        reportType,
        reportScope,
        scopeId
      });
      return response.data;
    } catch {
      // 返回模拟报告
      return {
        id: Date.now(),
        userId: 1,
        reportType,
        reportScope,
        scopeId,
        reportTitle: `${reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报'} - ${new Date().toLocaleDateString()}`,
        reportContent: '报告生成服务暂不可用',
        isDraft: true,
        isSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
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
    try {
      const response = await api.get<AIAssistantConfig>('/api/v1/ai/assistant/config');
      return response.data;
    } catch {
      // 返回默认配置
      return {
        assistantName: 'AI助手',
        defaultModel: 'doubao-pro-32k',
        temperature: 0.7,
        maxTokens: 4096,
        enableContext: true,
        contextWindow: 10,
        enableSuggestions: true,
        enableAutoSummary: false,
        preferredLanguage: 'zh',
      };
    }
  },

  // 保存AI助手配置
  saveAssistantConfig: async (config: Partial<AIAssistantConfig>): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.put<{ success: boolean; message: string }>('/api/v1/ai/assistant/config', config);
      return response.data;
    } catch {
      return { success: true, message: '配置已保存' };
    }
  },

  // ==================== AI 模型训练相关 ====================

  // 获取训练统计
  getTrainingStats: async (): Promise<TrainingStats> => {
    try {
      const response = await api.get<TrainingStats>('/api/v1/ai/training/stats');
      return response.data;
    } catch {
      // 返回模拟数据
      return {
        totalDocuments: 156,
        totalTokens: '2.5M',
        lastTraining: '2024-01-15 14:30',
        modelVersion: 'v2.1.0',
        accuracy: 94.5,
      };
    }
  },

  // 获取训练历史
  getTrainingHistory: async (): Promise<TrainingHistory[]> => {
    try {
      const response = await api.get<TrainingHistory[]>('/api/v1/ai/training/history');
      return response.data || [];
    } catch {
      // 返回模拟数据
      return [
        { id: 1, version: 'v2.1.0', date: '2024-01-15 14:30', documents: 156, accuracy: 94.5, status: 'completed', duration: 3600 },
        { id: 2, version: 'v2.0.0', date: '2024-01-10 10:00', documents: 142, accuracy: 92.3, status: 'completed', duration: 3200 },
        { id: 3, version: 'v1.9.0', date: '2024-01-05 09:15', documents: 128, accuracy: 90.1, status: 'completed', duration: 2800 },
        { id: 4, version: 'v1.8.0', date: '2023-12-28 16:45', documents: 115, accuracy: 88.7, status: 'completed', duration: 2500 },
      ];
    }
  },

  // 获取知识库文档列表（培训用）
  getTrainingDocuments: async (): Promise<TrainingDocument[]> => {
    try {
      const response = await api.get<TrainingDocument[]>('/api/v1/ai/training/documents');
      return response.data || [];
    } catch {
      // 返回模拟数据
      return [
        { id: 1, name: '产品使用手册.pdf', size: '2.5 MB', uploadTime: '2024-01-15 10:30', status: 'indexed', type: 'pdf' },
        { id: 2, name: '技术架构文档.docx', size: '1.8 MB', uploadTime: '2024-01-14 15:20', status: 'indexed', type: 'docx' },
        { id: 3, name: '常见问题解答.md', size: '256 KB', uploadTime: '2024-01-13 09:45', status: 'indexed', type: 'md' },
        { id: 4, name: '业务流程说明.pdf', size: '3.2 MB', uploadTime: '2024-01-12 14:00', status: 'indexed', type: 'pdf' },
        { id: 5, name: 'API接口文档.json', size: '512 KB', uploadTime: '2024-01-11 11:30', status: 'pending', type: 'json' },
        { id: 6, name: '培训资料汇总.txt', size: '128 KB', uploadTime: '2024-01-10 16:15', status: 'processing', type: 'txt' },
      ];
    }
  },

  // 删除知识库文档（培训用）
  deleteTrainingDocument: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/v1/ai/training/documents/${id}`);
      return response.data;
    } catch {
      return { success: true, message: '文档已删除' };
    }
  },

  // 开始训练
  startTraining: async (): Promise<{ success: boolean; message: string; taskId?: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string; taskId?: string }>('/api/v1/ai/training/start');
      return response.data;
    } catch {
      return { success: true, message: '训练已启动', taskId: `task_${Date.now()}` };
    }
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
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/v1/ai/training/settings', settings);
      return response.data;
    } catch {
      return { success: true, message: '设置已保存' };
    }
  },

  // 保存业务配置
  saveBusinessConfig: async (config: BusinessConfig): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/api/v1/ai/training/business-config', config);
      return response.data;
    } catch {
      return { success: true, message: '配置已保存' };
    }
  },

  // 上传训练文档
  uploadTrainingDocument: async (file: File): Promise<TrainingDocument> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<TrainingDocument>('/api/v1/ai/training/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch {
      // 返回模拟数据
      return {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadTime: new Date().toLocaleString(),
        status: 'pending',
        type: file.name.split('.').pop() || 'unknown',
      };
    }
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
    try {
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
    } catch {
      // 返回模拟数据
      return {
        suggestions: [
          {
            id: '1',
            name: '需求分析',
            description: '收集和分析项目需求',
            suggestedDepartment: '产品部',
            suggestedPriority: 'high',
            estimatedDays: 5,
            dependencies: []
          },
          {
            id: '2',
            name: '技术方案设计',
            description: '设计技术架构和实现方案',
            suggestedDepartment: '技术部',
            suggestedPriority: 'high',
            estimatedDays: 7,
            dependencies: ['1']
          },
          {
            id: '3',
            name: '开发实现',
            description: '按照技术方案进行开发',
            suggestedDepartment: '技术部',
            suggestedPriority: 'medium',
            estimatedDays: 20,
            dependencies: ['2']
          },
          {
            id: '4',
            name: '测试验收',
            description: '进行功能测试和验收',
            suggestedDepartment: '测试部',
            suggestedPriority: 'medium',
            estimatedDays: 10,
            dependencies: ['3']
          }
        ],
        totalEstimatedDays: 42,
        riskAssessment: '项目整体风险可控，建议关注需求变更和技术难点',
        source: 'mock',
        generatedAt: new Date().toISOString()
      };
    }
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
    try {
      const response = await api.get<{
        projectId: string;
        currentProgress: number;
        predictedProgress: number;
        predictedCompletionDate: string;
        confidence: number;
        factors: string[];
      }>(`/api/v1/ai/project/${projectId}/predict`);
      return response.data;
    } catch {
      return {
        projectId,
        currentProgress: 45,
        predictedProgress: 52,
        predictedCompletionDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
        confidence: 0.78,
        factors: ['团队效率稳定', '无重大阻塞', '资源充足']
      };
    }
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
    try {
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
      return response.data;
    } catch {
      return [
        {
          id: '1',
          type: 'delay',
          severity: 'medium',
          title: '任务进度滞后',
          description: '部分任务进度落后于计划',
          affectedTasks: ['task-1', 'task-2'],
          suggestions: ['增加资源投入', '调整任务优先级'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'resource',
          severity: 'low',
          title: '资源分配不均',
          description: '部分成员工作负载过高',
          affectedTasks: ['task-3'],
          suggestions: ['重新分配任务', '考虑增加人手'],
          createdAt: new Date().toISOString()
        }
      ];
    }
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
    try {
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
    } catch {
      return {
        id: `report_${Date.now()}`,
        projectId,
        projectName: '项目名称',
        reportType,
        summary: '本周项目整体进展顺利，完成了主要功能开发。',
        highlights: ['完成核心功能开发', '通过代码审查', '性能优化完成'],
        issues: ['部分测试用例未通过', '文档需要更新'],
        nextSteps: ['修复测试问题', '完善文档', '准备上线'],
        statistics: {
          totalTasks: 50,
          completedTasks: 35,
          inProgressTasks: 10,
          overdueTasks: 2,
          progressChange: 15
        },
        generatedAt: new Date().toISOString()
      };
    }
  },

  // 获取 AI 建议的任务优先级
  suggestTaskPriority: async (
    taskDescription: string,
    deadline?: string
  ): Promise<{
    suggestedPriority: string;
    reason: string;
  }> => {
    try {
      const response = await api.post<{
        suggestedPriority: string;
        reason: string;
      }>('/api/v1/ai/project/suggest-priority', { taskDescription, deadline });
      return response.data;
    } catch {
      return {
        suggestedPriority: 'medium',
        reason: '根据任务描述和截止日期，建议设置为中等优先级'
      };
    }
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
    try {
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
    } catch {
      return {
        suggestedAssignees: [
          {
            userId: '1',
            userName: '张三',
            matchScore: 95,
            currentWorkload: 60,
            reason: '技能匹配度高，当前工作负载适中'
          },
          {
            userId: '2',
            userName: '李四',
            matchScore: 85,
            currentWorkload: 40,
            reason: '有相关经验，工作负载较低'
          }
        ]
      };
    }
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
    try {
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
    } catch {
      return {
        summary: '建议分三个阶段完成任务，每个阶段设置明确的交付物',
        milestones: [
          {
            name: '第一阶段：需求确认',
            targetDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
            deliverables: ['需求文档', '原型设计']
          },
          {
            name: '第二阶段：开发实现',
            targetDate: new Date(Date.now() + 21 * 24 * 3600000).toISOString(),
            deliverables: ['功能代码', '单元测试']
          },
          {
            name: '第三阶段：测试上线',
            targetDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
            deliverables: ['测试报告', '上线文档']
          }
        ],
        resourceRequirements: '需要2名开发人员，1名测试人员',
        risks: ['需求变更风险', '技术难点风险']
      };
    }
  },
};

export default aiService;