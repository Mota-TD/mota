/**
 * TaskTree 数据处理 Hook
 */

import { useMemo, useState, useCallback } from 'react'
import type { Task, DepartmentTask } from '../../types'
import type { TreeNodeData, GroupBy, SortOption } from './types'
import { TaskStatus, DepartmentTaskStatus } from '../../types'

interface UseTaskTreeOptions {
  departmentTasks: DepartmentTask[]
  tasks: Task[]
  groupBy?: GroupBy
  sort?: SortOption
  searchValue?: string
}

interface UseTaskTreeReturn {
  treeData: TreeNodeData[]
  expandedKeys: string[]
  setExpandedKeys: (keys: string[]) => void
  expandAll: () => void
  collapseAll: () => void
  filterBySearch: (value: string) => void
  groupBy: GroupBy
  setGroupBy: (groupBy: GroupBy) => void
  sort: SortOption
  setSort: (sort: SortOption) => void
}

/**
 * 获取任务状态颜色
 */
const getTaskStatusColor = (status: TaskStatus | string): string => {
  const colorMap: Record<string, string> = {
    pending: '#d9d9d9',
    in_progress: '#1890ff',
    paused: '#faad14',
    completed: '#52c41a',
    cancelled: '#ff4d4f',
  }
  return colorMap[status] || '#d9d9d9'
}

/**
 * 获取部门任务状态颜色
 */
const getDeptTaskStatusColor = (status: DepartmentTaskStatus | string): string => {
  const colorMap: Record<string, string> = {
    pending: '#d9d9d9',
    planning: '#722ed1',
    in_progress: '#1890ff',
    completed: '#52c41a',
    cancelled: '#ff4d4f',
  }
  return colorMap[status] || '#d9d9d9'
}

/**
 * 将任务转换为树节点
 */
const taskToTreeNode = (task: Task): TreeNodeData => ({
  key: `task-${task.id}`,
  title: task.name,
  type: 'task',
  data: task,
  isLeaf: true,
  status: task.status,
  progress: task.progress,
  priority: task.priority,
  assigneeName: task.assigneeName,
  startDate: task.startDate,
  endDate: task.endDate,
})

/**
 * 将部门任务转换为树节点
 */
const deptTaskToTreeNode = (deptTask: DepartmentTask, childTasks: Task[]): TreeNodeData => ({
  key: `dept-task-${deptTask.id}`,
  title: deptTask.name,
  type: 'department-task',
  data: deptTask,
  isLeaf: childTasks.length === 0,
  children: childTasks.map(taskToTreeNode),
  status: deptTask.status,
  progress: deptTask.progress,
  priority: deptTask.priority,
  startDate: deptTask.startDate,
  endDate: deptTask.endDate,
})

/**
 * 按部门任务分组
 */
const groupByDepartmentTask = (
  departmentTasks: DepartmentTask[],
  tasks: Task[]
): TreeNodeData[] => {
  const tasksByDeptTask = new Map<string, Task[]>()
  
  // 按部门任务ID分组
  tasks.forEach(task => {
    const deptTaskId = task.departmentTaskId
    if (deptTaskId) {
      const existing = tasksByDeptTask.get(deptTaskId) || []
      existing.push(task)
      tasksByDeptTask.set(deptTaskId, existing)
    }
  })
  
  // 构建树结构
  return departmentTasks.map(deptTask => {
    const childTasks = tasksByDeptTask.get(deptTask.id) || []
    return deptTaskToTreeNode(deptTask, childTasks)
  })
}

/**
 * 按状态分组
 */
const groupByStatus = (tasks: Task[]): TreeNodeData[] => {
  const statusGroups: Record<string, Task[]> = {
    [TaskStatus.PENDING]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.PAUSED]: [],
    [TaskStatus.COMPLETED]: [],
    [TaskStatus.CANCELLED]: [],
  }
  
  const statusLabels: Record<string, string> = {
    [TaskStatus.PENDING]: '待开始',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.PAUSED]: '已暂停',
    [TaskStatus.COMPLETED]: '已完成',
    [TaskStatus.CANCELLED]: '已取消',
  }
  
  tasks.forEach(task => {
    const status = task.status || TaskStatus.PENDING
    if (statusGroups[status]) {
      statusGroups[status].push(task)
    }
  })
  
  return Object.entries(statusGroups)
    .filter(([_, groupTasks]) => groupTasks.length > 0)
    .map(([status, groupTasks]) => ({
      key: `status-${status}`,
      title: `${statusLabels[status]} (${groupTasks.length})`,
      type: 'task' as const,
      data: { id: status, name: statusLabels[status] },
      isLeaf: false,
      children: groupTasks.map(taskToTreeNode),
      status,
    }))
}

/**
 * 按优先级分组
 */
const groupByPriority = (tasks: Task[]): TreeNodeData[] => {
  const priorityGroups: Record<string, Task[]> = {
    urgent: [],
    high: [],
    medium: [],
    low: [],
  }
  
  const priorityLabels: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低',
  }
  
  tasks.forEach(task => {
    const priority = task.priority || 'medium'
    if (priorityGroups[priority]) {
      priorityGroups[priority].push(task)
    }
  })
  
  return Object.entries(priorityGroups)
    .filter(([_, groupTasks]) => groupTasks.length > 0)
    .map(([priority, groupTasks]) => ({
      key: `priority-${priority}`,
      title: `${priorityLabels[priority]}优先级 (${groupTasks.length})`,
      type: 'task' as const,
      data: { id: priority, name: priorityLabels[priority] },
      isLeaf: false,
      children: groupTasks.map(taskToTreeNode),
      priority,
    }))
}

