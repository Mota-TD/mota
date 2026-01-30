/**
 * 租户管理相关API服务
 */

import { request } from '@umijs/max';
import type {
  ApiResponse,
  PageParams,
  PageData,
  Tenant,
  CreateTenantParams,
  UpdateTenantParams,
  Package,
  Order,
  TenantStats,
  OperationResult,
} from '@/types';

/**
 * 获取租户列表（分页）
 */
export async function getTenantList(params: PageParams) {
  return request<ApiResponse<PageData<Tenant>>>('/tenants', {
    method: 'GET',
    params,
  });
}

/**
 * 获取租户详情
 */
export async function getTenantDetail(id: string) {
  return request<ApiResponse<Tenant>>(`/tenants/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建租户
 */
export async function createTenant(params: CreateTenantParams) {
  return request<ApiResponse<Tenant>>('/tenants', {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新租户
 */
export async function updateTenant(params: UpdateTenantParams) {
  const { id, ...data } = params;
  return request<ApiResponse<Tenant>>(`/tenants/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除租户
 */
export async function deleteTenant(id: string) {
  return request<ApiResponse<OperationResult>>(`/tenants/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 启用/禁用租户
 */
export async function toggleTenantStatus(id: string, status: 'active' | 'inactive') {
  return request<ApiResponse<OperationResult>>(`/tenants/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

/**
 * 获取套餐列表
 */
export async function getPackageList(params?: PageParams) {
  return request<ApiResponse<PageData<Package>>>('/packages', {
    method: 'GET',
    params,
  });
}

/**
 * 获取订单列表
 */
export async function getOrderList(params: PageParams & { tenantId?: string }) {
  return request<ApiResponse<PageData<Order>>>('/orders', {
    method: 'GET',
    params,
  });
}

/**
 * 获取租户统计信息
 */
export async function getTenantStats() {
  return request<ApiResponse<TenantStats>>('/tenants/stats', {
    method: 'GET',
  });
}

/**
 * 续费租户
 */
export async function renewTenant(tenantId: string, packageId: string) {
  return request<ApiResponse<Order>>('/orders/renew', {
    method: 'POST',
    data: { tenantId, packageId },
  });
}