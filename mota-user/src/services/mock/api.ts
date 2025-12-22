/**
 * Mock API 服务
 * 模拟后端 API 接口，用于前端开发和演示
 */

import {
  mockUsers,
  mockTeams,
  mockProjects,
  mockIssues,
  mockSprints,
  mockWikiPages,
  mockNotifications,
  mockActivities,
  mockMetrics,
  mockDashboardStats,
} from './data'

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟 API 响应
interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

const createResponse = <T>(data: T): ApiResponse<T> => ({
  code: 200,
  message: 'success',
  data,
  timestamp: Date.now(),
})

// ==================== 用户相关 API ====================
export const userApi = {
  // 登录
  async login(email: string, password: string) {
    await delay()
    const user = mockUsers.find(u => u.email === email)
    if (user && password === '123456') {
      return createResponse({
        token: 'mock-jwt-token-' + Date.now(),
        user,
      })
    }
    throw new Error('用户名或密码错误')
  },

  // 注册
  async register(data: { name: string; email: string; password: string }) {
    await delay()
    const newUser = {
      id: mockUsers.length + 1,
      name: data.name,
      email: data.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      role: 'member',
    }
    return createResponse(newUser)
  },

  // 获取当前用户
  async getCurrentUser() {
    await delay()
    return createResponse(mockUsers[0])
  },

  // 获取用户列表
  async getUsers() {
    await delay()
    return createResponse(mockUsers)
  },

  // 获取用户详情
  async getUserById(id: number) {
    await delay()
    const user = mockUsers.find(u => u.id === id)
    if (!user) throw new Error('用户不存在')
    return createResponse(user)
  },
}

// ==================== 团队相关 API ====================
export const teamApi = {
  // 获取团队列表
  async getTeams() {
    await delay()
    return createResponse(mockTeams)
  },

  // 获取团队详情
  async getTeamById(id: number) {
    await delay()
    const team = mockTeams.find(t => t.id === id)
    if (!team) throw new Error('团队不存在')
    return createResponse(team)
  },
}

// ==================== 项目相关 API ====================
export const projectApi = {
  // 获取项目列表
  async getProjects(params?: { status?: string; search?: string }) {
    await delay()
    let projects = [...mockProjects]
    
    if (params?.status) {
      projects = projects.filter(p => p.status === params.status)
    }
    if (params?.search) {
      const search = params.search.toLowerCase()
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.key.toLowerCase().includes(search)
      )
    }
    
    return createResponse({
      list: projects,
      total: projects.length,
    })
  },

  // 获取项目详情
  async getProjectById(id: number) {
    await delay()
    const project = mockProjects.find(p => p.id === id)
    if (!project) throw new Error('项目不存在')
    return createResponse(project)
  },

  // 创建项目
  async createProject(data: { name: string; key: string; description?: string }) {
    await delay()
    const newProject = {
      id: mockProjects.length + 1,
      name: data.name,
      key: data.key,
      description: data.description || '',
      status: 'active',
      owner: 1,
      memberCount: 1,
      issueCount: 0,
      color: '#2b7de9',
      starred: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    return createResponse(newProject)
  },

  // 更新项目
  async updateProject(id: number, data: Partial<typeof mockProjects[0]>) {
    await delay()
    const project = mockProjects.find(p => p.id === id)
    if (!project) throw new Error('项目不存在')
    return createResponse({ ...project, ...data })
  },

  // 删除项目
  async deleteProject(_id: number) {
    await delay()
    return createResponse({ success: true })
  },
}

