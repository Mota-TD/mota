import { Injectable } from '@nestjs/common';
import { ServiceClientService } from '../../common/service-client/service-client.service';

export interface Role {
  id: number;
  name: string;
  code: string;
  sort: number;
  dataScope: number;
  status: number;
  isSystem: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
  permissionIds: number[];
  userCount: number;
}

export interface RoleListParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

export interface RoleListResponse {
  records: Role[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  sort?: number;
  dataScope?: number;
  remark?: string;
  permissionIds?: number[];
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
  sort?: number;
  dataScope?: number;
  status?: number;
  remark?: string;
  permissionIds?: number[];
}

const SERVICE_NAME = 'user';

@Injectable()
export class RoleService {
  constructor(private readonly serviceClient: ServiceClientService) {}

  async getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    const response = await this.serviceClient.get<RoleListResponse>(
      SERVICE_NAME,
      '/api/v1/roles',
      { params },
    );
    return response.data;
  }

  async getRoleById(id: number): Promise<Role> {
    const response = await this.serviceClient.get<Role>(
      SERVICE_NAME,
      `/api/v1/roles/${id}`,
    );
    return response.data;
  }

  async getEnabledRoles(): Promise<Role[]> {
    const response = await this.serviceClient.get<Role[]>(
      SERVICE_NAME,
      '/api/v1/roles/enabled',
    );
    return response.data;
  }

  async createRole(data: CreateRoleRequest): Promise<number> {
    const response = await this.serviceClient.post<number>(
      SERVICE_NAME,
      '/api/v1/roles',
      data,
    );
    return response.data;
  }

  async updateRole(id: number, data: UpdateRoleRequest): Promise<void> {
    await this.serviceClient.put(
      SERVICE_NAME,
      `/api/v1/roles/${id}`,
      data,
    );
  }

  async deleteRole(id: number): Promise<void> {
    await this.serviceClient.delete(
      SERVICE_NAME,
      `/api/v1/roles/${id}`,
    );
  }

  async deleteRoles(ids: number[]): Promise<void> {
    await this.serviceClient.delete(
      SERVICE_NAME,
      '/api/v1/roles/batch',
      { params: { ids } },
    );
  }

  async enableRole(id: number): Promise<void> {
    await this.serviceClient.put(
      SERVICE_NAME,
      `/api/v1/roles/${id}/enable`,
      {},
    );
  }

  async disableRole(id: number): Promise<void> {
    await this.serviceClient.put(
      SERVICE_NAME,
      `/api/v1/roles/${id}/disable`,
      {},
    );
  }

  async assignPermissions(id: number, permissionIds: number[]): Promise<void> {
    await this.serviceClient.put(
      SERVICE_NAME,
      `/api/v1/roles/${id}/permissions`,
      permissionIds,
    );
  }

  async getRolePermissionIds(id: number): Promise<number[]> {
    const response = await this.serviceClient.get<number[]>(
      SERVICE_NAME,
      `/api/v1/roles/${id}/permissions`,
    );
    return response.data;
  }

  async checkCodeExists(code: string): Promise<boolean> {
    const response = await this.serviceClient.get<boolean>(
      SERVICE_NAME,
      '/api/v1/roles/exists/code',
      { params: { code } },
    );
    return response.data;
  }
}