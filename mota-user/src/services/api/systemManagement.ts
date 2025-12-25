/**
 * 系统管理相关 API
 */

import { get, post, put, del } from '../request'

// =====================================================
// 1. SSO登录相关类型和API
// =====================================================

// SSO提供商类型
export type SSOProviderType = 'OAUTH2' | 'SAML' | 'LDAP' | 'CAS'

// SSO提供商
export interface SSOProvider {
  id: number
  providerCode: string
  providerName: string
  providerType: SSOProviderType
  clientId?: string
  clientSecret?: string
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  logoutUrl?: string
  redirectUri?: string
  scope?: string
  ldapUrl?: string
  ldapBaseDn?: string
  ldapUserDn?: string
  ldapPassword?: string
  ldapUserFilter?: string
  samlMetadataUrl?: string
  samlEntityId?: string
  samlCertificate?: string
  attributeMapping?: Record<string, string>
  autoCreateUser: boolean
  defaultRoleId?: number
  status: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

// SSO登录记录
export interface SSOLoginLog {
  id: number
  providerId: number
  providerCode: string
  externalUserId?: string
  localUserId?: number
  loginStatus: 'SUCCESS' | 'FAILED' | 'PENDING'
  errorMessage?: string
  loginIp?: string
  userAgent?: string
  createdAt?: string
}

// 用户SSO绑定
export interface UserSSOBinding {
  id: number
  userId: number
  providerId: number
  providerCode: string
  externalUserId: string
  externalUsername?: string
  externalEmail?: string
  externalAvatar?: string
  bindAt?: string
  lastLoginAt?: string
}

// SSO API
export const ssoApi = {
  // 获取SSO提供商列表
  getProviders: () => get<SSOProvider[]>('/api/v1/sso/providers'),
  
  // 获取SSO提供商详情
  getProvider: (id: number) => get<SSOProvider>(`/api/v1/sso/providers/${id}`),
  
  // 创建SSO提供商
  createProvider: (data: Partial<SSOProvider>) => post<SSOProvider>('/api/v1/sso/providers', data),
  
  // 更新SSO提供商
  updateProvider: (id: number, data: Partial<SSOProvider>) => put<SSOProvider>(`/api/v1/sso/providers/${id}`, data),
  
  // 删除SSO提供商
  deleteProvider: (id: number) => del<void>(`/api/v1/sso/providers/${id}`),
  
  // 启用/禁用SSO提供商
  toggleProvider: (id: number, status: number) => put<void>(`/api/v1/sso/providers/${id}/status`, { status }),
  
  // 获取SSO登录URL
  getLoginUrl: (providerCode: string) => get<{ url: string }>(`/api/v1/sso/login-url/${providerCode}`),
  
  // SSO回调处理
  handleCallback: (providerCode: string, code: string, state?: string) => 
    post<{ accessToken: string; refreshToken: string }>(`/api/v1/sso/callback/${providerCode}`, { code, state }),
  
  // 获取用户SSO绑定列表
  getUserBindings: (userId: number) => get<UserSSOBinding[]>(`/api/v1/sso/bindings/user/${userId}`),
  
  // 绑定SSO账号
  bindAccount: (providerId: number) => get<{ url: string }>(`/api/v1/sso/bind/${providerId}`),
  
  // 解绑SSO账号
  unbindAccount: (bindingId: number) => del<void>(`/api/v1/sso/bindings/${bindingId}`),
  
  // 获取SSO登录日志
  getLoginLogs: (params: { providerId?: number; page?: number; size?: number }) => 
    get<{ list: SSOLoginLog[]; total: number }>('/api/v1/sso/login-logs', params),
}

// =====================================================
// 2. 岗位管理相关类型和API
// =====================================================

// 岗位类别
export type PositionCategory = '管理类' | '技术类' | '业务类' | '设计类' | '运营类' | '其他'

// 任命类型
export type AppointmentType = 'FORMAL' | 'ACTING' | 'TEMPORARY'

// 岗位
export interface Position {
  id: number
  orgId: number
  positionCode: string
  positionName: string
  positionLevel: number
  positionCategory: PositionCategory
  parentId: number
  departmentId?: number
  departmentName?: string
  description?: string
  responsibilities?: string
  requirements?: string
  headcount: number
  currentCount: number
  salaryMin?: number
  salaryMax?: number
  status: number
  sortOrder: number
  children?: Position[]
  createdAt?: string
  updatedAt?: string
}

// 用户岗位关联
export interface UserPosition {
  id: number
  userId: number
  positionId: number
  positionName?: string
  isPrimary: boolean
  startDate?: string
  endDate?: string
  appointmentType: AppointmentType
  remark?: string
}

// 岗位API
export const positionApi = {
  // 获取岗位列表
  getPositions: (params?: { orgId?: number; departmentId?: number; status?: number }) => 
    get<Position[]>('/api/v1/positions', params),
  
  // 获取岗位树
  getPositionTree: (orgId: number) => get<Position[]>(`/api/v1/positions/tree/${orgId}`),
  
  // 获取岗位详情
  getPosition: (id: number) => get<Position>(`/api/v1/positions/${id}`),
  
  // 创建岗位
  createPosition: (data: Partial<Position>) => post<Position>('/api/v1/positions', data),
  
  // 更新岗位
  updatePosition: (id: number, data: Partial<Position>) => put<Position>(`/api/v1/positions/${id}`, data),
  
  // 删除岗位
  deletePosition: (id: number) => del<void>(`/api/v1/positions/${id}`),
  
  // 获取岗位人员
  getPositionUsers: (positionId: number) => get<UserPosition[]>(`/api/v1/positions/${positionId}/users`),
  
  // 分配用户到岗位
  assignUser: (positionId: number, data: { userId: number; isPrimary?: boolean; appointmentType?: AppointmentType }) => 
    post<UserPosition>(`/api/v1/positions/${positionId}/users`, data),
  
  // 移除用户岗位
  removeUser: (positionId: number, userId: number) => del<void>(`/api/v1/positions/${positionId}/users/${userId}`),
  
  // 获取用户岗位列表
  getUserPositions: (userId: number) => get<UserPosition[]>(`/api/v1/users/${userId}/positions`),
}

// =====================================================
// 3. 人员调动相关类型和API
// =====================================================

// 调动类型
export type TransferType = 'DEPARTMENT' | 'POSITION' | 'PROMOTION' | 'DEMOTION' | 'TRANSFER'

// 调动状态
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'CANCELLED'

// 人员调动记录
export interface PersonnelTransfer {
  id: number
  transferNo: string
  userId: number
  userName?: string
  transferType: TransferType
  fromDepartmentId?: number
  fromDepartmentName?: string
  toDepartmentId?: number
  toDepartmentName?: string
  fromPositionId?: number
  fromPositionName?: string
  toPositionId?: number
  toPositionName?: string
  fromOrgId?: number
  toOrgId?: number
  transferReason?: string
  effectiveDate: string
  status: TransferStatus
  applicantId?: number
  applicantName?: string
  applyTime?: string
  approverId?: number
  approverName?: string
  approveTime?: string
  approveRemark?: string
  executorId?: number
  executeTime?: string
  attachmentIds?: number[]
  createdAt?: string
}

// 调动审批
export interface TransferApproval {
  id: number
  transferId: number
  stepOrder: number
  approverId: number
  approverName?: string
  approverType: 'USER' | 'ROLE' | 'DEPARTMENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED'
  approveTime?: string
  remark?: string
}

// 人员调动API
export const transferApi = {
  // 获取调动记录列表
  getTransfers: (params?: { userId?: number; status?: TransferStatus; page?: number; size?: number }) => 
    get<{ list: PersonnelTransfer[]; total: number }>('/api/v1/transfers', params),
  
  // 获取调动记录详情
  getTransfer: (id: number) => get<PersonnelTransfer>(`/api/v1/transfers/${id}`),
  
  // 创建调动申请
  createTransfer: (data: Partial<PersonnelTransfer>) => post<PersonnelTransfer>('/api/v1/transfers', data),
  
  // 更新调动申请
  updateTransfer: (id: number, data: Partial<PersonnelTransfer>) => put<PersonnelTransfer>(`/api/v1/transfers/${id}`, data),
  
  // 取消调动申请
  cancelTransfer: (id: number) => put<void>(`/api/v1/transfers/${id}/cancel`),
  
  // 审批调动申请
  approveTransfer: (id: number, data: { approved: boolean; remark?: string }) => 
    put<void>(`/api/v1/transfers/${id}/approve`, data),
  
  // 执行调动
  executeTransfer: (id: number) => put<void>(`/api/v1/transfers/${id}/execute`),
  
  // 获取调动审批流程
  getApprovalFlow: (transferId: number) => get<TransferApproval[]>(`/api/v1/transfers/${transferId}/approvals`),
  
  // 获取待审批调动
  getPendingApprovals: () => get<PersonnelTransfer[]>('/api/v1/transfers/pending-approvals'),
}

// =====================================================
// 4. 组织架构图相关类型和API
// =====================================================

// 图表类型
export type ChartType = 'TREE' | 'MATRIX' | 'NETWORK'

// 布局方向
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL'

// 组织架构图配置
export interface OrgChartConfig {
  id: number
  orgId: number
  chartName: string
  chartType: ChartType
  layoutDirection: LayoutDirection
  showAvatar: boolean
  showPosition: boolean
  showDepartment: boolean
  showHeadcount: boolean
  nodeColorScheme: string
  customStyles?: Record<string, any>
  isDefault: boolean
  createdAt?: string
}

// 组织架构快照
export interface OrgChartSnapshot {
  id: number
  orgId: number
  snapshotName: string
  snapshotDate: string
  snapshotData: any
  departmentCount: number
  positionCount: number
  userCount: number
  description?: string
  createdAt?: string
}

// 组织架构节点
export interface OrgChartNode {
  id: string
  type: 'department' | 'position' | 'user'
  name: string
  title?: string
  avatar?: string
  parentId?: string
  children?: OrgChartNode[]
  headcount?: number
  currentCount?: number
  level?: number
  extra?: Record<string, any>
}

// 组织架构图API
export const orgChartApi = {
  // 获取组织架构数据
  getOrgChartData: (orgId: number, params?: { includeUsers?: boolean; departmentId?: number }) => 
    get<OrgChartNode[]>(`/api/v1/org-chart/${orgId}/data`, params),
  
  // 获取组织架构图配置列表
  getConfigs: (orgId: number) => get<OrgChartConfig[]>(`/api/v1/org-chart/${orgId}/configs`),
  
  // 获取组织架构图配置
  getConfig: (id: number) => get<OrgChartConfig>(`/api/v1/org-chart/configs/${id}`),
  
  // 创建组织架构图配置
  createConfig: (data: Partial<OrgChartConfig>) => post<OrgChartConfig>('/api/v1/org-chart/configs', data),
  
  // 更新组织架构图配置
  updateConfig: (id: number, data: Partial<OrgChartConfig>) => put<OrgChartConfig>(`/api/v1/org-chart/configs/${id}`, data),
  
  // 删除组织架构图配置
  deleteConfig: (id: number) => del<void>(`/api/v1/org-chart/configs/${id}`),
  
  // 创建组织架构快照
  createSnapshot: (orgId: number, data: { snapshotName: string; description?: string }) => 
    post<OrgChartSnapshot>(`/api/v1/org-chart/${orgId}/snapshots`, data),
  
  // 获取组织架构快照列表
  getSnapshots: (orgId: number) => get<OrgChartSnapshot[]>(`/api/v1/org-chart/${orgId}/snapshots`),
  
  // 获取组织架构快照详情
  getSnapshot: (id: number) => get<OrgChartSnapshot>(`/api/v1/org-chart/snapshots/${id}`),
  
  // 删除组织架构快照
  deleteSnapshot: (id: number) => del<void>(`/api/v1/org-chart/snapshots/${id}`),
  
  // 对比两个快照
  compareSnapshots: (snapshotId1: number, snapshotId2: number) => 
    get<{ added: any[]; removed: any[]; changed: any[] }>(`/api/v1/org-chart/snapshots/compare`, { snapshotId1, snapshotId2 }),
}

// =====================================================
// 5. 数据权限相关类型和API
// =====================================================

// 范围类型
export type ScopeType = 'ALL' | 'SELF' | 'DEPARTMENT' | 'DEPARTMENT_AND_BELOW' | 'CUSTOM'

// 资源类型
export type ResourceType = 'PROJECT' | 'TASK' | 'DOCUMENT' | 'REPORT' | 'USER'

// 数据权限规则
export interface DataPermissionRule {
  id: number
  ruleName: string
  ruleCode: string
  resourceType: ResourceType
  scopeType: ScopeType
  scopeValue?: any
  conditionExpression?: string
  description?: string
  status: number
  priority: number
  createdAt?: string
}

// 角色数据权限
export interface RoleDataPermission {
  id: number
  roleId: number
  ruleId: number
  ruleName?: string
  ruleCode?: string
}

// 用户数据权限
export interface UserDataPermission {
  id: number
  userId: number
  ruleId: number
  ruleName?: string
  ruleCode?: string
  grantType: 'GRANT' | 'DENY'
  expireTime?: string
  createdBy?: number
}

// 数据权限API
export const dataPermissionApi = {
  // 获取数据权限规则列表
  getRules: (params?: { resourceType?: ResourceType; status?: number }) => 
    get<DataPermissionRule[]>('/api/v1/data-permissions/rules', params),
  
  // 获取数据权限规则详情
  getRule: (id: number) => get<DataPermissionRule>(`/api/v1/data-permissions/rules/${id}`),
  
  // 创建数据权限规则
  createRule: (data: Partial<DataPermissionRule>) => post<DataPermissionRule>('/api/v1/data-permissions/rules', data),
  
  // 更新数据权限规则
  updateRule: (id: number, data: Partial<DataPermissionRule>) => put<DataPermissionRule>(`/api/v1/data-permissions/rules/${id}`, data),
  
  // 删除数据权限规则
  deleteRule: (id: number) => del<void>(`/api/v1/data-permissions/rules/${id}`),
  
  // 获取角色数据权限
  getRolePermissions: (roleId: number) => get<RoleDataPermission[]>(`/api/v1/data-permissions/roles/${roleId}`),
  
  // 设置角色数据权限
  setRolePermissions: (roleId: number, ruleIds: number[]) => 
    put<void>(`/api/v1/data-permissions/roles/${roleId}`, { ruleIds }),
  
  // 获取用户数据权限
  getUserPermissions: (userId: number) => get<UserDataPermission[]>(`/api/v1/data-permissions/users/${userId}`),
  
  // 授予用户数据权限
  grantUserPermission: (userId: number, data: { ruleId: number; grantType: 'GRANT' | 'DENY'; expireTime?: string }) => 
    post<UserDataPermission>(`/api/v1/data-permissions/users/${userId}`, data),
  
  // 撤销用户数据权限
  revokeUserPermission: (userId: number, ruleId: number) => 
    del<void>(`/api/v1/data-permissions/users/${userId}/rules/${ruleId}`),
  
  // 检查用户数据权限
  checkPermission: (userId: number, resourceType: ResourceType, resourceId: number) => 
    get<{ hasPermission: boolean; scopeType: ScopeType }>('/api/v1/data-permissions/check', { userId, resourceType, resourceId }),
}

// =====================================================
// 6. 新闻源配置相关类型和API
// =====================================================

// 数据源类型
export type NewsSourceType = 'RSS' | 'API' | 'CRAWLER' | 'MANUAL'

// 新闻数据源配置
export interface NewsSourceConfig {
  id: number
  sourceName: string
  sourceCode: string
  sourceType: NewsSourceType
  sourceUrl?: string
  apiKey?: string
  apiSecret?: string
  requestHeaders?: Record<string, string>
  requestParams?: Record<string, any>
  parseRules?: Record<string, any>
  category?: string
  language: string
  fetchInterval: number
  lastFetchTime?: string
  lastFetchCount: number
  totalFetchCount: number
  status: number
  priority: number
  createdAt?: string
}

// 新闻源抓取日志
export interface NewsSourceFetchLog {
  id: number
  sourceId: number
  sourceName?: string
  fetchTime: string
  fetchStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL'
  fetchCount: number
  newCount: number
  updateCount: number
  errorCount: number
  errorMessage?: string
  durationMs: number
}

// 新闻源API
export const newsSourceApi = {
  // 获取新闻源列表
  getSources: (params?: { sourceType?: NewsSourceType; status?: number }) => 
    get<NewsSourceConfig[]>('/api/v1/news-sources', params),
  
  // 获取新闻源详情
  getSource: (id: number) => get<NewsSourceConfig>(`/api/v1/news-sources/${id}`),
  
  // 创建新闻源
  createSource: (data: Partial<NewsSourceConfig>) => post<NewsSourceConfig>('/api/v1/news-sources', data),
  
  // 更新新闻源
  updateSource: (id: number, data: Partial<NewsSourceConfig>) => put<NewsSourceConfig>(`/api/v1/news-sources/${id}`, data),
  
  // 删除新闻源
  deleteSource: (id: number) => del<void>(`/api/v1/news-sources/${id}`),
  
  // 启用/禁用新闻源
  toggleSource: (id: number, status: number) => put<void>(`/api/v1/news-sources/${id}/status`, { status }),
  
  // 手动触发抓取
  triggerFetch: (id: number) => post<void>(`/api/v1/news-sources/${id}/fetch`),
  
  // 获取抓取日志
  getFetchLogs: (sourceId: number, params?: { page?: number; size?: number }) => 
    get<{ list: NewsSourceFetchLog[]; total: number }>(`/api/v1/news-sources/${sourceId}/logs`, params),
  
  // 测试新闻源连接
  testConnection: (data: Partial<NewsSourceConfig>) => 
    post<{ success: boolean; message: string; sampleData?: any[] }>('/api/v1/news-sources/test', data),
}

// =====================================================
// 7. 外部集成相关类型和API
// =====================================================

// 集成类型
export type IntegrationType = 'WECHAT_WORK' | 'DINGTALK' | 'FEISHU' | 'GITLAB' | 'JIRA' | 'CONFLUENCE' | 'SLACK' | 'TEAMS'

// 同步类型
export type SyncType = 'USER' | 'DEPARTMENT' | 'MESSAGE' | 'TASK' | 'DOCUMENT'

// 同步方向
export type SyncDirection = 'PUSH' | 'PULL' | 'BIDIRECTIONAL'

// 外部集成配置
export interface ExternalIntegration {
  id: number
  integrationName: string
  integrationCode: string
  integrationType: IntegrationType
  appId?: string
  appSecret?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: string
  webhookUrl?: string
  callbackUrl?: string
  apiBaseUrl?: string
  extraConfig?: Record<string, any>
  syncConfig?: Record<string, any>
  lastSyncTime?: string
  status: number
  createdAt?: string
}

// 集成同步日志
export interface IntegrationSyncLog {
  id: number
  integrationId: number
  integrationName?: string
  syncType: SyncType
  syncDirection: SyncDirection
  syncStatus: 'SUCCESS' | 'FAILED' | 'PARTIAL'
  totalCount: number
  successCount: number
  failedCount: number
  errorDetails?: any[]
  syncTime: string
  durationMs: number
}

// 外部集成API
export const integrationApi = {
  // 获取集成列表
  getIntegrations: (params?: { integrationType?: IntegrationType; status?: number }) => 
    get<ExternalIntegration[]>('/api/v1/integrations', params),
  
  // 获取集成详情
  getIntegration: (id: number) => get<ExternalIntegration>(`/api/v1/integrations/${id}`),
  
  // 创建集成
  createIntegration: (data: Partial<ExternalIntegration>) => post<ExternalIntegration>('/api/v1/integrations', data),
  
  // 更新集成
  updateIntegration: (id: number, data: Partial<ExternalIntegration>) => put<ExternalIntegration>(`/api/v1/integrations/${id}`, data),
  
  // 删除集成
  deleteIntegration: (id: number) => del<void>(`/api/v1/integrations/${id}`),
  
  // 启用/禁用集成
  toggleIntegration: (id: number, status: number) => put<void>(`/api/v1/integrations/${id}/status`, { status }),
  
  // 获取授权URL
  getAuthUrl: (id: number) => get<{ url: string }>(`/api/v1/integrations/${id}/auth-url`),
  
  // 处理授权回调
  handleAuthCallback: (id: number, code: string) => post<void>(`/api/v1/integrations/${id}/auth-callback`, { code }),
  
  // 刷新Token
  refreshToken: (id: number) => post<void>(`/api/v1/integrations/${id}/refresh-token`),
  
  // 触发同步
  triggerSync: (id: number, syncType: SyncType, syncDirection: SyncDirection) => 
    post<void>(`/api/v1/integrations/${id}/sync`, { syncType, syncDirection }),
  
  // 获取同步日志
  getSyncLogs: (integrationId: number, params?: { syncType?: SyncType; page?: number; size?: number }) => 
    get<{ list: IntegrationSyncLog[]; total: number }>(`/api/v1/integrations/${integrationId}/sync-logs`, params),
  
  // 测试连接
  testConnection: (id: number) => post<{ success: boolean; message: string }>(`/api/v1/integrations/${id}/test`),
}

// =====================================================
// 8. 数据变更日志相关类型和API
// =====================================================

// 操作类型
export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE'

// 数据变更日志
export interface DataChangeLog {
  id: number
  tableName: string
  recordId: string
  operationType: OperationType
  oldData?: Record<string, any>
  newData?: Record<string, any>
  changedFields?: string[]
  changeSummary?: string
  operatorId?: number
  operatorName?: string
  operatorIp?: string
  operationTime: string
  requestId?: string
  moduleName?: string
  businessType?: string
}

// 数据变更订阅
export interface DataChangeSubscription {
  id: number
  userId: number
  tableName: string
  recordId?: string
  operationTypes: string
  notifyMethod: 'NOTIFICATION' | 'EMAIL' | 'WEBHOOK'
  webhookUrl?: string
  status: number
  createdAt?: string
}

// 数据变更日志API
export const dataChangeLogApi = {
  // 获取数据变更日志列表
  getLogs: (params: { 
    tableName?: string
    recordId?: string
    operationType?: OperationType
    operatorId?: number
    startTime?: string
    endTime?: string
    page?: number
    size?: number 
  }) => get<{ list: DataChangeLog[]; total: number }>('/api/v1/data-change-logs', params),
  
  // 获取数据变更日志详情
  getLog: (id: number) => get<DataChangeLog>(`/api/v1/data-change-logs/${id}`),
  
  // 获取记录变更历史
  getRecordHistory: (tableName: string, recordId: string) => 
    get<DataChangeLog[]>(`/api/v1/data-change-logs/history`, { tableName, recordId }),
  
  // 获取用户订阅列表
  getSubscriptions: (userId: number) => get<DataChangeSubscription[]>(`/api/v1/data-change-logs/subscriptions/user/${userId}`),
  
  // 创建订阅
  createSubscription: (data: Partial<DataChangeSubscription>) => 
    post<DataChangeSubscription>('/api/v1/data-change-logs/subscriptions', data),
  
  // 更新订阅
  updateSubscription: (id: number, data: Partial<DataChangeSubscription>) => 
    put<DataChangeSubscription>(`/api/v1/data-change-logs/subscriptions/${id}`, data),
  
  // 删除订阅
  deleteSubscription: (id: number) => del<void>(`/api/v1/data-change-logs/subscriptions/${id}`),
  
  // 获取变更统计
  getStatistics: (params: { startTime: string; endTime: string; groupBy?: 'table' | 'operator' | 'type' }) => 
    get<{ labels: string[]; data: number[] }>('/api/v1/data-change-logs/statistics', params),
}

// =====================================================
// 9. 审计报告相关类型和API
// =====================================================

// 报告类型
export type AuditReportType = 'OPERATION' | 'SECURITY' | 'DATA' | 'COMPLIANCE'

// 报告状态
export type AuditReportStatus = 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'ARCHIVED'

// 风险等级
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// 审计报告
export interface AuditReport {
  id: number
  reportNo: string
  reportName: string
  reportType: AuditReportType
  reportPeriodStart: string
  reportPeriodEnd: string
  reportScope?: any
  summary?: string
  findings?: any[]
  statistics?: Record<string, any>
  recommendations?: string[]
  riskLevel?: RiskLevel
  reportStatus: AuditReportStatus
  reportFileUrl?: string
  generatedBy?: number
  generatedByName?: string
  generatedAt?: string
  reviewedBy?: number
  reviewedByName?: string
  reviewedAt?: string
  publishedBy?: number
  publishedAt?: string
  createdAt?: string
}

// 审计报告模板
export interface AuditReportTemplate {
  id: number
  templateName: string
  templateCode: string
  reportType: AuditReportType
  templateContent?: string
  dataQueries?: any[]
  chartConfigs?: any[]
  isDefault: boolean
  status: number
  createdAt?: string
}

// 审计报告定时任务
export interface AuditReportSchedule {
  id: number
  scheduleName: string
  templateId: number
  templateName?: string
  scheduleType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  cronExpression?: string
  reportScope?: any
  recipients?: number[]
  notifyMethod: string
  lastRunTime?: string
  nextRunTime?: string
  status: number
  createdAt?: string
}

// 审计报告API
export const auditReportApi = {
  // 获取审计报告列表
  getReports: (params?: { 
    reportType?: AuditReportType
    reportStatus?: AuditReportStatus
    startDate?: string
    endDate?: string
    page?: number
    size?: number 
  }) => get<{ list: AuditReport[]; total: number }>('/api/v1/audit-reports', params),
  
  // 获取审计报告详情
  getReport: (id: number) => get<AuditReport>(`/api/v1/audit-reports/${id}`),
  
  // 生成审计报告
  generateReport: (data: { 
    templateId: number
    reportName: string
    reportPeriodStart: string
    reportPeriodEnd: string
    reportScope?: any 
  }) => post<AuditReport>('/api/v1/audit-reports/generate', data),
  
  // 更新审计报告
  updateReport: (id: number, data: Partial<AuditReport>) => put<AuditReport>(`/api/v1/audit-reports/${id}`, data),
  
  // 删除审计报告
  deleteReport: (id: number) => del<void>(`/api/v1/audit-reports/${id}`),
  
  // 提交审核
  submitForReview: (id: number) => put<void>(`/api/v1/audit-reports/${id}/submit-review`),
  
  // 审核报告
  reviewReport: (id: number, data: { approved: boolean; comments?: string }) => 
    put<void>(`/api/v1/audit-reports/${id}/review`, data),
  
  // 发布报告
  publishReport: (id: number) => put<void>(`/api/v1/audit-reports/${id}/publish`),
  
  // 归档报告
  archiveReport: (id: number) => put<void>(`/api/v1/audit-reports/${id}/archive`),
  
  // 导出报告
  exportReport: (id: number, format: 'PDF' | 'WORD' | 'EXCEL') =>
    get<Blob>(`/api/v1/audit-reports/${id}/export?format=${format}`),
  
  // 获取报告模板列表
  getTemplates: (reportType?: AuditReportType) => get<AuditReportTemplate[]>('/api/v1/audit-reports/templates', { reportType }),
  
  // 获取报告模板详情
  getTemplate: (id: number) => get<AuditReportTemplate>(`/api/v1/audit-reports/templates/${id}`),
  
  // 创建报告模板
  createTemplate: (data: Partial<AuditReportTemplate>) => post<AuditReportTemplate>('/api/v1/audit-reports/templates', data),
  
  // 更新报告模板
  updateTemplate: (id: number, data: Partial<AuditReportTemplate>) => 
    put<AuditReportTemplate>(`/api/v1/audit-reports/templates/${id}`, data),
  
  // 删除报告模板
  deleteTemplate: (id: number) => del<void>(`/api/v1/audit-reports/templates/${id}`),
  
  // 获取定时任务列表
  getSchedules: () => get<AuditReportSchedule[]>('/api/v1/audit-reports/schedules'),
  
  // 创建定时任务
  createSchedule: (data: Partial<AuditReportSchedule>) => post<AuditReportSchedule>('/api/v1/audit-reports/schedules', data),
  
  // 更新定时任务
  updateSchedule: (id: number, data: Partial<AuditReportSchedule>) => 
    put<AuditReportSchedule>(`/api/v1/audit-reports/schedules/${id}`, data),
  
  // 删除定时任务
  deleteSchedule: (id: number) => del<void>(`/api/v1/audit-reports/schedules/${id}`),
  
  // 手动执行定时任务
  runSchedule: (id: number) => post<void>(`/api/v1/audit-reports/schedules/${id}/run`),
}

// =====================================================
// 10. 合规检查相关类型和API
// =====================================================

// 检查类型
export type ComplianceCheckType = 'REALTIME' | 'SCHEDULED' | 'MANUAL'

// 检查结果
export type ComplianceCheckResult = 'PASS' | 'FAIL' | 'WARNING' | 'ERROR'

// 修复状态
export type RemediationStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED'

// 合规规则
export interface ComplianceRule {
  id: number
  ruleName: string
  ruleCode: string
  ruleCategory: string
  ruleDescription?: string
  checkType: ComplianceCheckType
  checkExpression?: string
  checkParams?: Record<string, any>
  severity: RiskLevel
  remediationSteps?: string
  referenceStandard?: string
  status: number
  createdAt?: string
}

// 合规检查记录
export interface ComplianceCheckRecord {
  id: number
  checkBatchNo: string
  ruleId: number
  ruleCode: string
  ruleName?: string
  checkTime: string
  checkResult: ComplianceCheckResult
  affectedCount: number
  affectedItems?: any[]
  checkDetails?: Record<string, any>
  remediationStatus: RemediationStatus
  remediationTime?: string
  remediationBy?: number
  remediationByName?: string
  remediationNotes?: string
  createdAt?: string
}

// 合规检查定时任务
export interface ComplianceCheckSchedule {
  id: number
  scheduleName: string
  ruleIds: number[]
  cronExpression: string
  notifyOnFail: boolean
  notifyRecipients?: number[]
  lastRunTime?: string
  lastRunResult?: string
  nextRunTime?: string
  status: number
  createdAt?: string
}

// 合规检查统计
export interface ComplianceStatistics {
  totalRules: number
  enabledRules: number
  totalChecks: number
  passCount: number
  failCount: number
  warningCount: number
  pendingRemediation: number
  passRate: number
  categoryStats: { category: string; total: number; pass: number; fail: number }[]
  trendData: { date: string; pass: number; fail: number }[]
}

// 合规检查API
export const complianceApi = {
  // 获取合规规则列表
  getRules: (params?: { ruleCategory?: string; checkType?: ComplianceCheckType; status?: number }) => 
    get<ComplianceRule[]>('/api/v1/compliance/rules', params),
  
  // 获取合规规则详情
  getRule: (id: number) => get<ComplianceRule>(`/api/v1/compliance/rules/${id}`),
  
  // 创建合规规则
  createRule: (data: Partial<ComplianceRule>) => post<ComplianceRule>('/api/v1/compliance/rules', data),
  
  // 更新合规规则
  updateRule: (id: number, data: Partial<ComplianceRule>) => put<ComplianceRule>(`/api/v1/compliance/rules/${id}`, data),
  
  // 删除合规规则
  deleteRule: (id: number) => del<void>(`/api/v1/compliance/rules/${id}`),
  
  // 启用/禁用规则
  toggleRule: (id: number, status: number) => put<void>(`/api/v1/compliance/rules/${id}/status`, { status }),
  
  // 手动执行检查
  runCheck: (ruleIds: number[]) => post<{ batchNo: string }>('/api/v1/compliance/check', { ruleIds }),
  
  // 获取检查记录列表
  getCheckRecords: (params?: { 
    ruleId?: number
    checkResult?: ComplianceCheckResult
    remediationStatus?: RemediationStatus
    startTime?: string
    endTime?: string
    page?: number
    size?: number 
  }) => get<{ list: ComplianceCheckRecord[]; total: number }>('/api/v1/compliance/records', params),
  
  // 获取检查记录详情
  getCheckRecord: (id: number) => get<ComplianceCheckRecord>(`/api/v1/compliance/records/${id}`),
  
  // 更新修复状态
  updateRemediation: (id: number, data: { status: RemediationStatus; notes?: string }) => 
    put<void>(`/api/v1/compliance/records/${id}/remediation`, data),
  
  // 获取定时任务列表
  getSchedules: () => get<ComplianceCheckSchedule[]>('/api/v1/compliance/schedules'),
  
  // 创建定时任务
  createSchedule: (data: Partial<ComplianceCheckSchedule>) => post<ComplianceCheckSchedule>('/api/v1/compliance/schedules', data),
  
  // 更新定时任务
  updateSchedule: (id: number, data: Partial<ComplianceCheckSchedule>) => 
    put<ComplianceCheckSchedule>(`/api/v1/compliance/schedules/${id}`, data),
  
  // 删除定时任务
  deleteSchedule: (id: number) => del<void>(`/api/v1/compliance/schedules/${id}`),
  
  // 手动执行定时任务
  runSchedule: (id: number) => post<void>(`/api/v1/compliance/schedules/${id}/run`),
  
  // 获取合规统计
  getStatistics: (params?: { startTime?: string; endTime?: string }) => 
    get<ComplianceStatistics>('/api/v1/compliance/statistics', params),
  
  // 导出合规报告
  exportReport: (params: { startTime: string; endTime: string; format: 'PDF' | 'EXCEL' }) =>
    get<Blob>(`/api/v1/compliance/export?startTime=${params.startTime}&endTime=${params.endTime}&format=${params.format}`),
}