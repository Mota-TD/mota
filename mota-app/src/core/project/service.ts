/**
 * 项目管理服务实现
 */

import { get, post, put, del } from '../http/request'
import type {
  Project,
  ProjectMember,
  ProjectStats,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectQueryRequest,
  ProjectListResponse
} from './types'

class ProjectService {
  private baseUrl = '/api/project'

  /**
   * 获取项目列表
   */
  async getProjects(params?: ProjectQueryRequest): Promise<ProjectListResponse> {
    return get<ProjectListResponse>(`${this.baseUrl}/projects`, params)
  }

  /**
   * 获取项目详情
   */
  async getProject(projectId: string): Promise<Project> {
    return get<Project>(`${this.baseUrl}/projects/${projectId}`)
  }

  /**
   * 创建项目
   */
  async createProject(data: ProjectCreateRequest): Promise<Project> {
    return post<Project>(`${this.baseUrl}/projects`, data)
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: string, data: ProjectUpdateRequest): Promise<Project> {
    return put<Project>(`${this.baseUrl}/projects/${projectId}`, data)
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<void> {
    return del(`${this.baseUrl}/projects/${projectId}`)
  }

  /**
   * 获取项目统计
   */
  async getProjectStats(projectId: string): Promise<ProjectStats> {
    return get<ProjectStats>(`${this.baseUrl}/projects/${projectId}/stats`)
  }

  /**
   * 获取项目成员列表
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return get<ProjectMember[]>(`${this.baseUrl}/projects/${projectId}/members`)
  }

  /**
   * 添加项目成员
   */
  async addProjectMember(projectId: string, userId: string, role: string = 'member'): Promise<void> {
    return post(`${this.baseUrl}/projects/${projectId}/members`, { userId, role })
  }

  /**
   * 移除项目成员
   */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    return del(`${this.baseUrl}/projects/${projectId}/members/${userId}`)
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(projectId: string, userId: string, role: string): Promise<void> {
    return put(`${this.baseUrl}/projects/${projectId}/members/${userId}`, { role })
  }

  /**
   * 获取我的项目
   */
  async getMyProjects(params?: { status?: string; page?: number; pageSize?: number }): Promise<ProjectListResponse> {
    return get<ProjectListResponse>(`${this.baseUrl}/my-projects`, params)
  }

  /**
   * 归档项目
   */
  async archiveProject(projectId: string): Promise<void> {
    return post(`${this.baseUrl}/projects/${projectId}/archive`)
  }

  /**
   * 取消归档
   */
  async unarchiveProject(projectId: string): Promise<void> {
    return post(`${this.baseUrl}/projects/${projectId}/unarchive`)
  }
}

export const projectService = new ProjectService()
export default projectService