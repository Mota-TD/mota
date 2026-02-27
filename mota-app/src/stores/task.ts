import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Task {
  id: string
  title: string
  description: string
  projectId?: string
  assignee?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'inProgress' | 'review' | 'completed' | 'cancelled'
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  attachments: string[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

interface Comment {
  id: string
  userId: string
  content: string
  timestamp: Date
}

interface TaskStats {
  total: number
  completed: number
  overdue: number
  highPriority: number
  averageCompletionTime: number
}

export const useTaskStore = defineStore('task', () => {
  // 状态
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const isLoading = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref<Task['status'] | 'all'>('all')
  const filterPriority = ref<Task['priority'] | 'all'>('all')

  // 计算属性
  const filteredTasks = computed(() => {
    let filtered = tasks.value
    
    // 状态筛选
    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus.value)
    }
    
    // 优先级筛选
    if (filterPriority.value !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority.value)
    }
    
    // 搜索筛选
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
  })

  const pendingTasks = computed(() => 
    tasks.value.filter(task => task.status !== 'completed' && task.status !== 'cancelled')
  )

  const overdueTasks = computed(() => 
    tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
        return false
      }
      return new Date(task.dueDate) < new Date()
    })
  )

  const taskStats = computed((): TaskStats => {
    const total = tasks.value.length
    const completed = tasks.value.filter(t => t.status === 'completed').length
    const overdue = overdueTasks.value.length
    const highPriority = tasks.value.filter(t => t.priority === 'high').length
    
    const completedTasks = tasks.value.filter(t => t.status === 'completed')
    const averageCompletionTime = completedTasks.length > 0 
      ? Math.round(completedTasks.reduce((sum, task) => {
          const start = new Date(task.createdAt)
          const end = new Date(task.updatedAt)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / completedTasks.length)
      : 0

    return {
      total,
      completed,
      overdue,
      highPriority,
      averageCompletionTime
    }
  })

  // 操作
  const loadTasks = async () => {
    isLoading.value = true
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟数据
      tasks.value = [
        {
          id: '1',
          title: '完成用户界面设计',
          description: '设计移动端应用的用户界面和交互流程',
          projectId: '1',
          assignee: 'user1',
          priority: 'high',
          status: 'inProgress',
          dueDate: new Date('2024-02-28'),
          estimatedHours: 8,
          actualHours: 6,
          tags: ['UI', '设计', '移动端'],
          attachments: [],
          comments: [
            {
              id: '1',
              userId: 'user1',
              content: '已完成初步设计，请评审',
              timestamp: new Date('2024-02-25')
            }
          ],
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: '编写API文档',
          description: '编写项目API接口文档和使用说明',
          projectId: '1',
          assignee: 'user2',
          priority: 'medium',
          status: 'todo',
          dueDate: new Date('2024-03-05'),
          estimatedHours: 12,
          actualHours: 0,
          tags: ['文档', 'API', '技术'],
          attachments: [],
          comments: [],
          createdAt: new Date('2024-02-22'),
          updatedAt: new Date()
        },
        {
          id: '3',
          title: '测试移动端功能',
          description: '对移动端应用进行功能测试和性能测试',
          projectId: '3',
          assignee: 'user1',
          priority: 'high',
          status: 'completed',
          dueDate: new Date('2024-02-20'),
          estimatedHours: 16,
          actualHours: 14,
          tags: ['测试', '移动端', '质量'],
          attachments: [],
          comments: [
            {
              id: '2',
              userId: 'user1',
              content: '测试完成，发现3个问题已修复',
              timestamp: new Date('2024-02-19')
            }
          ],
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2024-02-20')
        }
      ]
      
      // 从本地存储加载
      const savedTasks = uni.getStorageSync('tasks')
      if (savedTasks && savedTasks.length > 0) {
        tasks.value = savedTasks
      }
      
    } catch (error) {
      console.error('加载任务列表失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      tasks.value.unshift(newTask)
      saveToStorage()
      
      return { success: true, task: newTask }
    } catch (error) {
      console.error('创建任务失败:', error)
      return { success: false }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === id)
      if (taskIndex === -1) {
        return { success: false, error: '任务不存在' }
      }
      
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        ...updates,
        updatedAt: new Date()
      }
      
      saveToStorage()
      
      // 如果更新的是当前任务，也需要更新当前任务状态
      if (currentTask.value?.id === id) {
        currentTask.value = tasks.value[taskIndex]
      }
      
      return { success: true }
    } catch (error) {
      console.error('更新任务失败:', error)
      return { success: false }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === id)
      if (taskIndex === -1) {
        return { success: false, error: '任务不存在' }
      }
      
      tasks.value.splice(taskIndex, 1)
      saveToStorage()
      
      return { success: true }
    } catch (error) {
      console.error('删除任务失败:', error)
      return { success: false }
    }
  }

  const setTaskStatus = async (id: string, status: Task['status']) => {
    return await updateTask(id, { status })
  }

  const addComment = async (taskId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex === -1) {
        return { success: false, error: '任务不存在' }
      }
      
      const newComment: Comment = {
        ...comment,
        id: Date.now().toString(),
        timestamp: new Date()
      }
      
      tasks.value[taskIndex].comments.push(newComment)
      tasks.value[taskIndex].updatedAt = new Date()
      
      saveToStorage()
      
      return { success: true, comment: newComment }
    } catch (error) {
      console.error('添加评论失败:', error)
      return { success: false }
    }
  }

  const setCurrentTask = (id: string) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      currentTask.value = task
    }
  }

  const clearCurrentTask = () => {
    currentTask.value = null
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setFilterStatus = (status: Task['status'] | 'all') => {
    filterStatus.value = status
  }

  const setFilterPriority = (priority: Task['priority'] | 'all') => {
    filterPriority.value = priority
  }

  const saveToStorage = () => {
    uni.setStorageSync('tasks', tasks.value)
  }

  const loadFromStorage = () => {
    const savedTasks = uni.getStorageSync('tasks')
    if (savedTasks) {
      tasks.value = savedTasks
    }
  }

  // 初始化
  const initialize = () => {
    loadFromStorage()
  }

  return {
    // 状态
    tasks,
    currentTask,
    isLoading,
    searchQuery,
    filterStatus,
    filterPriority,
    
    // 计算属性
    filteredTasks,
    pendingTasks,
    overdueTasks,
    taskStats,
    
    // 操作
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    addComment,
    setCurrentTask,
    clearCurrentTask,
    setSearchQuery,
    setFilterStatus,
    setFilterPriority,
    saveToStorage,
    loadFromStorage,
    initialize
  }
})