/**
 * 按执行人分组
 */
const groupByAssignee = (tasks: Task[]): TreeNodeData[] => {
  const assigneeGroups = new Map<string, { name: string; avatar?: string; tasks: Task[] }>()
  
  tasks.forEach(task => {
    const assigneeId = task.assigneeId || 'unassigned'
    const assigneeName = task.assigneeName || '未分配'
    
    if (!assigneeGroups.has(assigneeId)) {
      assigneeGroups.set(assigneeId, {
        name: assigneeName,
        tasks: [],
      })
    }
    assigneeGroups.get(assigneeId)!.tasks.push(task)
  })
  
  return Array.from(assigneeGroups.entries()).map(([assigneeId, group]) => ({
    key: `assignee-${assigneeId}`,
    title: `${group.name} (${group.tasks.length})`,
    type: 'task' as const,
    data: { id: assigneeId, name: group.name },
    isLeaf: false,
    children: group.tasks.map(taskToTreeNode),
    assigneeName: group.name,
  }))
}

/**
 * 不分组，平铺显示
 */
const noGrouping = (tasks: Task[]): TreeNodeData[] => {
  return tasks.map(taskToTreeNode)
}

/**
 * 排序任务
 */
const sortTasks = (tasks: Task[], sort: SortOption): Task[] => {
  return [...tasks].sort((a, b) => {
    let comparison = 0
    
    switch (sort.field) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '')
        break
      case 'priority': {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                     (priorityOrder[b.priority as keyof typeof priorityOrder] || 2)
        break
      }
      case 'status': {
        const statusOrder = { pending: 0, in_progress: 1, paused: 2, completed: 3, cancelled: 4 }
        comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                     (statusOrder[b.status as keyof typeof statusOrder] || 0)
        break
      }
      case 'startDate':
        comparison = new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
        break
      case 'endDate':
        comparison = new Date(a.endDate || 0).getTime() - new Date(b.endDate || 0).getTime()
        break
      case 'progress':
        comparison = (a.progress || 0) - (b.progress || 0)
        break
      case 'createdAt':
        comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        break
    }
    
    return sort.order === 'asc' ? comparison : -comparison
  })
}

/**
 * 搜索过滤
 */
const filterBySearchValue = (nodes: TreeNodeData[], searchValue: string): TreeNodeData[] => {
  if (!searchValue) return nodes
  
  const lowerSearch = searchValue.toLowerCase()
  
  const filterNode = (node: TreeNodeData): TreeNodeData | null => {
    const titleMatch = node.title.toLowerCase().includes(lowerSearch)
    
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map(filterNode)
        .filter((n): n is TreeNodeData => n !== null)
      
      if (filteredChildren.length > 0 || titleMatch) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
        }
      }
    }
    
    return titleMatch ? node : null
  }
  
  return nodes.map(filterNode).filter((n): n is TreeNodeData => n !== null)
}

/**
 * 获取所有节点的 keys
 */
const getAllKeys = (nodes: TreeNodeData[]): string[] => {
  const keys: string[] = []
  
  const traverse = (nodeList: TreeNodeData[]) => {
    nodeList.forEach(node => {
      keys.push(node.key)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  
  traverse(nodes)
  return keys
}

export function useTaskTree({
  departmentTasks,
  tasks,
  groupBy: initialGroupBy = 'department-task',
  sort: initialSort = { field: 'priority', order: 'asc' },
  searchValue: initialSearchValue = '',
}: UseTaskTreeOptions): UseTaskTreeReturn {
  const [groupBy, setGroupBy] = useState<GroupBy>(initialGroupBy)
  const [sort, setSort] = useState<SortOption>(initialSort)
  const [searchValue, setSearchValue] = useState(initialSearchValue)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  
  // 构建树数据
  const treeData = useMemo(() => {
    // 先排序任务
    const sortedTasks = sortTasks(tasks, sort)
    
    // 根据分组方式构建树
    let nodes: TreeNodeData[]
    
    switch (groupBy) {
      case 'department-task':
        nodes = groupByDepartmentTask(departmentTasks, sortedTasks)
        break
      case 'status':
        nodes = groupByStatus(sortedTasks)
        break
      case 'priority':
        nodes = groupByPriority(sortedTasks)
        break
      case 'assignee':
        nodes = groupByAssignee(sortedTasks)
        break
      case 'none':
      default:
        nodes = noGrouping(sortedTasks)
        break
    }
    
    // 搜索过滤
    return filterBySearchValue(nodes, searchValue)
  }, [departmentTasks, tasks, groupBy, sort, searchValue])
  
  // 展开所有
  const expandAll = useCallback(() => {
    setExpandedKeys(getAllKeys(treeData))
  }, [treeData])
  
  // 折叠所有
  const collapseAll = useCallback(() => {
    setExpandedKeys([])
  }, [])
  
  // 搜索过滤
  const filterBySearch = useCallback((value: string) => {
    setSearchValue(value)
    // 搜索时自动展开所有匹配的节点
    if (value) {
      setExpandedKeys(getAllKeys(treeData))
    }
  }, [treeData])
  
  return {
    treeData,
    expandedKeys,
    setExpandedKeys,
    expandAll,
    collapseAll,
    filterBySearch,
    groupBy,
    setGroupBy,
    sort,
    setSort,
  }
}