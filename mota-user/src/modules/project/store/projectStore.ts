/**
 * 项目状态管理
 * 使用 Zustand 进行状态管理，支持乐观更新和错误回滚
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import * as projectApi from '@/services/api/project'
import type {
  Project,
  ProjectMember,
  Milestone,
  ProjectStatistics,
  ProjectFilters,
  ProjectViewMode,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types'

// ==================== 状态接口 ====================

interface ProjectState {
  // 项目列表
  projects: Project[]
  currentProject: Project | null
  
  // 项目详情相关
  projectMembers: ProjectMember[]
  projectMilestones: Milestone[]
  projectStats: ProjectStatistics | null
  
  // 加载状态
  loading: boolean
  detailLoading: boolean
  error: string | null
  
  // 筛选和视图
  filters: ProjectFilters
  viewMode: ProjectViewMode
  
  // ==================== 操作方法 ====================
  
  // 项目列表操作
  fetchProjects: () => Promise<void>
  setFilters: (filters: Partial<ProjectFilters>) => void
  setViewMode: (mode: ProjectViewMode) => void
  clearError: () => void
  
  // 项目详情操作
  fetchProjectDetail: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  
  // 项目 CRUD
  createProject: (data: CreateProjectRequest) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  // 项目操作
  toggleStar: (id: string) => Promise<void>
  archiveProject: (id: string) => Promise<void>
  restoreProject: (id: string) => Promise<void>
  updateProjectStatus: (id: string, status: string) => Promise<void>
  updateProjectProgress: (id: string, progress: number) => Promise<void>
  
  // 成员管理
  fetchProjectMembers: (projectId: string) => Promise<void>
  addMember: (projectId: string, userId: string, role?: string) => Promise<void>
  addMembers: (projectId: string, userIds: string[], role?: string) => Promise<void>
  removeMember: (projectId: string, userId: string) => Promise<void>
  updateMemberRole: (projectId: string, userId: string, role: string) => Promise<void>
  
  // 里程碑管理
  fetchProjectMilestones: (projectId: string) => Promise<void>
  addMilestone: (projectId: string, milestone: Partial<Milestone>) => Promise<Milestone>
  updateMilestone: (milestoneId: string, data: Partial<Milestone>) => Promise<void>
  deleteMilestone: (milestoneId: string) => Promise<void>
  completeMilestone: (milestoneId: string) => Promise<void>
  
  // 乐观更新
  optimisticUpdate: (id: string, data: Partial<Project>) => void
  rollback: (id: string, originalData: Project) => void
  
  // 重置
  reset: () => void
}

// ==================== 初始状态 ====================

const initialFilters: ProjectFilters = {
  status: 'all',
  search: '',
  starred: false,
  priority: undefined,
  ownerId: undefined
}

const initialState = {
  projects: [] as Project[],
  currentProject: null as Project | null,
  projectMembers: [] as ProjectMember[],
  projectMilestones: [] as Milestone[],
  projectStats: null as ProjectStatistics | null,
  loading: false,
  detailLoading: false,
  error: null as string | null,
  filters: initialFilters,
  viewMode: 'grid' as ProjectViewMode
}

// ==================== 创建 Store ====================

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // ==================== 项目列表操作 ====================
        
        fetchProjects: async () => {
          set({ loading: true, error: null })
          try {
            const { filters } = get()
            const res = await projectApi.getProjects({
              status: filters.status === 'all' ? undefined : filters.status,
              search: filters.search || undefined
            })
            set({ 
              projects: (res.list || []) as Project[], 
              loading: false 
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '加载项目列表失败'
            set({ error: errorMessage, loading: false })
          }
        },
        
        setFilters: (newFilters) => {
          set((state) => {
            state.filters = { ...state.filters, ...newFilters }
          })
        },
        
        setViewMode: (mode) => {
          set({ viewMode: mode })
        },
        
        clearError: () => {
          set({ error: null })
        },
        
        // ==================== 项目详情操作 ====================
        
        fetchProjectDetail: async (id) => {
          set({ detailLoading: true, error: null })
          try {
            // 尝试获取完整详情
            let project: Project
            let members: ProjectMember[] = []
            let milestones: Milestone[] = []
            let stats: ProjectStatistics | null = null
            
            try {
              const fullRes = await projectApi.getProjectDetailFull(id)
              project = fullRes as Project
              members = (fullRes.members || []) as ProjectMember[]
              milestones = (fullRes.milestones || []) as Milestone[]
              stats = (fullRes.statistics || null) as ProjectStatistics | null
            } catch {
              // 回退到简单查询
              project = await projectApi.getProjectById(id) as Project
              
              // 分别获取成员、里程碑和统计
              try {
                members = await projectApi.getProjectMembers(id) as ProjectMember[]
              } catch {
                members = []
              }
              
              try {
                milestones = await projectApi.getProjectMilestones(id) as Milestone[]
              } catch {
                milestones = []
              }
              
              try {
                stats = await projectApi.getProjectStatistics(id) as ProjectStatistics
              } catch {
                stats = null
              }
            }
            
            set({
              currentProject: project,
              projectMembers: members,
              projectMilestones: milestones,
              projectStats: stats,
              detailLoading: false
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '加载项目详情失败'
            set({ error: errorMessage, detailLoading: false })
          }
        },
        
        setCurrentProject: (project) => {
          set({ currentProject: project })
        },
        
        // ==================== 项目 CRUD ====================
        
        createProject: async (data) => {
          set({ loading: true, error: null })
          try {
            const project = await projectApi.createProjectFull(data) as Project
            set((state) => {
              state.projects.unshift(project)
              state.loading = false
            })
            return project
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '创建项目失败'
            set({ error: errorMessage, loading: false })
            throw error
          }
        },
        
        updateProject: async (id, data) => {
          const { projects } = get()
          const originalProject = projects.find(p => p.id === id)
          
          // 乐观更新
          if (originalProject) {
            get().optimisticUpdate(id, data as Partial<Project>)
          }
          
          try {
            await projectApi.updateProject(id, data)
            // 更新成功后刷新列表
            await get().fetchProjects()
          } catch (error: unknown) {
            // 回滚
            if (originalProject) {
              get().rollback(id, originalProject)
            }
            const errorMessage = error instanceof Error ? error.message : '更新项目失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        deleteProject: async (id) => {
          try {
            await projectApi.deleteProject(id)
            set((state) => {
              state.projects = state.projects.filter((p: Project) => p.id !== id)
              if (state.currentProject?.id === id) {
                state.currentProject = null
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '删除项目失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        // ==================== 项目操作 ====================
        
        toggleStar: async (id) => {
          const { projects } = get()
          const project = projects.find(p => p.id === id)
          if (!project) return
          
          const originalStarred = project.starred
          
          // 乐观更新
          set((state) => {
            const p = state.projects.find((p: Project) => p.id === id)
            if (p) {
              p.starred = p.starred === 1 ? 0 : 1
            }
            if (state.currentProject?.id === id) {
              state.currentProject.starred = state.currentProject.starred === 1 ? 0 : 1
            }
          })
          
          try {
            await projectApi.toggleProjectStar(id)
          } catch (error: unknown) {
            // 回滚
            set((state) => {
              const p = state.projects.find((p: Project) => p.id === id)
              if (p) {
                p.starred = originalStarred
              }
              if (state.currentProject?.id === id) {
                state.currentProject.starred = originalStarred
              }
            })
            const errorMessage = error instanceof Error ? error.message : '操作失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        archiveProject: async (id) => {
          try {
            await projectApi.archiveProject(id)
            set((state) => {
              const p = state.projects.find((p: Project) => p.id === id)
              if (p) {
                p.status = 'archived'
              }
              if (state.currentProject?.id === id) {
                state.currentProject.status = 'archived'
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '归档项目失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        restoreProject: async (id) => {
          try {
            await projectApi.restoreProject(id)
            set((state) => {
              const p = state.projects.find((p: Project) => p.id === id)
              if (p) {
                p.status = 'active'
              }
              if (state.currentProject?.id === id) {
                state.currentProject.status = 'active'
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '恢复项目失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        updateProjectStatus: async (id, status) => {
          try {
            await projectApi.updateProjectStatus(id, status)
            set((state) => {
              const p = state.projects.find((p: Project) => p.id === id)
              if (p) {
                p.status = status as Project['status']
              }
              if (state.currentProject?.id === id) {
                state.currentProject.status = status as Project['status']
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '更新状态失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        updateProjectProgress: async (id, progress) => {
          try {
            await projectApi.updateProjectProgress(id, progress)
            set((state) => {
              const p = state.projects.find((p: Project) => p.id === id)
              if (p) {
                p.progress = progress
              }
              if (state.currentProject?.id === id) {
                state.currentProject.progress = progress
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '更新进度失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        // ==================== 成员管理 ====================
        
        fetchProjectMembers: async (projectId) => {
          try {
            const members = await projectApi.getProjectMembers(projectId) as ProjectMember[]
            set({ projectMembers: members })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '加载成员失败'
            set({ error: errorMessage })
          }
        },
        
        addMember: async (projectId, userId, role) => {
          try {
            await projectApi.addProjectMember(projectId, userId, role)
            await get().fetchProjectMembers(projectId)
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '添加成员失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        addMembers: async (projectId, userIds, role) => {
          try {
            await projectApi.addProjectMembers(projectId, userIds, role)
            await get().fetchProjectMembers(projectId)
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '批量添加成员失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        removeMember: async (projectId, userId) => {
          try {
            await projectApi.removeProjectMember(projectId, userId)
            set((state) => {
              state.projectMembers = state.projectMembers.filter((m: ProjectMember) => m.userId !== userId)
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '移除成员失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        updateMemberRole: async (projectId, userId, role) => {
          try {
            await projectApi.updateMemberRole(projectId, userId, role)
            set((state) => {
              const member = state.projectMembers.find((m: ProjectMember) => m.userId === userId)
              if (member) {
                member.role = role
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '更新角色失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        // ==================== 里程碑管理 ====================
        
        fetchProjectMilestones: async (projectId) => {
          try {
            const milestones = await projectApi.getProjectMilestones(projectId) as Milestone[]
            set({ projectMilestones: milestones })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '加载里程碑失败'
            set({ error: errorMessage })
          }
        },
        
        addMilestone: async (projectId, milestone) => {
          try {
            const newMilestone = await projectApi.addMilestone(projectId, milestone) as Milestone
            set((state) => {
              state.projectMilestones.push(newMilestone)
            })
            return newMilestone
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '添加里程碑失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        updateMilestone: async (milestoneId, data) => {
          try {
            await projectApi.updateMilestone(milestoneId, data)
            set((state) => {
              const idx = state.projectMilestones.findIndex((m: Milestone) => m.id === milestoneId)
              if (idx !== -1) {
                state.projectMilestones[idx] = { ...state.projectMilestones[idx], ...data }
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '更新里程碑失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        deleteMilestone: async (milestoneId) => {
          try {
            await projectApi.deleteMilestone(milestoneId)
            set((state) => {
              state.projectMilestones = state.projectMilestones.filter((m: Milestone) => m.id !== milestoneId)
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '删除里程碑失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        completeMilestone: async (milestoneId) => {
          try {
            await projectApi.completeMilestone(milestoneId)
            set((state) => {
              const milestone = state.projectMilestones.find((m: Milestone) => m.id === milestoneId)
              if (milestone) {
                milestone.status = 'completed'
                milestone.completedAt = new Date().toISOString()
              }
            })
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '完成里程碑失败'
            set({ error: errorMessage })
            throw error
          }
        },
        
        // ==================== 乐观更新 ====================
        
        optimisticUpdate: (id, data) => {
          set((state) => {
            const idx = state.projects.findIndex((p: Project) => p.id === id)
            if (idx !== -1) {
              state.projects[idx] = { ...state.projects[idx], ...data }
            }
            if (state.currentProject?.id === id) {
              state.currentProject = { ...state.currentProject, ...data }
            }
          })
        },
        
        rollback: (id, originalData) => {
          set((state) => {
            const idx = state.projects.findIndex((p: Project) => p.id === id)
            if (idx !== -1) {
              state.projects[idx] = originalData
            }
            if (state.currentProject?.id === id) {
              state.currentProject = originalData
            }
          })
        },
        
        // ==================== 重置 ====================
        
        reset: () => {
          set(initialState)
        }
      })),
      {
        name: 'project-store',
        partialize: (state) => ({
          filters: state.filters,
          viewMode: state.viewMode
        })
      }
    ),
    { name: 'ProjectStore' }
  )
)

// ==================== 选择器 ====================

export const useProjects = () => useProjectStore((state) => state.projects)
export const useCurrentProject = () => useProjectStore((state) => state.currentProject)
export const useProjectMembers = () => useProjectStore((state) => state.projectMembers)
export const useProjectMilestones = () => useProjectStore((state) => state.projectMilestones)
export const useProjectStats = () => useProjectStore((state) => state.projectStats)
export const useProjectLoading = () => useProjectStore((state) => state.loading)
export const useProjectError = () => useProjectStore((state) => state.error)
export const useProjectFilters = () => useProjectStore((state) => state.filters)
export const useProjectViewMode = () => useProjectStore((state) => state.viewMode)

// 计算属性选择器
export const useFilteredProjects = () => {
  const projects = useProjectStore((state) => state.projects)
  const filters = useProjectStore((state) => state.filters)
  
  return projects.filter(project => {
    // 状态筛选
    if (filters.status !== 'all' && project.status !== filters.status) {
      return false
    }
    
    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!project.name.toLowerCase().includes(searchLower) &&
          !project.key.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    
    // 收藏筛选
    if (filters.starred && project.starred !== 1) {
      return false
    }
    
    // 优先级筛选
    if (filters.priority && project.priority !== filters.priority) {
      return false
    }
    
    // 负责人筛选
    if (filters.ownerId && project.ownerId !== filters.ownerId) {
      return false
    }
    
    return true
  })
}

export const useArchivedProjects = () => {
  const projects = useProjectStore((state) => state.projects)
  return projects.filter(p => p.status === 'archived')
}

export const useActiveProjects = () => {
  const projects = useProjectStore((state) => state.projects)
  return projects.filter(p => p.status === 'active')
}

export const useStarredProjects = () => {
  const projects = useProjectStore((state) => state.projects)
  return projects.filter(p => p.starred === 1)
}