/**
 * AI 模块类型定义
 */

// 从现有 API 重新导出类型
export {
  type TaskDecompositionSuggestion,
  type TaskDecompositionRequest,
  type TaskDecompositionResponse,
  type ProgressPrediction,
  type RiskWarning,
  type ProjectReport,
} from '@/services/api/ai';

export {
  type AIWorkSuggestion,
  type AITaskCommand,
  type AIChatSession,
  type AIChatMessage,
  type ChatResponse,
  type IntentResult,
} from '@/services/api/aiAssistant';

// ============ 模块扩展类型 ============

/**
 * AI 任务分解状态
 */
export type DecomposeStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * AI 任务分解结果（带选择状态）
 */
export interface DecomposeSuggestionWithSelection {
  id: string;
  name: string;
  description: string;
  suggestedDepartment?: string;
  suggestedPriority: string;
  estimatedDays: number;
  dependencies?: string[];
  selected: boolean;
  modified: boolean;
}

/**
 * AI 任务分解表单数据
 */
export interface TaskDecomposeFormData {
  projectName: string;
  projectDescription: string;
  departments: string[];
  startDate?: string;
  endDate?: string;
}

/**
 * AI 分工推荐
 */
export interface AssignmentRecommendation {
  userId: string;
  userName: string;
  userAvatar?: string;
  matchScore: number;
  currentWorkload: number;
  skills: string[];
  reason: string;
  availability: 'available' | 'busy' | 'overloaded';
}

/**
 * AI 分工推荐请求
 */
export interface AssignmentRecommendationRequest {
  taskId: string;
  taskName: string;
  taskDescription?: string;
  requiredSkills?: string[];
  estimatedHours?: number;
  deadline?: string;
}

/**
 * AI 分工推荐响应
 */
export interface AssignmentRecommendationResponse {
  recommendations: AssignmentRecommendation[];
  bestMatch?: AssignmentRecommendation;
  analysisNote: string;
}

/**
 * AI 建议类型
 */
export type AISuggestionType = 
  | 'task_decompose'
  | 'assignment'
  | 'priority'
  | 'schedule'
  | 'risk'
  | 'progress';

/**
 * AI 建议基础接口
 */
export interface AISuggestionBase {
  id: string;
  type: AISuggestionType;
  title: string;
  description: string;
  confidence: number;
  createdAt: string;
  isApplied: boolean;
  isDismissed: boolean;
}

/**
 * AI 任务分解建议
 */
export interface TaskDecomposeSuggestion extends AISuggestionBase {
  type: 'task_decompose';
  suggestions: DecomposeSuggestionWithSelection[];
  totalEstimatedDays: number;
  riskAssessment: string;
}

/**
 * AI 分工建议
 */
export interface AssignmentSuggestion extends AISuggestionBase {
  type: 'assignment';
  taskId: string;
  taskName: string;
  recommendations: AssignmentRecommendation[];
}

/**
 * AI 优先级建议
 */
export interface PrioritySuggestion extends AISuggestionBase {
  type: 'priority';
  taskId: string;
  currentPriority: string;
  suggestedPriority: string;
  reason: string;
}

/**
 * AI 日程建议
 */
export interface ScheduleSuggestion extends AISuggestionBase {
  type: 'schedule';
  affectedTasks: string[];
  suggestedChanges: Array<{
    taskId: string;
    taskName: string;
    currentDate: string;
    suggestedDate: string;
    reason: string;
  }>;
}

/**
 * AI 风险建议
 */
export interface RiskSuggestion extends AISuggestionBase {
  type: 'risk';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedTasks: string[];
  mitigationSteps: string[];
}

/**
 * AI 进度建议
 */
export interface ProgressSuggestion extends AISuggestionBase {
  type: 'progress';
  projectId: string;
  currentProgress: number;
  predictedProgress: number;
  predictedCompletionDate: string;
  factors: string[];
}

/**
 * 所有 AI 建议类型联合
 */
export type AISuggestion = 
  | TaskDecomposeSuggestion
  | AssignmentSuggestion
  | PrioritySuggestion
  | ScheduleSuggestion
  | RiskSuggestion
  | ProgressSuggestion;

/**
 * AI 模块配置
 */
export interface AIModuleConfig {
  enableAutoSuggestions: boolean;
  suggestionRefreshInterval: number; // 分钟
  maxSuggestionsPerType: number;
  enableNotifications: boolean;
  preferredModel: string;
}

/**
 * AI 使用统计
 */
export interface AIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  tokensUsed: number;
  lastRequestAt?: string;
}