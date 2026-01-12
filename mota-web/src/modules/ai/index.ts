/**
 * AI 模块导出
 */

// 类型导出
export * from './types';

// Store 导出
export * from './store/aiStore';

// Hooks 导出
export {
  useTaskDecompose,
  useDecomposeFormValidation,
  useDecomposeStats
} from './hooks/useTaskDecompose';

export {
  useAssignmentRecommendation,
  useWorkloadAnalysis,
  useMatchScoreAnalysis,
  useSortedRecommendations
} from './hooks/useAssignmentRecommendation';

// 组件导出
export { default as TaskDecompose } from './components/TaskDecompose';
export type { TaskDecomposeProps } from './components/TaskDecompose';

export { default as AISuggestionPanel } from './components/AISuggestionPanel';
export type { AISuggestionPanelProps } from './components/AISuggestionPanel';