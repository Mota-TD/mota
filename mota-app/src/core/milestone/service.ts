/**
 * 里程碑管理服务实现
 */

import { get, post, put, del } from '../http/request'
import type { Milestone, MilestoneTask, MilestoneStats } from './types'

class MilestoneService {
  private baseUrl = '/api/v1/milestones'

  /**
   * 获取我的里程碑
   */
  async getMyMilestones(): Promise<Milestone[]> {
    return get<Milestone[]>(`${this.baseUrl}/my`)
  }

  /**
   * 获取我的里程碑任务
   */
  async getMyMilestoneTasks(): Promise<MilestoneTask[]> {
    return get<MilestoneTask[]>(`${this.baseUrl}/my-tasks`)
  }

  /**
   * 获取里程碑详情
   */
  async getMilestone(id: string): Promise<Milestone> {
    return get<Milestone>(`${this.baseUrl}/${id}`, { withDetails: true })
  }

  /**
   * 获取里程碑任务列表
   */
  async getMilestoneTasks(milestoneId: string): Promise<MilestoneTask[]> {
    return get<MilestoneTask[]>(`${this.baseUrl}/${milestoneId}/tasks`)
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId: string): Promise<MilestoneTask> {
    return get<MilestoneTask>(`${this.baseUrl}/tasks/${taskId}`)
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    return put(`${this.baseUrl}/tasks/${taskId}/progress`, { progress })
  }

  /**
   * 完成任务
   */
  async completeTask(taskId: string): Promise<MilestoneTask> {
    return put<MilestoneTask>(`${this.baseUrl}/tasks/${taskId}/complete`)
  }

  /**
   * 完成里程碑
   */
  async completeMilestone(milestoneId: string): Promise<Milestone> {
    return put<Milestone>(`${this.baseUrl}/${milestoneId}/complete`)
  }

  /**
   * 获取即将到期的里程碑
   */
  async getUpcomingMilestones(projectId: string, days: number = 7): Promise<Milestone[]> {
    return get<Milestone[]>(`${this.baseUrl}/project/${projectId}/upcoming`, { days })
  }

  /**
   * 获取延期的里程碑
   */
  async getDelayedMilestones(projectId: string): Promise<Milestone[]> {
    return get<Milestone[]>(`${this.baseUrl}/project/${projectId}/delayed`)
  }
}

export const milestoneService = new MilestoneService()
export default milestoneService