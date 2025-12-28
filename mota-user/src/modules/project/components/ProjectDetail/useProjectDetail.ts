/**
 * 项目详情数据加载 Hook
 */

import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import * as projectApi from '@/services/api/project'
import { departmentTaskApi, taskApi, departmentApi } from '@/services/api'
import { getUsers } from '@/services/api/user'
import { getRecentActivities } from '@/services/api/activity'
import * as taskDependencyApi from '@/services/api/taskDependency'
import type { Project, ProjectMember, Milestone, ProjectStatistics } from '../../types'
import type { DepartmentTask } from '@/services/api/departmentTask'
import type { Task } from '@/services/api/task'
import type { Department } from '@/services/api/department'
import type { UserInfo, ActivityInfo, TaskDependency, DeptTaskStats } from './types'

export interface UseProjectDetailOptions {
  projectId: string
}

export interface UseProjectDetailReturn {
  // 数据
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
  
  // 状态
  loading: boolean
  starred: boolean
  isArchived: boolean
  
  // 计算属性
  deptTaskStats: DeptTaskStats
  
  // 操作
  reload: () => Promise<void>
  toggleStar: () => Promise<void>
  archiveProject: () => Promise<void>
  restoreProject: () => Promise<void>
  updateStatus: (status: string) => Promise<void>
  deleteProject: () => Promise<void>
}

export function useProjectDetail({ projectId }: UseProjectDetailOptions): UseProjectDetailReturn {
  // 数据状态
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null)
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<UserInfo[]>([])
  const [activities, setActivities] = useState<ActivityInfo[]>([])
  const [taskDependencies, setTaskDependencies] = useState<TaskDependency[]>([])
  const [criticalPath, setCriticalPath] = useState<number[]>([])
  const [starred, setStarred] = useState(false)

  // 加载项目数据
  const loadProjectData = useCallback(async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      // 尝试加载完整项目详情
      let projectRes: Project
      try {
        const fullRes = await projectApi.getProjectDetailFull(projectId)
        projectRes = fullRes as Project
        if (fullRes.members) setMembers(fullRes.members as ProjectMember[])
        if (fullRes.milestones) setMilestones(fullRes.milestones as Milestone[])
        if (fullRes.statistics) setStatistics(fullRes.statistics as ProjectStatistics)
      } catch {
        // 回退到简单查询
        projectRes = await projectApi.getProjectById(projectId) as Project
      }
      
      // 并行加载其他数据
      const [deptTasksRes, tasksRes, usersRes, activitiesRes, dependenciesRes] = await Promise.all([
        departmentTaskApi.getDepartmentTasksByProjectId(projectId).catch(() => []),
        taskApi.getTasksByProjectId(projectId).catch(() => []),
        getUsers().catch(() => ({ list: [] })),
        getRecentActivities(5).catch(() => []),
        taskDependencyApi.getProjectDependencies(Number(projectId)).catch(() => [])
      ])
      
      setProject(projectRes)
      setStarred(projectRes.starred === 1)
      setDepartmentTasks(deptTasksRes || [])
      setTasks(tasksRes || [])
      setUsers((usersRes as { list?: UserInfo[] }).list || [])
      setActivities(activitiesRes as ActivityInfo[] || [])
      setTaskDependencies(dependenciesRes as TaskDependency[] || [])
      
      // 计算关键路径
      if (dependenciesRes && dependenciesRes.length > 0) {
        try {
          const criticalPathRes = await taskDependencyApi.calculateCriticalPath(Number(projectId))
          setCriticalPath(criticalPathRes || [])
        } catch {
          setCriticalPath([])
        }
      }
      
      // 如果没有从完整详情获取成员和里程碑，单独加载
      if (!(projectRes as Project & { members?: ProjectMember[] }).members) {
        try {
          const membersRes = await projectApi.getProjectMembers(projectId)
          setMembers(membersRes as ProjectMember[] || [])
        } catch {
          setMembers([])
        }
      }
      
      if (!(projectRes as Project & { milestones?: Milestone[] }).milestones) {
        try {
          const milestonesRes = await projectApi.getProjectMilestones(projectId)
          setMilestones(milestonesRes as Milestone[] || [])
        } catch {
          setMilestones([])
        }
      }
      
      if (!(projectRes as Project & { statistics?: ProjectStatistics }).statistics) {
        try {
          const statsRes = await projectApi.getProjectStatistics(projectId)
          setStatistics(statsRes as ProjectStatistics)
        } catch {
          setStatistics(null)
        }
      }
      
      // 加载部门列表
      try {
        const deptsRes = await departmentApi.getDepartmentsByOrgId(1)
        setDepartments(deptsRes as Department[] || [])
      } catch {
        console.error('Failed to load departments')
        setDepartments([])
      }
    } catch (error) {
      console.error('Failed to load project:', error)
      message.error('加载项目失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  // 切换收藏
  const handleToggleStar = useCallback(async () => {
    if (!projectId) return
    try {
      await projectApi.toggleProjectStar(projectId)
      setStarred(!starred)
      message.success(starred ? '已取消收藏' : '已收藏')
    } catch {
      message.error('操作失败')
    }
  }, [projectId, starred])

  // 归档项目
  const handleArchiveProject = useCallback(async () => {
    if (!projectId) return
    try {
      await projectApi.archiveProject(projectId)
      message.success('项目已归档')
      await loadProjectData()
    } catch {
      message.error('归档失败')
    }
  }, [projectId, loadProjectData])

  // 恢复项目
  const handleRestoreProject = useCallback(async () => {
    if (!projectId) return
    try {
      await projectApi.restoreProject(projectId)
      message.success('项目已恢复')
      await loadProjectData()
    } catch {
      message.error('恢复失败')
    }
  }, [projectId, loadProjectData])

  // 更新状态
  const handleUpdateStatus = useCallback(async (status: string) => {
    if (!projectId) return
    try {
      await projectApi.updateProjectStatus(projectId, status)
      message.success('状态已更新')
      await loadProjectData()
    } catch {
      message.error('更新状态失败')
    }
  }, [projectId, loadProjectData])

  // 删除项目
  const handleDeleteProject = useCallback(async () => {
    if (!projectId) return
    try {
      await projectApi.deleteProject(projectId)
      message.success('项目已删除')
    } catch {
      message.error('删除失败')
    }
  }, [projectId])

  // 计算部门任务统计
  const now = new Date()
  const deptTaskStats: DeptTaskStats = {
    total: departmentTasks.length,
    pending: departmentTasks.filter(t => t.status === 'pending').length,
    inProgress: departmentTasks.filter(t => t.status === 'in_progress').length,
    completed: departmentTasks.filter(t => t.status === 'completed').length,
    overdue: departmentTasks.filter(t =>
      t.status !== 'completed' && t.endDate && new Date(t.endDate) < now
    ).length,
  }

  return {
    // 数据
    project,
    members,
    milestones,
    statistics,
    departmentTasks,
    tasks,
    departments,
    users,
    activities,
    taskDependencies,
    criticalPath,
    
    // 状态
    loading,
    starred,
    isArchived: project?.status === 'archived',
    
    // 计算属性
    deptTaskStats,
    
    // 操作
    reload: loadProjectData,
    toggleStar: handleToggleStar,
    archiveProject: handleArchiveProject,
    restoreProject: handleRestoreProject,
    updateStatus: handleUpdateStatus,
    deleteProject: handleDeleteProject
  }
}