/**
 * 租户管理相关类型定义
 */

import { StatusEnum } from './common';

/**
 * 租户信息
 */
export interface Tenant {
  id: string;
  name: string;
  code: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: StatusEnum;
  packageId: string;
  packageName: string;
  expireDate: string;
  userCount: number;
  maxUsers: number;
  storageUsed: number;
  storageLimit: number;
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

/**
 * 租户创建请求
 */
export interface CreateTenantParams {
  name: string;
  code: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  packageId: string;
  remark?: string;
}

/**
 * 租户更新请求
 */
export interface UpdateTenantParams extends Partial<CreateTenantParams> {
  id: string;
  status?: StatusEnum;
}

/**
 * 套餐信息
 */
export interface Package {
  id: string;
  name: string;
  code: string;
  price: number;
  duration: number;
  durationUnit: 'day' | 'month' | 'year';
  maxUsers: number;
  storageLimit: number;
  aiQuotaLimit: number;
  features: string[];
  status: StatusEnum;
  sort: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

/**
 * 订单信息
 */
export interface Order {
  id: string;
  orderNo: string;
  tenantId: string;
  tenantName: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  payMethod?: 'alipay' | 'wechat' | 'bank';
  payTime?: string;
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

/**
 * 租户统计信息
 */
export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  expiredTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
}