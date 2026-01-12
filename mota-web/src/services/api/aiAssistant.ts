import { get, post, put } from '../request';

// ==================== 类型定义 ====================

// 对话会话
export interface AIChatSession {
  id: number;
  userId: number;
  sessionType: string;
  title: string;
  contextType?: string;
  contextId?: number;
  modelName: string;
  totalTokens: number;
  messageCount: number;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 对话消息
export interface AIChatMessage {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType: string;
  intentType?: string;
  intentConfidence?: number;
  tokensUsed?: number;
  responseTimeMs?: number;
  isError?: boolean;
  errorMessage?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  createdAt: string;
}

// 意图识别结果
export interface IntentResult {
  intentType: string;
  confidence: number;
  parameters?: Record<string, any>;
}

// 对话响应
export interface ChatResponse {
  userMessage: AIChatMessage;
  assistantMessage: AIChatMessage;
  intent: IntentResult;
}

// 任务指令
export interface AITaskCommand {
  id: number;
  userId: number;
  sessionId?: number;
  commandText: string;
  commandType: string;
  targetType: string;
  targetId?: number;
  parsedParams?: string;
  executionStatus: string;
  executionResult?: string;
  errorMessage?: string;
  confidenceScore?: number;
  requiresConfirmation: boolean;
  confirmedAt?: string;
  executedAt?: string;
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

// 文档摘要结果
export interface DocumentSummaryResult {
  documentId: number;
  summaryType: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
  summaryWordCount: number;
  compressionRatio: number;
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
  userId: number;
  assistantName: string;
  assistantAvatar?: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  enableContext: boolean;
  contextWindow: number;
  enableSuggestions: boolean;
  suggestionFrequency: string;
  enableAutoSummary: boolean;
  enableAutoTranslation: boolean;
  preferredLanguage: string;
  reportSchedule?: string;
  notificationSettings?: string;
}

// ==================== AA-001 智能问答 ====================

/**
 * 创建对话会话
 */
export const createSession = (
  sessionType?: string,
  title?: string,
  contextType?: string,
  contextId?: number
): Promise<AIChatSession> => {
  return post<AIChatSession>('/api/ai/assistant/sessions', {
    sessionType,
    title,
    contextType,
    contextId
  });
};

/**
 * 获取用户会话列表
 */
export const getUserSessions = (limit: number = 20): Promise<AIChatSession[]> => {
  return get<AIChatSession[]>('/api/ai/assistant/sessions', { limit });
};

/**
 * 获取会话消息
 */
export const getSessionMessages = (
  sessionId: number,
  limit: number = 50
): Promise<AIChatMessage[]> => {
  return get<AIChatMessage[]>(`/api/ai/assistant/sessions/${sessionId}/messages`, { limit });
};

/**
 * 发送消息
 */
export const sendMessage = (
  sessionId: number,
  message: string,
  contentType: string = 'text'
): Promise<ChatResponse> => {
  return post<ChatResponse>(`/api/ai/assistant/sessions/${sessionId}/messages`, {
    message,
    contentType
  });
};

/**
 * 快速对话
 */
export const quickChat = (message: string): Promise<ChatResponse> => {
  return post<ChatResponse>('/api/ai/assistant/chat', { message });
};

// ==================== AA-002 任务指令 ====================

/**
 * 执行任务指令
 */
export const executeTaskCommand = (command: string): Promise<AITaskCommand> => {
  return post<AITaskCommand>('/api/ai/assistant/commands/task', { command });
};

// ==================== AA-003 工作建议 ====================

/**
 * 获取工作建议
 */
export const getWorkSuggestions = (): Promise<AIWorkSuggestion[]> => {
  return get<AIWorkSuggestion[]>('/api/ai/assistant/suggestions/work');
};

/**
 * 标记建议已读
 */
export const markSuggestionRead = (
  suggestionId: number
): Promise<{ success: boolean; message: string }> => {
  return put<{ success: boolean; message: string }>(
    `/api/ai/assistant/suggestions/work/${suggestionId}/read`,
    {}
  );
};

/**
 * 采纳/忽略建议
 */
export const feedbackSuggestion = (
  suggestionId: number,
  accepted: boolean,
  comment?: string
): Promise<{ success: boolean; message: string }> => {
  return put<{ success: boolean; message: string }>(
    `/api/ai/assistant/suggestions/work/${suggestionId}/feedback`,
    { accepted, comment }
  );
};

// ==================== AA-004 文档摘要 ====================

/**
 * 生成文档摘要
 */
export const generateDocumentSummary = (
  documentId: number,
  summaryType: string = 'brief'
): Promise<DocumentSummaryResult> => {
  return post<DocumentSummaryResult>('/api/ai/assistant/summary/document', {
    documentId,
    summaryType
  });
};

/**
 * 生成文本摘要
 */
export const generateTextSummary = (
  text: string,
  summaryType: string = 'brief'
): Promise<{ summary: string; keyPoints: string[]; wordCount: number; summaryWordCount: number }> => {
  return post('/api/ai/assistant/summary/text', { text, summaryType });
};

// ==================== AA-005 翻译功能 ====================

/**
 * 翻译文本
 */
export const translateText = (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<AITranslation> => {
  return post<AITranslation>('/api/ai/assistant/translate', {
    text,
    sourceLanguage,
    targetLanguage
  });
};

/**
 * 检测语言
 */
export const detectLanguage = (
  text: string
): Promise<{ language: string; languageName: string; confidence: number }> => {
  return post('/api/ai/assistant/translate/detect', { text });
};

// ==================== AA-006 数据分析 ====================

/**
 * 生成数据分析
 */
export const generateDataAnalysis = (
  analysisType: string,
  analysisScope: string,
  scopeId?: number,
  timeRange?: string
): Promise<AIDataAnalysis> => {
  return post<AIDataAnalysis>('/api/ai/assistant/analysis', {
    analysisType,
    analysisScope,
    scopeId,
    timeRange
  });
};

/**
 * 获取分析建议
 */
export const getAnalysisSuggestions = (
  scope?: string
): Promise<{ type: string; title: string; description: string }[]> => {
  return get('/api/ai/assistant/analysis/suggestions', { scope });
};

// ==================== AA-007 日程建议 ====================

/**
 * 获取日程建议
 */
export const getScheduleSuggestions = (date?: string): Promise<AIScheduleSuggestion[]> => {
  return get<AIScheduleSuggestion[]>('/api/ai/assistant/suggestions/schedule', { date });
};

/**
 * 应用日程建议
 */
export const applyScheduleSuggestion = (
  suggestionId: number
): Promise<{ success: boolean; message: string }> => {
  return post(`/api/ai/assistant/suggestions/schedule/${suggestionId}/apply`, {});
};

// ==================== AA-008 报告生成 ====================

/**
 * 生成工作报告
 */
export const generateWorkReport = (
  reportType: string,
  reportScope: string,
  scopeId?: number
): Promise<AIWorkReport> => {
  return post<AIWorkReport>('/api/ai/assistant/reports', {
    reportType,
    reportScope,
    scopeId
  });
};

/**
 * 获取报告列表
 */
export const getWorkReports = (
  reportType?: string,
  limit: number = 20
): Promise<AIWorkReport[]> => {
  return get<AIWorkReport[]>('/api/ai/assistant/reports', { reportType, limit });
};

/**
 * 发送报告
 */
export const sendWorkReport = (
  reportId: number,
  recipients: string[],
  message?: string
): Promise<{ success: boolean; message: string; sentTo: string[] }> => {
  return post(`/api/ai/assistant/reports/${reportId}/send`, { recipients, message });
};

// ==================== 配置管理 ====================

/**
 * 获取AI助手配置
 */
export const getAssistantConfig = (): Promise<AIAssistantConfig> => {
  return get<AIAssistantConfig>('/api/ai/assistant/config');
};

/**
 * 保存AI助手配置
 */
export const saveAssistantConfig = (
  config: Partial<AIAssistantConfig>
): Promise<{ success: boolean; message: string }> => {
  return put('/api/ai/assistant/config', config);
};

// ==================== 导出所有API ====================

export default {
  // AA-001 智能问答
  createSession,
  getUserSessions,
  getSessionMessages,
  sendMessage,
  quickChat,
  
  // AA-002 任务指令
  executeTaskCommand,
  
  // AA-003 工作建议
  getWorkSuggestions,
  markSuggestionRead,
  feedbackSuggestion,
  
  // AA-004 文档摘要
  generateDocumentSummary,
  generateTextSummary,
  
  // AA-005 翻译功能
  translateText,
  detectLanguage,
  
  // AA-006 数据分析
  generateDataAnalysis,
  getAnalysisSuggestions,
  
  // AA-007 日程建议
  getScheduleSuggestions,
  applyScheduleSuggestion,
  
  // AA-008 报告生成
  generateWorkReport,
  getWorkReports,
  sendWorkReport,
  
  // 配置管理
  getAssistantConfig,
  saveAssistantConfig
};