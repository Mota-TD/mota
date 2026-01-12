import request from '../request';

// ==================== 类型定义 ====================

// 方案会话
export interface ProposalSession {
  id: number;
  userId: number;
  title: string;
  proposalType: string;
  status: string;
  messageCount: number;
  context?: string;
  createdAt: string;
  updatedAt: string;
}

// 方案内容
export interface ProposalContent {
  id: number;
  sessionId: number;
  title: string;
  proposalType: string;
  templateId?: number;
  content: string;
  outline?: string;
  summary?: string;
  wordCount: number;
  status: string;
  qualityScore: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// 需求分析
export interface RequirementAnalysis {
  id: number;
  sessionId: number;
  originalInput: string;
  intentType: string;
  keyElements?: string;
  constraints?: string;
  targetAudience?: string;
  expectedOutput?: string;
  confidenceScore: number;
  createdAt: string;
}

// 方案章节
export interface ProposalSection {
  id: number;
  proposalId: number;
  parentId?: number;
  sectionNumber: string;
  title: string;
  content: string;
  level: number;
  sortOrder: number;
  wordCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 图表建议
export interface ChartSuggestion {
  id: number;
  proposalId: number;
  sectionId?: number;
  chartType: string;
  title: string;
  description?: string;
  dataSource?: string;
  sampleData?: string;
  chartConfig?: string;
  position?: string;
  isApplied: boolean;
  createdAt: string;
}

// 质量检查
export interface QualityCheck {
  id: number;
  proposalId: number;
  versionId?: number;
  checkType: string;
  checkItem: string;
  result: string;
  score: number;
  issue?: string;
  suggestion?: string;
  location?: string;
  isFixed: boolean;
  fixedAt?: string;
  createdAt: string;
}

// 方案版本
export interface ProposalVersion {
  id: number;
  proposalId: number;
  versionNumber: string;
  versionType: string;
  contentSnapshot?: string;
  changeDescription?: string;
  changeType: string;
  qualityScore: number;
  isCurrent: boolean;
  createdBy: number;
  createdAt: string;
}

// 方案导出
export interface ProposalExport {
  id: number;
  proposalId: number;
  versionId?: number;
  exportFormat: string;
  templateId?: number;
  fileName: string;
  filePath?: string;
  fileSize?: number;
  status: string;
  errorMessage?: string;
  downloadCount: number;
  expiresAt?: string;
  createdBy: number;
  createdAt: string;
}

// 方案模板
export interface ProposalTemplate {
  id: number;
  name: string;
  description?: string;
  templateType: string;
  industry?: string;
  sectionStructure?: string;
  promptTemplates?: string;
  defaultConfig?: string;
  sampleContent?: string;
  usageCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// 意图解析结果
export interface IntentParseResult {
  intentType: string;
  keywords: string[];
  confidence: number;
  suggestedType: string;
}

// 知识检索结果
export interface KnowledgeRetrievalResult {
  id: number;
  title: string;
  content: string;
  relevanceScore: number;
  source: string;
}

// 方案评估结果
export interface ProposalEvaluation {
  score: number;
  completeness: number;
  clarity: number;
  feasibility: number;
  suggestions: string[];
}

// 会话消息
export interface SessionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 任务建议
export interface TaskSuggestion {
  title: string;
  description: string;
  priority: string;
  reason: string;
}

// 数据分析结果
export interface DataAnalysisResult {
  analysisType: string;
  summary: string;
  insights: string[];
  recommendations: string[];
}

// ==================== 会话管理 ====================

/**
 * 创建方案会话
 */
export const createProposalSession = (userId: number, title: string, proposalType?: string) => {
  let url = `/api/ai/proposal/sessions?userId=${userId}&title=${encodeURIComponent(title)}`;
  if (proposalType) {
    url += `&proposalType=${encodeURIComponent(proposalType)}`;
  }
  return request.post<ProposalSession>(url);
};

/**
 * 获取用户会话列表
 */
export const getUserSessions = (userId: number) => {
  return request.get<ProposalSession[]>(`/api/ai/proposal/sessions?userId=${userId}`);
};

// ==================== AG-001 意图识别 ====================

/**
 * 解析用户意图
 */
export const parseIntent = (sessionId: number, userInput: string) => {
  return request.post<IntentParseResult>(`/api/ai/proposal/intent/parse?sessionId=${sessionId}`, userInput);
};

// ==================== AG-002 需求解析 ====================

/**
 * 分析需求
 */
export const analyzeRequirement = (sessionId: number, userInput: string) => {
  return request.post<RequirementAnalysis>(`/api/ai/proposal/requirement/analyze?sessionId=${sessionId}`, userInput);
};

// ==================== AG-003 知识检索 ====================

/**
 * 检索相关知识
 */
export const retrieveKnowledge = (sessionId: number, query: string, knowledgeBaseIds?: number[]) => {
  let url = `/api/ai/proposal/knowledge/retrieve?sessionId=${sessionId}&query=${encodeURIComponent(query)}`;
  if (knowledgeBaseIds && knowledgeBaseIds.length > 0) {
    url += `&knowledgeBaseIds=${knowledgeBaseIds.join(',')}`;
  }
  return request.post<KnowledgeRetrievalResult[]>(url);
};

// ==================== AG-004 历史参考 ====================

/**
 * 获取历史参考
 */
export const getHistoricalReferences = (userId: number, proposalType?: string, limit?: number) => {
  let url = `/api/ai/proposal/history/references?userId=${userId}`;
  if (proposalType) {
    url += `&proposalType=${encodeURIComponent(proposalType)}`;
  }
  if (limit) {
    url += `&limit=${limit}`;
  }
  return request.get<ProposalContent[]>(url);
};

// ==================== AG-005 方案生成 ====================

/**
 * 生成方案
 */
export const generateProposal = (sessionId: number, requirementId: number, templateId?: number) => {
  let url = `/api/ai/proposal/generate?sessionId=${sessionId}&requirementId=${requirementId}`;
  if (templateId) {
    url += `&templateId=${templateId}`;
  }
  return request.post<ProposalContent>(url);
};

/**
 * 获取方案详情
 */
export const getProposalDetail = (proposalId: number) => {
  return request.get<ProposalContent>(`/api/ai/proposal/${proposalId}`);
};

// ==================== AG-006 章节编排 ====================

/**
 * 获取方案章节
 */
export const getProposalSections = (proposalId: number) => {
  return request.get<ProposalSection[]>(`/api/ai/proposal/${proposalId}/sections`);
};

/**
 * 更新章节
 */
export const updateSection = (sectionId: number, title: string, content: string) => {
  return request.put<ProposalSection>(`/api/ai/proposal/sections/${sectionId}?title=${encodeURIComponent(title)}`, content);
};

/**
 * 调整章节顺序
 */
export const reorderSections = (proposalId: number, sectionIds: number[]) => {
  return request.post<void>(`/api/ai/proposal/${proposalId}/sections/reorder`, sectionIds);
};

// ==================== AG-007 图表建议 ====================

/**
 * 生成图表建议
 */
export const generateChartSuggestions = (proposalId: number) => {
  return request.post<ChartSuggestion[]>(`/api/ai/proposal/${proposalId}/charts/suggest`);
};

/**
 * 应用图表建议
 */
export const applyChartSuggestion = (suggestionId: number, chartConfig?: string) => {
  return request.post<void>(`/api/ai/proposal/charts/${suggestionId}/apply`, chartConfig);
};

// ==================== AG-008 质量检查 ====================

/**
 * 执行质量检查
 */
export const performQualityCheck = (proposalId: number, versionId?: number) => {
  let url = `/api/ai/proposal/${proposalId}/quality/check`;
  if (versionId) {
    url += `?versionId=${versionId}`;
  }
  return request.post<QualityCheck[]>(url);
};

// ==================== AG-009 多轮优化 ====================

/**
 * 获取版本列表
 */
export const getProposalVersions = (proposalId: number) => {
  return request.get<ProposalVersion[]>(`/api/ai/proposal/${proposalId}/versions`);
};

/**
 * 创建新版本
 */
export const createVersion = (proposalId: number, versionNumber: string, versionType?: string, changeDescription?: string) => {
  let url = `/api/ai/proposal/${proposalId}/versions?versionNumber=${encodeURIComponent(versionNumber)}`;
  if (versionType) {
    url += `&versionType=${encodeURIComponent(versionType)}`;
  }
  if (changeDescription) {
    url += `&changeDescription=${encodeURIComponent(changeDescription)}`;
  }
  return request.post<ProposalVersion>(url);
};

/**
 * 优化方案
 */
export const optimizeProposal = (proposalId: number, feedback: string) => {
  return request.post<ProposalContent>(`/api/ai/proposal/${proposalId}/optimize`, feedback);
};

/**
 * 回滚到指定版本
 */
export const rollbackToVersion = (proposalId: number, versionId: number) => {
  return request.post<ProposalContent>(`/api/ai/proposal/${proposalId}/rollback/${versionId}`);
};

// ==================== AG-010 方案导出 ====================

/**
 * 导出方案
 */
export const exportProposal = (proposalId: number, format: string, versionId?: number, templateId?: number) => {
  let url = `/api/ai/proposal/${proposalId}/export?format=${encodeURIComponent(format)}`;
  if (versionId) {
    url += `&versionId=${versionId}`;
  }
  if (templateId) {
    url += `&templateId=${templateId}`;
  }
  return request.post<ProposalExport>(url);
};

/**
 * 下载导出文件
 */
export const downloadExport = (exportId: number) => {
  return request.get<ProposalExport>(`/api/ai/proposal/exports/${exportId}/download`);
};

// ==================== 模板管理 ====================

/**
 * 获取模板列表
 */
export const getProposalTemplates = (type?: string, industry?: string) => {
  let url = '/api/ai/proposal/templates';
  const params: string[] = [];
  if (type) {
    params.push(`type=${encodeURIComponent(type)}`);
  }
  if (industry) {
    params.push(`industry=${encodeURIComponent(industry)}`);
  }
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  return request.get<ProposalTemplate[]>(url);
};

// ==================== 兼容旧接口（使用 legacy 路径） ====================

export const generateProjectProposal = (
  requirement: string,
  projectType: string,
  context?: Record<string, unknown>
) => {
  let url = `/api/ai/proposal/legacy/project?requirement=${encodeURIComponent(requirement)}&projectType=${encodeURIComponent(projectType)}`;
  return request.post<string>(url, context || {});
};

export const generateTechnicalProposal = (
  requirement: string,
  techStack: string[],
  constraints?: Record<string, unknown>
) => {
  return request.post<string>(`/api/ai/proposal/legacy/technical?requirement=${encodeURIComponent(requirement)}`, {
    techStack,
    constraints
  });
};

export const generateMarketingProposal = (
  product: string,
  targetAudience: string,
  budget?: number
) => {
  let url = `/api/ai/proposal/legacy/marketing?product=${encodeURIComponent(product)}&targetAudience=${encodeURIComponent(targetAudience)}`;
  if (budget) {
    url += `&budget=${budget}`;
  }
  return request.post<string>(url);
};

export const generateBusinessPlan = (
  businessIdea: string,
  industry: string,
  scale: string
) => {
  return request.post<string>(
    `/api/ai/proposal/legacy/business-plan?businessIdea=${encodeURIComponent(businessIdea)}&industry=${encodeURIComponent(industry)}&scale=${encodeURIComponent(scale)}`
  );
};

export const generateWorkReport = (
  projectId: number,
  reportType: string,
  period: string
) => {
  return request.post<string>(
    `/api/ai/proposal/legacy/work-report?projectId=${projectId}&reportType=${encodeURIComponent(reportType)}&period=${encodeURIComponent(period)}`
  );
};

export const expandProposalSection = (proposal: string, section: string) => {
  return request.post<string>('/api/ai/proposal/legacy/expand', {
    proposal,
    section
  });
};

export const evaluateProposal = (proposal: string) => {
  return request.post<ProposalEvaluation>('/api/ai/proposal/legacy/evaluate', proposal);
};

export const generateProposalWithKnowledge = (
  requirement: string,
  knowledgeBaseIds: number[]
) => {
  return request.post<string>(
    `/api/ai/proposal/legacy/with-knowledge?requirement=${encodeURIComponent(requirement)}`,
    knowledgeBaseIds
  );
};

export const searchRelatedProposals = (requirement: string, limit = 5) => {
  return request.get<Array<{ id: number; title: string; similarity: number }>>(
    `/api/ai/proposal/legacy/search-related?requirement=${encodeURIComponent(requirement)}&limit=${limit}`
  );
};

export const startProposalSession = (userId: number, proposalType: string) => {
  return request.post<string>(
    `/api/ai/proposal/legacy/session/start?userId=${userId}&proposalType=${encodeURIComponent(proposalType)}`
  );
};

export const continueProposalSession = (sessionId: string, userMessage: string) => {
  return request.post<string>(`/api/ai/proposal/legacy/session/${sessionId}/continue`, userMessage);
};

export const getSessionHistory = (sessionId: string) => {
  return request.get<SessionMessage[]>(`/api/ai/proposal/legacy/session/${sessionId}/history`);
};

export const finalizeProposalSession = (sessionId: string) => {
  return request.post<string>(`/api/ai/proposal/legacy/session/${sessionId}/finalize`);
};

export const generateFromTemplate = (templateId: number, variables: Record<string, unknown>) => {
  return request.post<string>(`/api/ai/proposal/legacy/from-template/${templateId}`, variables);
};

export const askQuestion = (question: string, context?: Record<string, unknown>) => {
  return request.post<string>(`/api/ai/proposal/legacy/ask?question=${encodeURIComponent(question)}`, context || {});
};

export const generateDocumentSummary = (documentId: number, maxLength = 500) => {
  return request.get<string>(`/api/ai/proposal/legacy/document/${documentId}/summary?maxLength=${maxLength}`);
};

export const generateMeetingMinutes = (meetingNotes: string) => {
  return request.post<string>('/api/ai/proposal/legacy/meeting-minutes', meetingNotes);
};

export const suggestTasks = (projectId: number, currentTasks?: number[]) => {
  return request.post<TaskSuggestion[]>(
    `/api/ai/proposal/legacy/suggest-tasks?projectId=${projectId}`,
    currentTasks || []
  );
};

export const analyzeData = (data: Record<string, unknown>, analysisType: string) => {
  return request.post<DataAnalysisResult>(
    `/api/ai/proposal/legacy/analyze-data?analysisType=${encodeURIComponent(analysisType)}`,
    data
  );
};

// ==================== 辅助函数 ====================

/**
 * 方案类型选项
 */
export const proposalTypes = [
  { value: 'technical', label: '技术方案' },
  { value: 'business', label: '商业方案' },
  { value: 'research', label: '研究报告' },
  { value: 'report', label: '工作报告' },
  { value: 'general', label: '通用方案' }
];

/**
 * 导出格式选项
 */
export const exportFormats = [
  { value: 'word', label: 'Word文档' },
  { value: 'pdf', label: 'PDF文档' },
  { value: 'ppt', label: 'PPT演示' },
  { value: 'html', label: 'HTML网页' },
  { value: 'markdown', label: 'Markdown' }
];

/**
 * 图表类型选项
 */
export const chartTypes = [
  { value: 'bar', label: '柱状图' },
  { value: 'line', label: '折线图' },
  { value: 'pie', label: '饼图' },
  { value: 'table', label: '表格' },
  { value: 'flow', label: '流程图' },
  { value: 'gantt', label: '甘特图' }
];

/**
 * 质量检查类型
 */
export const qualityCheckTypes = [
  { value: 'completeness', label: '完整性' },
  { value: 'consistency', label: '一致性' },
  { value: 'accuracy', label: '准确性' },
  { value: 'format', label: '格式规范' },
  { value: 'language', label: '语言表达' }
];

/**
 * 报告类型选项
 */
export const reportTypes = [
  { value: 'weekly', label: '周报' },
  { value: 'monthly', label: '月报' },
  { value: 'quarterly', label: '季报' },
  { value: 'annual', label: '年报' }
];

/**
 * 格式化方案评估分数
 */
export const formatEvaluationScore = (score: number): string => {
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '中等';
  if (score >= 60) return '及格';
  return '需改进';
};

/**
 * 获取评估分数颜色
 */
export const getEvaluationScoreColor = (score: number): string => {
  if (score >= 90) return '#52c41a';
  if (score >= 80) return '#1890ff';
  if (score >= 70) return '#faad14';
  if (score >= 60) return '#fa8c16';
  return '#f5222d';
};

/**
 * 获取质量检查结果颜色
 */
export const getQualityResultColor = (result: string): string => {
  switch (result) {
    case 'pass': return '#52c41a';
    case 'warning': return '#faad14';
    case 'fail': return '#f5222d';
    default: return '#999';
  }
};

/**
 * 获取导出状态颜色
 */
export const getExportStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#52c41a';
    case 'processing': return '#1890ff';
    case 'pending': return '#faad14';
    case 'failed': return '#f5222d';
    default: return '#999';
  }
};