import { Injectable, Logger } from '@nestjs/common';
import { ServiceClientService } from '../../common/service-client/service-client.service';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(private readonly serviceClient: ServiceClientService) {}

  /**
   * 获取项目列表（聚合任务统计）
   */
  async getProjects(
    userId: string,
    tenantId: string,
    query: any,
  ): Promise<any> {
    const response = await this.serviceClient.get<any>(
      'project',
      '/api/v1/projects',
      { params: query },
      { userId, tenantId },
    );
    return response.data;
  }

  /**
   * 获取项目详情（聚合成员、任务、里程碑）
   */
  async getProjectDetail(
    projectId: string,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const [project, members, tasks, milestones] = await Promise.all([
      this.serviceClient.get<any>(
        'project',
        `/api/v1/projects/${projectId}`,
        {},
        { userId, tenantId },
      ),
      this.serviceClient.get<any>(
        'project',
        `/api/v1/projects/${projectId}/members`,
        {},
        { userId, tenantId },
      ),
      this.serviceClient.get<any>(
        'task',
        '/api/v1/tasks',
        { params: { projectId, pageSize: 100 } },
        { userId, tenantId },
      ),
      this.serviceClient.get<any>(
        'project',
        `/api/v1/projects/${projectId}/milestones`,
        {},
        { userId, tenantId },
      ),
    ]);

    return {
      ...project.data,
      members: members.data || [],
      tasks: tasks.data?.records || [],
      milestones: milestones.data || [],
    };
  }

  /**
   * 创建项目
   */
  async createProject(
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const response = await this.serviceClient.post<any>(
      'project',
      '/api/v1/projects',
      data,
      {},
      { userId, tenantId },
    );
    return response.data;
  }

  /**
   * 更新项目
   */
  async updateProject(
    projectId: string,
    data: any,
    userId: string,
    tenantId: string,
  ): Promise<any> {
    const response = await this.serviceClient.put<any>(
      'project',
      `/api/v1/projects/${projectId}`,
      data,
      {},
      { userId, tenantId },
    );
    return response.data;
  }

  /**
   * 删除项目
   */
  async deleteProject(
    projectId: string,
    userId: string,
    tenantId: string,
  ): Promise<void> {
    await this.serviceClient.delete<any>(
      'project',
      `/api/v1/projects/${projectId}`,
      {},
      { userId, tenantId },
    );
  }
}