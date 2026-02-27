import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Project {
  id: string
  name: string
  description: string
  icon: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  progress: number
  startDate?: Date
  endDate?: Date
  members: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  overdue: number
  averageProgress: number
}

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const isLoading = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref<Project['status'] | 'all'>('all')

  // 计算属性
  const filteredProjects = computed(() => {
    let filtered = projects.value
    
    // 状态筛选
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus.value)
    }
    
    // 搜索筛选
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
  })

  const projectStats = computed((): ProjectStats => {
    const total = projects.value.length
    const active = projects.value.filter(p => p.status === 'active').length
    const completed = projects.value.filter(p => p.status === 'completed').length
    const overdue = projects.value.filter(p => {
      if (!p.endDate) return false
      return new Date(p.endDate) < new Date() && p.status !== 'completed'
    }).length
    
    const averageProgress = total > 0 
      ? Math.round(projects.value.reduce((sum, p) => sum + p.progress, 0) / total)
      : 0

    return {
      total,
      active,
      completed,
      overdue,
      averageProgress
    }
  })

  const recentProjects = computed(() => 
    projects.value
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  )

  // 操作
  const loadProjects = async () => {
    isLoading.value = true
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟数据
      projects.value = [
        {
          id: '1',
          name: 'MOTA系统重构',
          description: '全面重构MOTA项目管理系统的前端架构',
          icon: '🚀',
          status: 'active',
          progress: 75,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-30'),
          members: ['user1', 'user2'],
          tags: ['重构', '前端', 'Vue3'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'AI助手优化',
          description: '提升AI助手在项目管理中的智能化程度',
          icon: '🤖',
          status: 'planning',
          progress: 0,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-08-31'),
          members: ['user1'],
          tags: ['AI', '优化', '机器学习'],
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: '移动端开发',
          description: '开发MOTA系统的移动端应用程序',
          icon: '📱',
          status: 'completed',
          progress: 100,
          startDate: new Date('2023-09-01'),
          endDate: new Date('2023-12-31'),
          members: ['user1', 'user2', 'user3'],
          tags: ['移动端', 'uni-app', 'Vue3'],
          createdAt: new Date('2023-08-15'),
          updatedAt: new Date('2023-12-31')
        }
      ]
      
      // 从本地存储加载
      const savedProjects = uni.getStorageSync('projects')
      if (savedProjects && savedProjects.length > 0) {
        projects.value = savedProjects
      }
      
    } catch (error) {
      console.error('加载项目列表失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      projects.value.unshift(newProject)
      saveToStorage()
      
      return { success: true, project: newProject }
    } catch (error) {
      console.error('创建项目失败:', error)
      return { success: false }
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const projectIndex = projects.value.findIndex(p => p.id === id)
      if (projectIndex === -1) {
        return { success: false, error: '项目不存在' }
      }
      
      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        ...updates,
        updatedAt: new Date()
      }
      
      saveToStorage()
      
      // 如果更新的是当前项目，也需要更新当前项目状态
      if (currentProject.value?.id === id) {
        currentProject.value = projects.value[projectIndex]
      }
      
      return { success: true }
    } catch (error) {
      console.error('更新项目失败:', error)
      return { success: false }
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const projectIndex = projects.value.findIndex(p => p.id === id)
      if (projectIndex === -1) {
        return { success: false, error: '项目不存在' }
      }
      
      projects.value.splice(projectIndex, 1)
      saveToStorage()
      
      return { success: true }
    } catch (error) {
      console.error('删除项目失败:', error)
      return { success: false }
    }
  }

  const setCurrentProject = (id: string) => {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      currentProject.value = project
    }
  }

  const clearCurrentProject = () => {
    currentProject.value = null
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setFilterStatus = (status: Project['status'] | 'all') => {
    filterStatus.value = status
  }

  const saveToStorage = () => {
    uni.setStorageSync('projects', projects.value)
  }

  const loadFromStorage = () => {
    const savedProjects = uni.getStorageSync('projects')
    if (savedProjects) {
      projects.value = savedProjects
    }
  }

  // 初始化
  const initialize = () => {
    loadFromStorage()
  }

  return {
    // 状态
    projects,
    currentProject,
    isLoading,
    searchQuery,
    filterStatus,
    
    // 计算属性
    filteredProjects,
    projectStats,
    recentProjects,
    
    // 操作
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    clearCurrentProject,
    setSearchQuery,
    setFilterStatus,
    saveToStorage,
    loadFromStorage,
    initialize
  }
})