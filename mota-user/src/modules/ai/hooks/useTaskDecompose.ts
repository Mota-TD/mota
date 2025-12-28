/**
 * AI 任务分解 Hook
 * 提供 AI 任务分解功能的封装
 */

import { useCallback, useMemo } from 'react';
import { message } from 'antd';
import { useAIStore } from '../store/aiStore';
import { useTaskStore } from '@/modules/task/store/taskStore';
import type {
  TaskDecomposeFormData,
  DecomposeSuggestionWithSelection
} from '../types';
import type { CreateDepartmentTaskRequest } from '@/modules/task/types';
import { Priority } from '@/services/api/departmentTask';

interface UseTaskDecomposeOptions {
  projectId: string;
  defaultDepartmentId?: string;
  defaultManagerId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseTaskDecomposeReturn {
  // 状态
  status: 'idle' | 'loading' | 'success' | 'error';
  suggestions: DecomposeSuggestionWithSelection[];
  selectedSuggestions: DecomposeSuggestionWithSelection[];
  totalEstimatedDays: number;
  riskAssessment: string | null;
  error: string | null;

  // 操作
  generateDecomposition: (data: TaskDecomposeFormData) => Promise<void>;
  toggleSelection: (id: string) => void;
  updateSuggestion: (id: string, updates: Partial<DecomposeSuggestionWithSelection>) => void;
  selectAll: () => void;
  deselectAll: () => void;
  applySelectedSuggestions: () => Promise<void>;
  clear: () => void;
}

/**
 * AI 任务分解 Hook
 */
export function useTaskDecompose(options: UseTaskDecomposeOptions): UseTaskDecomposeReturn {
  const { projectId, defaultDepartmentId, defaultManagerId, onSuccess, onError } = options;

  // 从 AI Store 获取状态
  const status = useAIStore((state) => state.decomposeStatus);
  const suggestions = useAIStore((state) => state.decomposeSuggestions);
  const result = useAIStore((state) => state.decomposeResult);
  const error = useAIStore((state) => state.decomposeError);

  // AI Store 操作
  const generateTaskDecomposition = useAIStore((state) => state.generateTaskDecomposition);
  const toggleSuggestionSelection = useAIStore((state) => state.toggleSuggestionSelection);
  const updateSuggestionInStore = useAIStore((state) => state.updateSuggestion);
  const selectAllSuggestions = useAIStore((state) => state.selectAllSuggestions);
  const deselectAllSuggestions = useAIStore((state) => state.deselectAllSuggestions);
  const clearDecomposeResult = useAIStore((state) => state.clearDecomposeResult);

  // Task Store 操作
  const createDepartmentTask = useTaskStore((state) => state.createDepartmentTask);

  // 计算选中的建议
  const selectedSuggestions = useMemo(() => {
    return suggestions.filter((s) => s.selected);
  }, [suggestions]);

  // 生成任务分解
  const generateDecomposition = useCallback(
    async (data: TaskDecomposeFormData) => {
      try {
        await generateTaskDecomposition(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'AI 任务分解失败';
        onError?.(errorMessage);
      }
    },
    [generateTaskDecomposition, onError]
  );

  // 切换选择
  const toggleSelection = useCallback(
    (id: string) => {
      toggleSuggestionSelection(id);
    },
    [toggleSuggestionSelection]
  );

  // 更新建议
  const updateSuggestion = useCallback(
    (id: string, updates: Partial<DecomposeSuggestionWithSelection>) => {
      updateSuggestionInStore(id, updates);
    },
    [updateSuggestionInStore]
  );

  // 全选
  const selectAll = useCallback(() => {
    selectAllSuggestions();
  }, [selectAllSuggestions]);

  // 取消全选
  const deselectAll = useCallback(() => {
    deselectAllSuggestions();
  }, [deselectAllSuggestions]);

  // 应用选中的建议（创建部门任务）
  const applySelectedSuggestions = useCallback(async () => {
    if (selectedSuggestions.length === 0) {
      message.warning('请至少选择一个任务建议');
      return;
    }

    if (!defaultDepartmentId || !defaultManagerId) {
      message.warning('请先设置默认部门和负责人');
      return;
    }

    const hideLoading = message.loading('正在创建任务...', 0);

    try {
      // 按依赖顺序创建任务
      const createdTasks: Map<string, string> = new Map();

      for (const suggestion of selectedSuggestions) {
        const taskData: CreateDepartmentTaskRequest = {
          projectId,
          departmentId: suggestion.suggestedDepartment || defaultDepartmentId,
          managerId: defaultManagerId,
          name: suggestion.name,
          description: suggestion.description,
          priority: mapPriority(suggestion.suggestedPriority),
        };

        const createdTask = await createDepartmentTask(taskData);
        createdTasks.set(suggestion.id, createdTask.id);
      }

      hideLoading();
      message.success(`成功创建 ${selectedSuggestions.length} 个任务`);
      onSuccess?.();
      clearDecomposeResult();
    } catch (err) {
      hideLoading();
      const errorMessage = err instanceof Error ? err.message : '创建任务失败';
      message.error(errorMessage);
      onError?.(errorMessage);
    }
  }, [selectedSuggestions, projectId, defaultDepartmentId, defaultManagerId, createDepartmentTask, onSuccess, onError, clearDecomposeResult]);

  // 清除结果
  const clear = useCallback(() => {
    clearDecomposeResult();
  }, [clearDecomposeResult]);

  return {
    status,
    suggestions,
    selectedSuggestions,
    totalEstimatedDays: result?.totalEstimatedDays || 0,
    riskAssessment: result?.riskAssessment || null,
    error,
    generateDecomposition,
    toggleSelection,
    updateSuggestion,
    selectAll,
    deselectAll,
    applySelectedSuggestions,
    clear,
  };
}

/**
 * 映射优先级
 */
function mapPriority(suggestedPriority: string): Priority {
  const priorityMap: Record<string, Priority> = {
    low: Priority.LOW,
    medium: Priority.MEDIUM,
    high: Priority.HIGH,
    urgent: Priority.URGENT,
    critical: Priority.URGENT,
  };
  return priorityMap[suggestedPriority.toLowerCase()] || Priority.MEDIUM;
}

/**
 * 任务分解表单验证 Hook
 */
export function useDecomposeFormValidation() {
  const validateForm = useCallback((data: TaskDecomposeFormData): string | null => {
    if (!data.projectName?.trim()) {
      return '请输入项目名称';
    }
    if (!data.projectDescription?.trim()) {
      return '请输入项目描述';
    }
    if (data.projectDescription.length < 20) {
      return '项目描述至少需要20个字符，以便 AI 更好地理解需求';
    }
    if (!data.departments || data.departments.length === 0) {
      return '请选择至少一个参与部门';
    }
    return null;
  }, []);

  return { validateForm };
}

/**
 * 任务分解统计 Hook
 */
export function useDecomposeStats() {
  const suggestions = useAIStore((state) => state.decomposeSuggestions);
  const result = useAIStore((state) => state.decomposeResult);

  return useMemo(() => {
    const total = suggestions.length;
    const selected = suggestions.filter((s) => s.selected).length;
    const modified = suggestions.filter((s) => s.modified).length;
    const totalDays = result?.totalEstimatedDays || 0;
    const selectedDays = suggestions
      .filter((s) => s.selected)
      .reduce((sum, s) => sum + s.estimatedDays, 0);

    return {
      total,
      selected,
      modified,
      totalDays,
      selectedDays,
      selectionRate: total > 0 ? (selected / total) * 100 : 0,
    };
  }, [suggestions, result]);
}