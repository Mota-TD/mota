/**
 * API 服务统一导出
 */

export * from './auth'
export * from './project'
export * from './issue'
export * from './activity'
export * from './metrics'
export * from './user'
export * from './sprint'
export * from './wiki'
export * from './notification'
export * from './ai'

// 为了兼容性，也导出命名空间
import * as projectApi from './project'
import * as issueApi from './issue'
import * as activityApi from './activity'
import * as metricsApi from './metrics'
import * as userApi from './user'
import * as sprintApi from './sprint'
import * as wikiApi from './wiki'
import * as notificationApi from './notification'
import * as aiApi from './ai'

export {
  projectApi,
  issueApi,
  activityApi,
  metricsApi,
  userApi,
  sprintApi,
  wikiApi,
  notificationApi,
  aiApi
}