/**
 * AI 智能分工推荐 Hook
 * 提供基于 AI 的任务分配建议功能
 */

import { useCallback, useMemo } from 'react';
import { message } from 'antd';
import { useAIStore } from '../store/aiStore';
import { useTaskStore } from '@/modules/task/store/taskStore';
import type { AssignmentRecommendation } from '../types';

interface UseAssignmentRecommendationOptions {
  taskId?: string;
  onAssign?: (userId: string) => void;
}

interface UseAssignmentRecommendationReturn {
  // 状态
  loading: boolean;
  recommendations: AssignmentRecommendation[];
  bestMatch: AssignmentRecommendation | null;
  error: string | null;

  // 操作
  fetchRecommendations: (taskId: number) => Promise<void>;
  assignToUser: (userId: string) => Promise<void>;
  clear: () => void;

  // 计算属性
  availableRecommendations: AssignmentRecommendation[];
  busyRecommendations: AssignmentRecommendation[];
  overloadedRecommendations: AssignmentRecommendation[];
}

/**
 * AI 智能分工推荐 Hook
 */
export function useAssignmentRecommendation(
  options: UseAssignmentRecommendationOptions = {}
): UseAssignmentRecommendationReturn {
  const { taskId, onAssign } = options;

  // 从 AI Store 获取状态
  const loading = useAIStore((state) => state.assignmentLoading);
  const recommendations = useAIStore((state) => state.assignmentRecommendations);
  const error = useAIStore((state) => state.assignmentError);

  // AI Store 操作
  const fetchAssignmentRecommendations = useAIStore(
    (state) => state.fetchAssignmentRecommendations
  );
  const clearAssignmentRecommendations = useAIStore(
    (state) => state.clearAssignmentRecommendations
  );

  // Task Store 操作
  const assignTask = useTaskStore((state) => state.assignTask);

  // 计算最佳匹配
  const bestMatch = useMemo(() => {
    if (recommendations.length === 0) return null;
    return recommendations.reduce((best, current) =>
      current.matchScore > best.matchScore ? current : best
    );
  }, [recommendations]);

  // 按可用性分组
  const availableRecommendations = useMemo(() => {
    return recommendations.filter((r) => r.availability === 'available');
  }, [recommendations]);

  const busyRecommendations = useMemo(() => {
    return recommendations.filter((r) => r.availability === 'busy');
  }, [recommendations]);

  const overloadedRecommendations = useMemo(() => {
    return recommendations.filter((r) => r.availability === 'overloaded');
  }, [recommendations]);

  // 获取推荐
  const fetchRecommendations = useCallback(
    async (id: number) => {
      try {
        await fetchAssignmentRecommendations(id);
      } catch (err) {
        console.error('获取分工推荐失败:', err);
      }
    },
    [fetchAssignmentRecommendations]
  );

  // 分配任务给用户
  const assignToUser = useCallback(
    async (userId: string) => {
      if (!taskId) {
        message.warning('未指定任务');
        return;
      }

      try {
        await assignTask(taskId, userId);
        message.success('任务分配成功');
        onAssign?.(userId);
        clearAssignmentRecommendations();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '任务分配失败';
        message.error(errorMessage);
      }
    },
    [taskId, assignTask, onAssign, clearAssignmentRecommendations]
  );

  // 清除推荐
  const clear = useCallback(() => {
    clearAssignmentRecommendations();
  }, [clearAssignmentRecommendations]);

  return {
    loading,
    recommendations,
    bestMatch,
    error,
    fetchRecommendations,
    assignToUser,
    clear,
    availableRecommendations,
    busyRecommendations,
    overloadedRecommendations,
  };
}

/**
 * 工作负载分析 Hook
 */
export function useWorkloadAnalysis(recommendations: AssignmentRecommendation[]) {
  return useMemo(() => {
    if (recommendations.length === 0) {
      return {
        averageWorkload: 0,
        maxWorkload: 0,
        minWorkload: 0,
        workloadDistribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
      };
    }

    const workloads = recommendations.map((r) => r.currentWorkload);
    const averageWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
    const maxWorkload = Math.max(...workloads);
    const minWorkload = Math.min(...workloads);

    const workloadDistribution = {
      low: recommendations.filter((r) => r.currentWorkload < 40).length,
      medium: recommendations.filter(
        (r) => r.currentWorkload >= 40 && r.currentWorkload < 70
      ).length,
      high: recommendations.filter((r) => r.currentWorkload >= 70).length,
    };

    return {
      averageWorkload,
      maxWorkload,
      minWorkload,
      workloadDistribution,
    };
  }, [recommendations]);
}

/**
 * 匹配分数分析 Hook
 */
export function useMatchScoreAnalysis(recommendations: AssignmentRecommendation[]) {
  return useMemo(() => {
    if (recommendations.length === 0) {
      return {
        averageScore: 0,
        highMatchCount: 0,
        mediumMatchCount: 0,
        lowMatchCount: 0,
        scoreDistribution: [] as { userId: string; userName: string; score: number }[],
      };
    }

    const scores = recommendations.map((r) => r.matchScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const highMatchCount = recommendations.filter((r) => r.matchScore >= 80).length;
    const mediumMatchCount = recommendations.filter(
      (r) => r.matchScore >= 50 && r.matchScore < 80
    ).length;
    const lowMatchCount = recommendations.filter((r) => r.matchScore < 50).length;

    const scoreDistribution = recommendations
      .map((r) => ({
        userId: r.userId,
        userName: r.userName,
        score: r.matchScore,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      averageScore,
      highMatchCount,
      mediumMatchCount,
      lowMatchCount,
      scoreDistribution,
    };
  }, [recommendations]);
}

/**
 * 推荐排序 Hook
 */
export function useSortedRecommendations(
  recommendations: AssignmentRecommendation[],
  sortBy: 'matchScore' | 'workload' | 'availability' = 'matchScore'
) {
  return useMemo(() => {
    const sorted = [...recommendations];

    switch (sortBy) {
      case 'matchScore':
        sorted.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'workload':
        sorted.sort((a, b) => a.currentWorkload - b.currentWorkload);
        break;
      case 'availability':
        const availabilityOrder = { available: 0, busy: 1, overloaded: 2 };
        sorted.sort(
          (a, b) => availabilityOrder[a.availability] - availabilityOrder[b.availability]
        );
        break;
    }

    return sorted;
  }, [recommendations, sortBy]);
}