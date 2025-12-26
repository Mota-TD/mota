/**
 * 企业管理相关 API
 */

import { get, post, put, del } from '../request'

// 企业信息
export interface Enterprise {
  id: number
  orgId: string
  name: string
  shortName?: string
  industryId: number
  industryName?: string
  logo?: string
  description?: string
  address?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  website?: string
  scale?: string
  memberCount: number
  maxMembers: number
  status: number
  verified: number
  currentUserRole?: string
  createdAt: string
}

// 企业成员
export interface EnterpriseMember {
  id: number
  userId: number
  username: string
  nickname: string
  email?: string
  phone?: string
  avatar?: string
  role: string
  roleName: string
  departmentId?: number
  departmentName?: string
  position?: string
  employeeNo?: string
  status: number
  joinedAt: string
  invitedBy?: number
  invitedByName?: string
}

// 企业更新请求
export interface EnterpriseUpdateRequest {
  name?: string
  shortName?: string
  industryId?: number
  logo?: string
  description?: string
  address?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  website?: string
  scale?: string
}

// 创建邀请请求
export interface CreateInvitationRequest {
  inviteType?: string
  targetEmail?: string
  targetPhone?: string
  role?: string
  departmentId?: number
  maxUses?: number
  validDays?: number
}

// 邀请信息
export interface Invitation {
  id: number
  inviteCode: string
  inviteLink: string
  inviteType: string
  targetEmail?: string
  targetPhone?: string
  role: string
  roleName: string
  departmentId?: number
  departmentName?: string
  maxUses: number
  usedCount: number
  expiredAt: string
  status: number
  statusName: string
  invitedBy: number
  invitedByName?: string
  createdAt: string
}

/**
 * 获取当前用户的企业信息
 */
export function getCurrentEnterprise(): Promise<Enterprise> {
  return get<Enterprise>('/api/v1/enterprise/current')
}

/**
 * 更新企业信息
 */
export function updateEnterprise(enterpriseId: number, data: EnterpriseUpdateRequest): Promise<Enterprise> {
  return put<Enterprise>(`/api/v1/enterprise/${enterpriseId}`, data)
}

/**
 * 获取企业成员列表
 */
export function getEnterpriseMembers(enterpriseId: number): Promise<EnterpriseMember[]> {
  return get<EnterpriseMember[]>(`/api/v1/enterprise/${enterpriseId}/members`)
}

/**
 * 更新成员角色
 */
export function updateMemberRole(enterpriseId: number, memberId: number, role: string): Promise<void> {
  return put<void>(`/api/v1/enterprise/${enterpriseId}/members/${memberId}/role?role=${encodeURIComponent(role)}`)
}

/**
 * 移除成员
 */
export function removeMember(enterpriseId: number, memberId: number): Promise<void> {
  return del<void>(`/api/v1/enterprise/${enterpriseId}/members/${memberId}`)
}

/**
 * 创建邀请
 */
export function createInvitation(enterpriseId: number, data: CreateInvitationRequest): Promise<Invitation> {
  return post<Invitation>(`/api/v1/enterprise/${enterpriseId}/invitations`, data)
}

/**
 * 获取邀请列表
 */
export function getInvitations(enterpriseId: number): Promise<Invitation[]> {
  return get<Invitation[]>(`/api/v1/enterprise/${enterpriseId}/invitations`)
}

/**
 * 撤销邀请
 */
export function revokeInvitation(enterpriseId: number, invitationId: number): Promise<void> {
  return del<void>(`/api/v1/enterprise/${enterpriseId}/invitations/${invitationId}`)
}