// ==================== 事项相关 API ====================
export const issueApi = {
  // 获取事项列表
  async getIssues(params?: {
    projectId?: number
    sprintId?: number
    status?: string
    type?: string
    assignee?: number
    search?: string
  }) {
    await delay()
    let issues = [...mockIssues]
    
    if (params?.projectId) {
      issues = issues.filter(i => i.projectId === params.projectId)
    }
    if (params?.sprintId) {
      issues = issues.filter(i => i.sprintId === params.sprintId)
    }
    if (params?.status) {
      issues = issues.filter(i => i.status === params.status)
    }
    if (params?.type) {
      issues = issues.filter(i => i.type === params.type)
    }
    if (params?.assignee) {
      issues = issues.filter(i => i.assignee === params.assignee)
    }
    if (params?.search) {
      const search = params.search.toLowerCase()
      issues = issues.filter(i =>
        i.title.toLowerCase().includes(search) ||
        i.key.toLowerCase().includes(search)
      )
    }
    
    // 添加 assigneeName 和 reporterName 字段
    const issuesWithNames = issues.map(issue => {
      const assignee = mockUsers.find(u => u.id === issue.assignee)
      const reporter = mockUsers.find(u => u.id === issue.reporter)
      const project = mockProjects.find(p => p.id === issue.projectId)
      return {
        ...issue,
        assigneeName: assignee?.name || null,
        reporterName: reporter?.name || null,
        projectName: project?.name || null,
      }
    })
    
    return createResponse({
      list: issuesWithNames,
      total: issuesWithNames.length,
    })
  },

  // 获取事项详情
  async getIssueById(id: number) {
    await delay()
    const issue = mockIssues.find(i => i.id === id)
    if (!issue) throw new Error('事项不存在')
    return createResponse(issue)
  },

  // 创建事项
  async createIssue(data: {
    title: string
    type: string
    priority: string
    projectId: number
    description?: string
  }) {
    await delay()
    const project = mockProjects.find(p => p.id === data.projectId)
    const newIssue = {
      id: mockIssues.length + 1,
      key: `${project?.key || 'ISSUE'}-${1000 + mockIssues.length + 1}`,
      title: data.title,
      type: data.type,
      status: 'open',
      priority: data.priority,
      assignee: null,
      reporter: 1,
      projectId: data.projectId,
      sprintId: null,
      storyPoints: 0,
      description: data.description || '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    return createResponse(newIssue)
  },

  // 更新事项
  async updateIssue(id: number, data: Partial<typeof mockIssues[0]>) {
    await delay()
    const issue = mockIssues.find(i => i.id === id)
    if (!issue) throw new Error('事项不存在')
    return createResponse({ ...issue, ...data })
  },

  // 删除事项
  async deleteIssue(_id: number) {
    await delay()
    return createResponse({ success: true })
  },
}

// ==================== 迭代相关 API ====================
export const sprintApi = {
  // 获取迭代列表
  async getSprints(params?: { projectId?: number; status?: string }) {
    await delay()
    let sprints = [...mockSprints]
    
    if (params?.projectId) {
      sprints = sprints.filter(s => s.projectId === params.projectId)
    }
    if (params?.status) {
      sprints = sprints.filter(s => s.status === params.status)
    }
    
    return createResponse(sprints)
  },

  // 获取迭代详情
  async getSprintById(id: number) {
    await delay()
    const sprint = mockSprints.find(s => s.id === id)
    if (!sprint) throw new Error('迭代不存在')
    return createResponse(sprint)
  },

  // 创建迭代
  async createSprint(data: {
    name: string
    projectId: number
    startDate: string
    endDate: string
    goal?: string
  }) {
    await delay()
    const newSprint = {
      id: mockSprints.length + 1,
      name: data.name,
      projectId: data.projectId,
      status: 'planning',
      startDate: data.startDate,
      endDate: data.endDate,
      goal: data.goal || '',
      totalPoints: 0,
      completedPoints: 0,
    }
    return createResponse(newSprint)
  },
}

// ==================== Wiki 相关 API ====================
export const wikiApi = {
  // 获取 Wiki 页面列表
  async getWikiPages(params?: { parentId?: number | null }) {
    await delay()
    let pages = [...mockWikiPages]
    
    if (params?.parentId !== undefined) {
      pages = pages.filter(p => p.parentId === params.parentId)
    }
    
    return createResponse(pages)
  },

  // 获取 Wiki 页面详情
  async getWikiPageById(id: number) {
    await delay()
    const page = mockWikiPages.find(p => p.id === id)
    if (!page) throw new Error('页面不存在')
    return createResponse(page)
  },
}

// ==================== 通知相关 API ====================
export const notificationApi = {
  // 获取通知列表
  async getNotifications(params?: { unreadOnly?: boolean }) {
    await delay()
    let notifications = [...mockNotifications]
    
    if (params?.unreadOnly) {
      notifications = notifications.filter(n => !n.read)
    }
    
    return createResponse(notifications)
  },

  // 标记为已读
  async markAsRead(_id: number) {
    await delay()
    return createResponse({ success: true })
  },

  // 全部标记为已读
  async markAllAsRead() {
    await delay()
    return createResponse({ success: true })
  },
}

// ==================== 活动动态相关 API ====================
export const activityApi = {
  // 获取活动动态
  async getActivities() {
    await delay()
    const activities = mockActivities.map(a => ({
      ...a,
      user: mockUsers.find(u => u.id === a.userId),
    }))
    return createResponse(activities)
  },
}

// ==================== 效能指标相关 API ====================
export const metricsApi = {
  // 获取所有指标
  async getMetrics() {
    await delay()
    return createResponse(mockMetrics)
  },

  // 获取 DORA 指标
  async getDoraMetrics() {
    await delay()
    return createResponse(mockMetrics.dora)
  },
}

// ==================== 仪表盘相关 API ====================
export const dashboardApi = {
  // 获取仪表盘统计数据
  async getStats() {
    await delay()
    return createResponse(mockDashboardStats)
  },

  // 获取待办事项
  async getTodoList() {
    await delay()
    const todos = mockIssues.filter(i => i.assignee === 1 && i.status !== 'done').slice(0, 5)
    return createResponse(todos)
  },

  // 获取最近项目
  async getRecentProjects() {
    await delay()
    return createResponse(mockProjects.slice(0, 4))
  },

  // 获取最近活动
  async getRecentActivities() {
    await delay()
    const activities = mockActivities.map(a => ({
      ...a,
      user: mockUsers.find(u => u.id === a.userId),
    }))
    return createResponse(activities.slice(0, 5))
  },
}