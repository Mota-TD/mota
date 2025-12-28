/**
 * 任务模块导出
 */

// 类型导出
export * from './types';

// Store 导出
export * from './store/taskStore';

// 工具函数导出
export * from './utils/statusFlow';

// Hooks 导出
export { useStatusFlow, useBatchStatusFlow, useStatusStats } from './hooks/useStatusFlow';
export {
  useMilestoneAssociation,
  useMilestoneProgress,
  useMilestoneTimeline,
  useMilestoneSelector
} from './hooks/useMilestoneAssociation';

// 组件导出
export { default as TaskTree } from './components/TaskTree';
export type { TaskTreeProps } from './components/TaskTree';
export { useTaskTree } from './components/TaskTree/useTaskTree';

export { default as TaskKanban } from './components/TaskKanban';
export type { TaskKanbanProps } from './components/TaskKanban';
export { useTaskKanban, useColumnSort, useKanbanFilter } from './components/TaskKanban/useTaskKanban';

export { default as TaskDetail } from './components/TaskDetail';
export type { TaskDetailProps } from './components/TaskDetail';
export { useTaskDetail, useTaskProgress, useTotalTimeSpent } from './components/TaskDetail/useTaskDetail';

export { default as TaskForm } from './components/TaskForm';
export type { TaskFormProps } from './components/TaskForm';
export { useTaskForm, useAssigneeOptions, useDepartmentTaskOptions } from './components/TaskForm/useTaskForm';