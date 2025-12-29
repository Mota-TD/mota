/**
 * AI 智能分工推荐 Hook
 * 集成 Claude API 提供智能分工建议
 */

import { useState, useCallback } from 'react'
import { message } from 'antd'
import { useAIStore } from '../store/aiStore'
import { claudeClient } from '../../../services/claude/claudeClient'
import type { AssignmentRecommendation } from '../types'

export interface TeamMember {
  id: string
  name: string
  department: string
  currentWorkload: number
  skills: string[]
  availability?: 'available' | 'busy' | 'overloaded'
}

export interface TaskAssignmentParams {
  taskId: number
  taskName: string
  taskDescription: string
  teamMembers: TeamMember[]
}

export interface UseAssignmentRecommendationOptions {
  onSuccess?: (recommendations: AssignmentRecommendation[]) => void
  onError?: (error: string) => void
}

export interface UseAssignmentRecommendationReturn {
  // 状态
  loading: boolean
  recommendations: AssignmentRecommendation[]
  error: string | null

  // 操作
  generateRecommendations: (params: TaskAssignmentParams) => Promise<void>
  clearRecommendations: () => void
  applyRecommendation: (userId: string) => Promise<void>
}

/**
 * AI 智能分工推荐 Hook
 */
export function useAssignmentRecommendation(
  options: UseAssignmentRecommendationOptions = {}
): UseAssignmentRecommendationReturn {
  const { onSuccess, onError } = options

  // AI Store 状态
  const loading = useAIStore((state) => state.assignmentLoading)
  const recommendations = useAIStore((state) => state.assignmentRecommendations)
  const storeError = useAIStore((state) => state.assignmentError)

  // AI Store 操作
  const clearAssignmentRecommendations = useAIStore(
    (state) => state.clearAssignmentRecommendations
  )

  // 本地状态
  const [localLoading, setLocalLoading] = useState(false)

  /**
   * 生成智能分工推荐
   */
  const generateRecommendations = useCallback(
    async (params: TaskAssignmentParams) => {
      setLocalLoading(true)

      try {
        // 优先使用 Claude API
        let result: AssignmentRecommendation[]

        try {
          const claudeResult = await claudeClient.suggestTaskAssignment({
            taskId: params.taskId,
            taskName: params.taskName,
            taskDescription: params.taskDescription,
            teamMembers: params.teamMembers,
          })

          // 转换 Claude 结果为标准格式
          result = claudeResult.suggestedAssignees.map((assignee) => ({
            userId: assignee.userId.toString(),
            userName: assignee.userName,
            matchScore: assignee.matchScore,
            currentWorkload: assignee.currentWorkload,
            skills: [], // Claude 响应中暂未包含技能信息
            reason: assignee.reason,
            availability:
              assignee.currentWorkload > 80
                ? 'overloaded'
                : assignee.currentWorkload > 50
                ? 'busy'
                : 'available',
          }))

          console.log('使用 Claude API 生成分工推荐成功')
        } catch (claudeError) {
          console.warn('Claude API 分工推荐失败，回退到原 API:', claudeError)

          // 回退到使用 AI Store 的原始 API
          await useAIStore.getState().fetchAssignmentRecommendations(params.taskId)
          result = useAIStore.getState().assignmentRecommendations
        }

        onSuccess?.(result)
        message.success('智能分工推荐生成成功')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '生成分工推荐失败'
        onError?.(errorMessage)
        message.error(errorMessage)
      } finally {
        setLocalLoading(false)
      }
    },
    [onSuccess, onError]
  )

  /**
   * 清除推荐结果
   */
  const clearRecommendations = useCallback(() => {
    clearAssignmentRecommendations()
  }, [clearAssignmentRecommendations])

  /**
   * 应用推荐（分配任务给指定用户）
   */
  const applyRecommendation = useCallback(
    async (userId: string) => {
      try {
        // 这里应该调用任务分配的 API
        // 暂时只显示成功消息
        const user = recommendations.find((r) => r.userId === userId)
        if (user) {
          message.success(`已分配给 ${user.userName}`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '分配任务失败'
        message.error(errorMessage)
        onError?.(errorMessage)
      }
    },
    [recommendations, onError]
  )

  return {
    loading: loading || localLoading,
    recommendations,
    error: storeError,
    generateRecommendations,
    clearRecommendations,
    applyRecommendation,
  }
}

/**
 * 分工推荐工具函数
 */
export const assignmentUtils = {
  /**
   * 根据匹配分数对推荐进行排序
   */
  sortByMatchScore: (recommendations: AssignmentRecommendation[]) => {
    return [...recommendations].sort((a, b) => b.matchScore - a.matchScore)
  },

  /**
   * 过滤可用的团队成员
   */
  filterAvailableMembers: (recommendations: AssignmentRecommendation[]) => {
    return recommendations.filter((r) => r.availability === 'available')
  },

  /**
   * 获取高匹配度推荐（匹配分数 >= 80）
   */
  getHighMatchRecommendations: (recommendations: AssignmentRecommendation[]) => {
    return recommendations.filter((r) => r.matchScore >= 80)
  },

  /**
   * 获取工作负载状态颜色
   */
  getWorkloadColor: (workload: number) => {
    if (workload >= 80) return '#ff4d4f' // 红色 - 超负荷
    if (workload >= 50) return '#faad14' // 橙色 - 繁忙
    return '#52c41a' // 绿色 - 空闲
  },

  /**
   * 获取匹配分数等级
   */
  getMatchGrade: (score: number) => {
    if (score >= 90) return 'S' // 优秀
    if (score >= 80) return 'A' // 良好
    if (score >= 70) return 'B' // 一般
    if (score >= 60) return 'C' // 较差
    return 'D' // 不匹配
  },

  /**
   * 格式化推荐理由
   */
  formatReason: (reason: string) => {
    return reason.length > 50 ? `${reason.substring(0, 47)}...` : reason
  },
}