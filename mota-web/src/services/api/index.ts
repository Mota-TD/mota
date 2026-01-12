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
// 项目协同模块 API (V3.0) - 任务依赖、子任务、检查清单
import * as taskDependencyApi from './taskDependency'
import * as subtaskApi from './subtask'
import * as checklistApi from './checklist'
// 项目协同模块 API (V5.0) - 工作流、视图配置
import * as workflowApi from './workflow'
import * as viewConfigApi from './viewConfig'
// 项目协同模块 API (V6.0) - 进度跟踪
import * as progressTrackingApi from './progressTracking'
// 项目协同模块 API (V7.0) - 资源管理
import * as resourceManagementApi from './resourceManagement'
// 知识管理模块 API (V8.0) - 大文件上传、缩略图、AI分类
import * as knowledgeManagementApi from './knowledgeManagement'
// 模板库模块 API (V9.0) - 模板管理
import * as templateLibraryApi from './templateLibrary'

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
  progressReportApi,
  // 项目协同模块 API (V3.0) - 任务依赖、子任务、检查清单
  taskDependencyApi,
  subtaskApi,
  checklistApi,
  // 项目协同模块 API (V5.0) - 工作流、视图配置
  workflowApi,
  viewConfigApi,
  // 项目协同模块 API (V6.0) - 进度跟踪
  progressTrackingApi,
  // 项目协同模块 API (V7.0) - 资源管理
  resourceManagementApi,
  // 知识管理模块 API (V8.0) - 大文件上传、缩略图、AI分类
  knowledgeManagementApi,
  // 模板库模块 API (V9.0) - 模板管理
  templateLibraryApi
}