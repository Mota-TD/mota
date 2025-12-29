/**
 * AI 模块状态管理
 * 使用 Zustand 管理 AI 功能相关状态
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import * as aiApi from '@/services/api/ai';
import * as aiAssistantApi from '@/services/api/aiAssistant';
import { claudeClient } from '../../../services/claude/claudeClient';
import type {
  DecomposeStatus,
  DecomposeSuggestionWithSelection,
  TaskDecomposeFormData,
  AssignmentRecommendation,
  AISuggestion,
  AIModuleConfig,
  AIUsageStats,
} from '../types';
import type {
  TaskDecompositionResponse,
  ProgressPrediction,
  RiskWarning,
  ProjectReport,
} from '@/services/api/ai';
import type { AIWorkSuggestion } from '@/services/api/aiAssistant';

// ==================== 状态接口 ====================

interface AIState {
  // 任务分解
  decomposeStatus: DecomposeStatus;
  decomposeSuggestions: DecomposeSuggestionWithSelection[];
  decomposeResult: TaskDecompositionResponse | null;
  decomposeError: string | null;

  // 分工推荐
  assignmentLoading: boolean;
  assignmentRecommendations: AssignmentRecommendation[];
  assignmentError: string | null;

  // 进度预测
  progressPrediction: ProgressPrediction | null;
  progressLoading: boolean;

  // 风险预警
  riskWarnings: RiskWarning[];
  riskLoading: boolean;

  // 项目报告
  projectReport: ProjectReport | null;
  reportLoading: boolean;

  // 工作建议
  workSuggestions: AIWorkSuggestion[];
  suggestionsLoading: boolean;

  // 通用 AI 建议
  aiSuggestions: AISuggestion[];

  // 配置
  config: AIModuleConfig;

  // 统计
  usageStats: AIUsageStats;

  // ==================== 操作方法 ====================

  // 任务分解
  generateTaskDecomposition: (data: TaskDecomposeFormData) => Promise<void>;
  toggleSuggestionSelection: (id: string) => void;
  updateSuggestion: (id: string, updates: Partial<DecomposeSuggestionWithSelection>) => void;
  selectAllSuggestions: () => void;
  deselectAllSuggestions: () => void;
  clearDecomposeResult: () => void;

  // 分工推荐
  fetchAssignmentRecommendations: (taskId: number) => Promise<void>;
  clearAssignmentRecommendations: () => void;

  // 进度预测
  fetchProgressPrediction: (projectId: string | number) => Promise<void>;

  // 风险预警
  fetchRiskWarnings: (projectId: string | number) => Promise<void>;

  // 项目报告
  generateProjectReport: (projectId: string | number, reportType: 'daily' | 'weekly' | 'monthly') => Promise<void>;

  // 工作建议
  fetchWorkSuggestions: () => Promise<void>;
  markSuggestionRead: (id: number) => Promise<void>;
  feedbackSuggestion: (id: number, accepted: boolean, comment?: string) => Promise<void>;

  // 配置
  updateConfig: (config: Partial<AIModuleConfig>) => void;

  // 重置
  reset: () => void;
}

// ==================== 初始状态 ====================

const initialConfig: AIModuleConfig = {
  enableAutoSuggestions: true,
  suggestionRefreshInterval: 30,
  maxSuggestionsPerType: 5,
  enableNotifications: true,
  preferredModel: 'gpt-4',
};

const initialUsageStats: AIUsageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  tokensUsed: 0,
};

const initialState = {
  decomposeStatus: 'idle' as DecomposeStatus,
  decomposeSuggestions: [] as DecomposeSuggestionWithSelection[],
  decomposeResult: null as TaskDecompositionResponse | null,
  decomposeError: null as string | null,

  assignmentLoading: false,
  assignmentRecommendations: [] as AssignmentRecommendation[],
  assignmentError: null as string | null,

  progressPrediction: null as ProgressPrediction | null,
  progressLoading: false,

  riskWarnings: [] as RiskWarning[],
  riskLoading: false,

  projectReport: null as ProjectReport | null,
  reportLoading: false,

  workSuggestions: [] as AIWorkSuggestion[],
  suggestionsLoading: false,

  aiSuggestions: [] as AISuggestion[],

  config: initialConfig,
  usageStats: initialUsageStats,
};

// ==================== 创建 Store ====================

export const useAIStore = create<AIState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // ==================== 任务分解 ====================

      generateTaskDecomposition: async (data: TaskDecomposeFormData) => {
        set({ decomposeStatus: 'loading', decomposeError: null });

        const startTime = Date.now();

        try {
          // 优先使用Claude API
          let result: TaskDecompositionResponse;
          
          try {
            const claudeResult = await claudeClient.generateTaskDecomposition({
              projectName: data.projectName,
              projectDescription: data.projectDescription,
              departments: data.departments,
              startDate: data.startDate,
              endDate: data.endDate,
            });

            // 转换Claude结果为标准格式
            result = {
              suggestions: claudeResult.suggestions,
              totalEstimatedDays: claudeResult.totalEstimatedDays,
              riskAssessment: claudeResult.riskAssessment,
              generatedAt: new Date().toISOString()
            };
          } catch (claudeError) {
            console.warn('Claude API失败，回退到原API:', claudeError);
            
            // 回退到原有的API
            result = await aiApi.generateTaskDecomposition({
              projectName: data.projectName,
              projectDescription: data.projectDescription,
              departments: data.departments,
              startDate: data.startDate,
              endDate: data.endDate,
            });
          }

          // 转换为带选择状态的建议
          const suggestionsWithSelection: DecomposeSuggestionWithSelection[] =
            result.suggestions.map((s) => ({
              ...s,
              selected: true,
              modified: false,
            }));

          set((state) => {
            state.decomposeStatus = 'success';
            state.decomposeResult = result;
            state.decomposeSuggestions = suggestionsWithSelection;
            state.usageStats.totalRequests++;
            state.usageStats.successfulRequests++;
            state.usageStats.averageResponseTime =
              (state.usageStats.averageResponseTime * (state.usageStats.totalRequests - 1) +
               (Date.now() - startTime)) / state.usageStats.totalRequests;
            state.usageStats.lastRequestAt = new Date().toISOString();
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'AI 任务分解失败';
          set((state) => {
            state.decomposeStatus = 'error';
            state.decomposeError = errorMessage;
            state.usageStats.totalRequests++;
            state.usageStats.failedRequests++;
          });
        }
      },

      toggleSuggestionSelection: (id: string) => {
        set((state) => {
          const suggestion = state.decomposeSuggestions.find(
            (s: DecomposeSuggestionWithSelection) => s.id === id
          );
          if (suggestion) {
            suggestion.selected = !suggestion.selected;
          }
        });
      },

      updateSuggestion: (id: string, updates: Partial<DecomposeSuggestionWithSelection>) => {
        set((state) => {
          const idx = state.decomposeSuggestions.findIndex(
            (s: DecomposeSuggestionWithSelection) => s.id === id
          );
          if (idx !== -1) {
            state.decomposeSuggestions[idx] = {
              ...state.decomposeSuggestions[idx],
              ...updates,
              modified: true,
            };
          }
        });
      },

      selectAllSuggestions: () => {
        set((state) => {
          state.decomposeSuggestions.forEach((s: DecomposeSuggestionWithSelection) => {
            s.selected = true;
          });
        });
      },

      deselectAllSuggestions: () => {
        set((state) => {
          state.decomposeSuggestions.forEach((s: DecomposeSuggestionWithSelection) => {
            s.selected = false;
          });
        });
      },

      clearDecomposeResult: () => {
        set({
          decomposeStatus: 'idle',
          decomposeSuggestions: [],
          decomposeResult: null,
          decomposeError: null,
        });
      },

      // ==================== 分工推荐 ====================

      fetchAssignmentRecommendations: async (taskId: number) => {
        set({ assignmentLoading: true, assignmentError: null });

        try {
          // 优先使用Claude API（如果有必要的数据）
          let result: any;
          
          try {
            // 这里需要从其他store获取任务和团队成员信息
            // 暂时先使用原API，后续可以扩展
            result = await aiApi.suggestTaskAssignment(taskId);
          } catch (claudeError) {
            console.warn('Claude分工推荐失败，使用原API:', claudeError);
            result = await aiApi.suggestTaskAssignment(taskId);
          }

          const recommendations: AssignmentRecommendation[] = result.suggestedAssignees.map((a: any) => ({
            userId: String(a.userId),
            userName: a.userName,
            matchScore: a.matchScore,
            currentWorkload: a.currentWorkload,
            skills: [],
            reason: a.reason,
            availability: a.currentWorkload > 80 ? 'overloaded' : a.currentWorkload > 50 ? 'busy' : 'available',
          }));

          set({
            assignmentRecommendations: recommendations,
            assignmentLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : '获取分工推荐失败';
          set({
            assignmentError: errorMessage,
            assignmentLoading: false,
          });
        }
      },

      clearAssignmentRecommendations: () => {
        set({
          assignmentRecommendations: [],
          assignmentError: null,
        });
      },

      // ==================== 进度预测 ====================

      fetchProgressPrediction: async (projectId: string | number) => {
        set({ progressLoading: true });

        try {
          const prediction = await aiApi.predictProjectProgress(projectId);
          set({
            progressPrediction: prediction,
            progressLoading: false,
          });
        } catch (error) {
          console.error('获取进度预测失败:', error);
          set({ progressLoading: false });
        }
      },

      // ==================== 风险预警 ====================

      fetchRiskWarnings: async (projectId: string | number) => {
        set({ riskLoading: true });

        try {
          let warnings: RiskWarning[] = [];
          
          try {
            // 尝试使用Claude API生成风险预警
            // 这里需要获取项目和任务数据
            // 暂时先使用原API
            warnings = await aiApi.getProjectRiskWarnings(projectId);
          } catch (claudeError) {
            console.warn('Claude风险分析失败，使用原API:', claudeError);
            warnings = await aiApi.getProjectRiskWarnings(projectId);
          }
          
          set({
            riskWarnings: warnings,
            riskLoading: false,
          });
        } catch (error) {
          console.error('获取风险预警失败:', error);
          set({ riskLoading: false });
        }
      },

      // ==================== 项目报告 ====================

      generateProjectReport: async (projectId: string | number, reportType: 'daily' | 'weekly' | 'monthly') => {
        set({ reportLoading: true });

        try {
          const report = await aiApi.generateProjectReport(projectId, reportType);
          set({
            projectReport: report,
            reportLoading: false,
          });
        } catch (error) {
          console.error('生成项目报告失败:', error);
          set({ reportLoading: false });
        }
      },

      // ==================== 工作建议 ====================

      fetchWorkSuggestions: async () => {
        set({ suggestionsLoading: true });

        try {
          const suggestions = await aiAssistantApi.getWorkSuggestions();
          set({
            workSuggestions: suggestions,
            suggestionsLoading: false,
          });
        } catch (error) {
          console.error('获取工作建议失败:', error);
          set({ suggestionsLoading: false });
        }
      },

      markSuggestionRead: async (id: number) => {
        try {
          await aiAssistantApi.markSuggestionRead(id);
          set((state) => {
            const suggestion = state.workSuggestions.find(
              (s: AIWorkSuggestion) => s.id === id
            );
            if (suggestion) {
              suggestion.isRead = true;
            }
          });
        } catch (error) {
          console.error('标记建议已读失败:', error);
        }
      },

      feedbackSuggestion: async (id: number, accepted: boolean, comment?: string) => {
        try {
          await aiAssistantApi.feedbackSuggestion(id, accepted, comment);
          set((state) => {
            const suggestion = state.workSuggestions.find(
              (s: AIWorkSuggestion) => s.id === id
            );
            if (suggestion) {
              suggestion.isAccepted = accepted;
              suggestion.isDismissed = !accepted;
              if (comment) {
                suggestion.feedbackComment = comment;
              }
            }
          });
        } catch (error) {
          console.error('反馈建议失败:', error);
        }
      },

      // ==================== 配置 ====================

      updateConfig: (newConfig: Partial<AIModuleConfig>) => {
        set((state) => {
          state.config = { ...state.config, ...newConfig };
        });
      },

      // ==================== 重置 ====================

      reset: () => {
        set(initialState);
      },
    })),
    { name: 'AIStore' }
  )
);

// ==================== 选择器 ====================

export const useDecomposeStatus = () => useAIStore((state) => state.decomposeStatus);
export const useDecomposeSuggestions = () => useAIStore((state) => state.decomposeSuggestions);
export const useDecomposeResult = () => useAIStore((state) => state.decomposeResult);
export const useDecomposeError = () => useAIStore((state) => state.decomposeError);

export const useAssignmentRecommendations = () => useAIStore((state) => state.assignmentRecommendations);
export const useAssignmentLoading = () => useAIStore((state) => state.assignmentLoading);

export const useProgressPrediction = () => useAIStore((state) => state.progressPrediction);
export const useRiskWarnings = () => useAIStore((state) => state.riskWarnings);
export const useProjectReport = () => useAIStore((state) => state.projectReport);

export const useWorkSuggestions = () => useAIStore((state) => state.workSuggestions);
export const useAIConfig = () => useAIStore((state) => state.config);
export const useAIUsageStats = () => useAIStore((state) => state.usageStats);

// 计算属性选择器
export const useSelectedSuggestions = () => {
  const suggestions = useAIStore((state) => state.decomposeSuggestions);
  return suggestions.filter((s) => s.selected);
};

export const useUnreadSuggestions = () => {
  const suggestions = useAIStore((state) => state.workSuggestions);
  return suggestions.filter((s) => !s.isRead);
};

export const useHighPriorityWarnings = () => {
  const warnings = useAIStore((state) => state.riskWarnings);
  return warnings.filter((w) => w.severity === 'high' || w.severity === 'critical');
};