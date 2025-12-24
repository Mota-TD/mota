/**
 * API 服务统一导出
 * 根据项目协同模块功能设计稿 V2.0 优化
 */

export * from './auth'
export * from './project'
export * from './activity'
export * from './user'
export * from './notification'
export * from './ai'
export * from './dashboard'

// 项目协同模块 API - 通过命名空间导出避免命名冲突
import * as projectApi from './project'
import * as activityApi from './activity'
import * as userApi from './user'
import * as notificationApi from './notification'
import * as aiApi from './ai'
import * as dashboardApi from './dashboard'
import * as departmentApi from './department'
import * as departmentTaskApi from './departmentTask'
import * as taskApi from './task'
// 项目协同模块 API (V2.0)
import * as workPlanApi from './workPlan'
import * as milestoneApi from './milestone'
import * as taskCommentApi from './taskComment'
import * as deliverableApi from './deliverable'
import * as workFeedbackApi from './workFeedback'
import * as progressReportApi from './progressReport'

export {
  projectApi,
  activityApi,
  userApi,
  notificationApi,
  aiApi,
  dashboardApi,
  departmentApi,
  departmentTaskApi,
  taskApi,
  // 项目协同模块 API (V2.0)
  workPlanApi,
  milestoneApi,
  taskCommentApi,
  deliverableApi,
  workFeedbackApi,
  progressReportApi
}