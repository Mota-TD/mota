import { get, post, put, del } from '@/core/http/request'

// 任务相关API
const taskApi = {
  // 获取任务列表
  getTasks: (params?: { projectId?: string; status?: string; priority?: string }) => 
    get('/api/tasks', params),
  
  // 获取任务详情
  getTask: (id: string) => 
    get(`/api/tasks/${id}`),
  
  // 创建任务
  createTask: (data: any) => 
    post('/api/tasks', data),
  
  // 更新任务
  updateTask: (id: string, data: any) => 
    put(`/api/tasks/${id}`, data),
  
  // 删除任务
  deleteTask: (id: string) => 
    del(`/api/tasks/${id}`),
  
  // 更新任务状态
  updateTaskStatus: (id: string, status: string) => 
    put(`/api/tasks/${id}/status`, { status }),
  
  // 添加任务评论
  addTaskComment: (taskId: string, comment: string) => 
    post(`/api/tasks/${taskId}/comments`, { comment })
}

// 项目相关API
const projectApi = {
  // 获取项目列表
  getProjects: () => 
    get('/api/projects'),
  
  // 获取项目详情
  getProject: (id: string) => 
    get(`/api/projects/${id}`),
  
  // 创建项目
  createProject: (data: any) => 
    post('/api/projects', data),
  
  // 更新项目
  updateProject: (id: string, data: any) => 
    put(`/api/projects/${id}`, data),
  
  // 删除项目
  deleteProject: (id: string) => 
    del(`/api/projects/${id}`),
  
  // 获取项目成员
  getProjectMembers: (id: string) => 
    get(`/api/projects/${id}/members`),
  
  // 添加项目成员
  addProjectMember: (id: string, userId: string) => 
    post(`/api/projects/${id}/members`, { userId }),
  
  // 移除项目成员
  removeProjectMember: (id: string, userId: string) => 
    del(`/api/projects/${id}/members/${userId}`)
}

// 用户相关API
const userApi = {
  // 获取用户信息
  getUser: () => 
    get('/api/user/profile'),
  
  // 更新用户信息
  updateUser: (data: any) => 
    put('/api/user/profile', data),
  
  // 获取用户统计
  getUserStats: () => 
    get('/api/user/stats'),
  
  // 获取团队成员
  getTeamMembers: () => 
    get('/api/user/team')
}

// 通知相关API
const notificationApi = {
  // 获取通知列表
  getNotifications: (params?: { page?: number; size?: number }) => 
    get('/api/notifications', params),
  
  // 标记通知为已读
  markAsRead: (id: string) => 
    put(`/api/notifications/${id}/read`),
  
  // 标记所有通知为已读
  markAllAsRead: () => 
    put('/api/notifications/read-all'),
  
  // 删除通知
  deleteNotification: (id: string) => 
    del(`/api/notifications/${id}`)
}

// 文件上传相关API
const uploadApi = {
  // 上传文件
  uploadFile: (file: any, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return uni.uploadFile({
      url: '/api/upload',
      filePath: file.path,
      name: 'file',
      formData: {},
      success: (res) => {
        const data = JSON.parse(res.data)
        return data
      }
    })
  }
}

export const api = {
  ...taskApi,
  ...projectApi,
  ...userApi,
  ...notificationApi,
  ...uploadApi
}

export default api