/**
 * 项目详情组件类型定义
 */

import type { Project, ProjectMember, Milestone, ProjectStatistics } from '../../types'
import type { DepartmentTask } from '@/services/api/departmentTask'
import type { Task } from '@/services/api/task'
import type { Department } from '@/services/api/department'

// 项目状态配置
export const PROJECT_STATUS_CONFIG: Record<string, { color: string; text: string; icon?: string }> = {
  planning: { color: 'orange', text: '规划中' },
  active: { color: 'green', text: '进行中' },
  completed: { color: 'blue', text: '已完成' },
  suspended: { color: 'gold', text: '已暂停' },
  cancelled: { color: 'red', text: '已取消' },
  archived: { color: 'default', text: '已归档' }
}

// 优先级配置
export const PRIORITY_CONFIG: Record<string, { color: string; text: string }> = {
  low: { color: 'green', text: '低' },
  medium: { color: 'blue', text: '中' },
  high: { color: 'orange', text: '高' },
  urgent: { color: 'red', text: '紧急' }
}

// 项目详情数据
export interface ProjectDetailData {
  project: Project | null
  members: ProjectMember[]
  milestones: Milestone[]
  statistics: ProjectStatistics | null
  departmentTasks: DepartmentTask[]
  tasks: Task[]
  departments: Department[]
  users: UserInfo[]
  activities: ActivityInfo[]
  taskDependencies: TaskDependency[]
  criticalPath: number[]
}

// 用户信息
export interface UserInfo {
  id: string | number
  name?: string
  username?: string
  nickname?: string
  avatar?: string
  departmentId?: string | number
  role?: string
}

// 活动信息
export interface ActivityInfo {
  id: string | number
  userId: string | number
  action: string
  target: string
  time: string
  user?: UserInfo
}

// 任务依赖
export interface TaskDependency {
  predecessorId: number
  successorId: number
  dependencyType: string
}

// 部门任务统计
export interface DeptTaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}

// 项目活动记录（用于概览展示）
export interface ProjectActivity {
  id: string
  type: string
  content: string
  userId: string
  userName: string
  userAvatar?: string
  createdAt: string
  projectId: string
}

// 项目详情 Props
export interface ProjectDetailProps {
  projectId?: string
}

// Tab 类型
export type TabKey = 
  | 'overview' 
  | 'department-tasks' 
  | 'tasks' 
  | 'gantt' 
  | 'burndown' 
  | 'kanban' 
  | 'milestones' 
  | 'members' 
  | 'work-plan-approval' 
  | 'ai-assistant' 
  | 'wiki'