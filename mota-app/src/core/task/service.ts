/**
 * 任务管理服务实现
 */

import { get, post, put, del } from '../http/request'
import type {
  Task,
  TaskStats,
  Subtask,
  TaskComment,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskQueryRequest,
  TaskListResponse
} from './types'

class TaskService {
  private baseUrl = '/api/task'

  /**
   * 获取任务列表
   */
  async getTasks(params?: TaskQueryRequest): Promise<TaskListResponse> {
    return get<TaskListResponse>(`${this.baseUrl}/tasks`, params)
  }

  /**
   * 获取任务详情
   */
  async getTask(taskId: string): Promise<Task> {
    return get<Task>(`${this.baseUrl}/tasks/${taskId}`)
  }

  /**
   * 创建任务
   */
  async createTask(data: TaskCreateRequest): Promise<Task> {
    return post<Task>(`${this.baseUrl}/tasks`, data)
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, data: TaskUpdateRequest): Promise<Task> {
    return put<Task>(`${this.baseUrl}/tasks/${taskId}`, data)
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    return del(`${this.baseUrl}/tasks/${taskId}`)
  }

  /**
   * 获取我的任务
   */
  async getMyTasks(params?: { status?: string; page?: number; pageSize?: number }): Promise<TaskListResponse> {
    return get<TaskListResponse>(`${this.baseUrl}/my-tasks`, params)
  }

  /**
   * 获取任务统计
   */
  async getTaskStats(projectId?: string): Promise<TaskStats> {
    return get<TaskStats>(`${this.baseUrl}/stats`, { projectId })
  }

  /**
   * 分配任务
   */
  async assignTask(taskId: string, assigneeId: string): Promise<void> {
    return post(`${this.baseUrl}/tasks/${taskId}/assign`, { assigneeId })
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    return post(`${this.baseUrl}/tasks/${taskId}/status`, { status })
  }

  /**
   * 获取子任务列表
   */
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    return get<Subtask[]>(`${this.baseUrl}/tasks/${taskId}/subtasks`)
  }

  /**
   * 创建子任务
   */
  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    return post<Subtask>(`${this.baseUrl}/tasks/${taskId}/subtasks`, { title })
  }

  /**
   * 更新子任务
   */
  async updateSubtask(taskId: string, subtaskId: string, completed: boolean): Promise<void> {
    return put(`${this.baseUrl}/tasks/${taskId}/subtasks/${subtaskId}`, { completed })
  }

  /**
   * 删除子任务
   */
  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    return del(`${this.baseUrl}/tasks/${taskId}/subtasks/${subtaskId}`)
  }

  /**
   * 获取任务评论
   */
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return get<TaskComment[]>(`${this.baseUrl}/tasks/${taskId}/comments`)
  }

  /**
   * 添加任务评论
   */
  async addTaskComment(taskId: string, content: string): Promise<TaskComment> {
    return post<TaskComment>(`${this.baseUrl}/tasks/${taskId}/comments`, { content })
  }

  /**
   * 删除任务评论
   */
  async deleteTaskComment(taskId: string, commentId: string): Promise<void> {
    return del(`${this.baseUrl}/tasks/${taskId}/comments/${commentId}`)
  }
}

export const taskService = new TaskService()
export default taskService