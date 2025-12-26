import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Avatar,
  Tag,
  Progress,
  Dropdown,
  Modal,
  Empty,
  Spin,
  Typography,
  Space,
  Table,
  Statistic,
  Tooltip,
  Tabs,
  Drawer,
  Form,
  DatePicker,
  Checkbox,
  Switch,
  Divider,
  Popconfirm,
  ColorPicker,
  Steps,
  List,
  App,
  Segmented,
  Upload
} from 'antd'
import type { Color } from 'antd/es/color-picker'
import {
  PlusOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FolderAddOutlined,
  BulbOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  BellOutlined,
  SafetyOutlined,
  SaveOutlined,
  ApartmentOutlined,
  FlagOutlined,
  UserOutlined,
  CalendarOutlined,
  RobotOutlined,
  UndoOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CloseOutlined,
  EyeOutlined,
  BarChartOutlined,
  TableOutlined,
  UserAddOutlined,
  UploadOutlined,
  FileOutlined,
  PaperClipOutlined,
  HolderOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import * as projectApi from '@/services/api/project'
import type { Project as ProjectType, ProjectMember, ProjectStatistics, Milestone } from '@/services/api/project'
import { departmentApi, departmentTaskApi, taskApi } from '@/services/api'
import type { DepartmentTask, DepartmentTaskStatus } from '@/services/api/departmentTask'
import type { Task, TaskStatus } from '@/services/api/task'
import { getUsers } from '@/services/api/user'
import { getRecentActivities } from '@/services/api/activity'
import type { Department } from '@/services/api/department'
import AIProjectAssistant from '@/components/AIProjectAssistant'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import GanttChart from '@/components/GanttChart'
import type { GanttTask } from '@/components/GanttChart'
import Calendar from '@/components/Calendar'
import KanbanBoard from '@/components/KanbanBoard'
import type { KanbanTask, TaskStatus as KanbanTaskStatus } from '@/components/KanbanBoard'
import ViewSaver from '@/components/ViewSaver'
import type { ViewConfigData } from '@/services/api/viewConfig'
import styles from './index.module.css'
import detailStyles from '../project-detail/index.module.css'

// 设置 dayjs 中文
dayjs.locale('zh-cn')

const { Title, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

// 项目颜色
const projectColors = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16',
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

interface Project {
  id: string
  name: string
  key: string
  description?: string
  status: string
  color?: string
  progress?: number
  memberCount?: number
  issueCount?: number
  starred?: number  // 0 or 1
  startDate?: string
  endDate?: string
  priority?: string
  visibility?: string
  ownerId?: string
}

// 项目状态配置
const PROJECT_STATUS_CONFIG: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  planning: { color: 'orange', text: '规划中', icon: <ClockCircleOutlined /> },
  active: { color: 'green', text: '进行中', icon: <PlayCircleOutlined /> },
  completed: { color: 'blue', text: '已完成', icon: <CheckCircleOutlined /> },
  suspended: { color: 'gold', text: '已暂停', icon: <PauseCircleOutlined /> },
  cancelled: { color: 'red', text: '已取消', icon: <StopOutlined /> },
  archived: { color: 'default', text: '已归档', icon: <InboxOutlined /> }
}

// 优先级配置
const PRIORITY_CONFIG: Record<string, { color: string; text: string }> = {
  low: { color: 'green', text: '低' },
  medium: { color: 'blue', text: '中' },
  high: { color: 'orange', text: '高' },
  urgent: { color: 'red', text: '紧急' }
}

// 里程碑接口
interface MilestoneItem {
  id: string
  name: string
  targetDate: string
  description?: string
  assigneeIds?: string[]  // 负责人ID列表（支持多负责人）
}

/**
 * 项目管理页面
 * 包含项目列表、项目分析、项目看板、项目甘特图四个视图
 */
const Projects = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gantt' | 'calendar' | 'kanban'>('grid')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // 创建项目抽屉相关状态
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(projectColors[0])
  const [form] = Form.useForm()
  
  // 实时预览状态
  const [previewName, setPreviewName] = useState('')
  const [previewDesc, setPreviewDesc] = useState('')
  
  // 4步向导相关状态
  const [currentStep, setCurrentStep] = useState(0)
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '', description: '', assigneeIds: [] as string[] })
  const [editingMilestone, setEditingMilestone] = useState<MilestoneItem | null>(null)
  const [draggedMilestone, setDraggedMilestone] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  
  // 项目标识（系统自动生成）
  const [projectKey, setProjectKey] = useState<string>('')
  const [loadingKey, setLoadingKey] = useState(false)
  
  // 编辑项目抽屉相关状态
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editForm] = Form.useForm()
  const [editSelectedColor, setEditSelectedColor] = useState(projectColors[0])
  const [editPreviewName, setEditPreviewName] = useState('')
  const [editPreviewDesc, setEditPreviewDesc] = useState('')
  
  // 项目设置抽屉相关状态
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsProject, setSettingsProject] = useState<Project | null>(null)
  const [settingsForm] = Form.useForm()
  const [settingsProjectColor, setSettingsProjectColor] = useState<string>('#2b7de9')
  
  // 项目详情抽屉相关状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null)
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStatistics | null>(null)
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<any[]>([])
  
  // 视图配置状态
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewConfigData>({
    filters: {},
    sort: { field: 'createdAt', order: 'desc' },
    columns: ['name', 'status', 'progress', 'memberCount'],
    viewMode: 'grid'
  })
  
  // 当前激活的标签页
  const activeTab = searchParams.get('tab') || 'list'

  useEffect(() => {
    loadProjects()
    loadDepartmentsAndUsers()
  }, [])
  
  // 加载部门和用户数据
  const loadDepartmentsAndUsers = async () => {
    setLoadingData(true)
    try {
      const [deptsRes, usersRes] = await Promise.all([
        departmentApi.getDepartmentsByOrgId('default').catch((err) => {
          console.warn('Failed to load departments from API:', err)
          return []
        }),
        getUsers().catch((err) => {
          console.warn('Failed to load users from API:', err)
          return null
        })
      ])
      
      // 从API加载部门数据，与部门管理页面保持一致
      setDepartments(deptsRes || [])
      
      if (usersRes && (usersRes as any).list && (usersRes as any).list.length > 0) {
        setUsers((usersRes as any).list)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setDepartments([])
      setUsers([])
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    filterProjects()
  }, [projects, searchText, statusFilter])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await projectApi.getProjects()
      // 添加模拟的日期数据用于甘特图
      const projectsWithDates = (res.list || []).map((p: Project, index: number) => ({
        ...p,
        startDate: `2024-0${(index % 3) + 1}-01`,
        endDate: `2024-0${(index % 3) + 4}-30`,
      }))
      setProjects(projectsWithDates)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = [...projects]
    
    if (searchText) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.key.toLowerCase().includes(searchText.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    
    setFilteredProjects(filtered)
  }

  // 加载下一个项目标识
  const loadNextProjectKey = async () => {
    setLoadingKey(true)
    try {
      const nextKey = await projectApi.getNextProjectKey()
      setProjectKey(nextKey)
    } catch (error) {
      console.error('Failed to load next project key:', error)
      setProjectKey('AF-0001') // 默认值
    } finally {
      setLoadingKey(false)
    }
  }

  // 打开创建项目抽屉
  const openCreateDrawer = async () => {
    setDrawerVisible(true)
    setCurrentStep(0)
    setSelectedColor(projectColors[0])
    setPreviewName('')
    setPreviewDesc('')
    setSelectedDepartments([])
    setSelectedMembers([])
    setMilestones([])
    setNewMilestone({ name: '', targetDate: '', description: '', assigneeIds: [] })
    setFormData({})
    setUploadedFiles([])
    form.resetFields()
    // 加载下一个项目标识
    await loadNextProjectKey()
  }

  // 关闭创建项目抽屉
  const closeCreateDrawer = () => {
    setDrawerVisible(false)
    setCurrentStep(0)
    form.resetFields()
    setPreviewName('')
    setPreviewDesc('')
    setSelectedDepartments([])
    setSelectedMembers([])
    setMilestones([])
    setFormData({})
    setUploadedFiles([])
  }

  // 提交创建项目
  const handleCreateProject = async () => {
    setCreateLoading(true)
    try {
      const dateRange = formData.dateRange
      // 项目标识由系统自动生成，无需前端传递
      // 使用完整创建 API 以支持成员和里程碑
      await projectApi.createProjectFull({
        name: formData.name,
        description: formData.description,
        color: selectedColor,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        ownerId: formData.ownerId,
        // 过滤掉默认部门ID（以 'default_' 开头的）
        departmentIds: selectedDepartments.filter(id => !String(id).startsWith('default_')),
        memberIds: selectedMembers,
        milestones: milestones.map(m => ({
          name: m.name,
          targetDate: m.targetDate,
          description: m.description,
          assigneeIds: m.assigneeIds  // 里程碑负责人
        }))
      })
      
      message.success('项目创建成功')
      closeCreateDrawer()
      loadProjects()
    } catch (error: unknown) {
      console.error('Create project error:', error)
      const errorMessage = error instanceof Error ? error.message : '创建失败，请重试'
      message.error(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }
  
  // 下一步
  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields()
        setFormData({ ...formData, ...values })
        setPreviewName(values.name || '')
        setPreviewDesc(values.description || '')
        setCurrentStep(1)
      } catch {
        // 验证失败
      }
    }
  }

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }
  
  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList: uploadedFiles,
    beforeUpload: (file: any) => {
      // 限制文件大小为 50MB
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB')
        return Upload.LIST_IGNORE
      }
      // 添加到文件列表
      setUploadedFiles(prev => [...prev, file])
      return false // 阻止自动上传
    },
    onRemove: (file: any) => {
      setUploadedFiles(prev => prev.filter(f => f.uid !== file.uid))
    }
  }

  // 切换成员选择
  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  // 全选部门成员
  const handleSelectAllDeptMembers = (deptId: string) => {
    const deptMembers = users.filter(u => u.departmentId === deptId).map(u => u.id)
    const allSelected = deptMembers.every(id => selectedMembers.includes(id))
    
    if (allSelected) {
      setSelectedMembers(selectedMembers.filter(id => !deptMembers.includes(id)))
    } else {
      const newMembers = [...selectedMembers]
      deptMembers.forEach(id => {
        if (!newMembers.includes(id)) {
          newMembers.push(id)
        }
      })
      setSelectedMembers(newMembers)
    }
  }

  // 添加里程碑
  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.targetDate) {
      message.warning('请填写里程碑名称和目标日期')
      return
    }
    
    if (!newMilestone.assigneeIds || newMilestone.assigneeIds.length === 0) {
      message.warning('请选择至少一个里程碑负责人')
      return
    }
    
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        name: newMilestone.name,
        targetDate: newMilestone.targetDate,
        description: newMilestone.description,
        assigneeIds: newMilestone.assigneeIds
      }
    ])
    setNewMilestone({ name: '', targetDate: '', description: '', assigneeIds: [] })
  }

  // 删除里程碑
  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  // 编辑里程碑
  const handleEditMilestone = (milestone: MilestoneItem) => {
    setEditingMilestone({ ...milestone })
  }

  // 保存编辑的里程碑
  const handleSaveEditMilestone = () => {
    if (!editingMilestone) return
    
    if (!editingMilestone.name || !editingMilestone.targetDate) {
      message.warning('请填写里程碑名称和目标日期')
      return
    }
    
    if (!editingMilestone.assigneeIds || editingMilestone.assigneeIds.length === 0) {
      message.warning('请选择至少一个里程碑负责人')
      return
    }
    
    setMilestones(milestones.map(m =>
      m.id === editingMilestone.id ? editingMilestone : m
    ))
    setEditingMilestone(null)
    message.success('里程碑已更新')
  }

  // 取消编辑里程碑
  const handleCancelEditMilestone = () => {
    setEditingMilestone(null)
  }

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedMilestone(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedMilestone(null)
  }

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // 放置
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedMilestone || draggedMilestone === targetId) return
    
    const dragIndex = milestones.findIndex(m => m.id === draggedMilestone)
    const targetIndex = milestones.findIndex(m => m.id === targetId)
    
    if (dragIndex === -1 || targetIndex === -1) return
    
    const newMilestones = [...milestones]
    const [removed] = newMilestones.splice(dragIndex, 1)
    newMilestones.splice(targetIndex, 0, removed)
    
    setMilestones(newMilestones)
    setDraggedMilestone(null)
  }

  // AI生成里程碑建议
  const handleAIGenerateMilestones = () => {
    const dateRange = formData.dateRange
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('请先设置项目周期')
      return
    }
    
    const startDate = dateRange[0]
    const endDate = dateRange[1]
    const duration = endDate.diff(startDate, 'day')
    
    // 根据项目周期生成建议里程碑
    const suggestedMilestones: MilestoneItem[] = []
    
    if (duration >= 30) {
      suggestedMilestones.push({
        id: Date.now().toString() + '_1',
        name: '需求确认',
        targetDate: startDate.add(Math.floor(duration * 0.15), 'day').format('YYYY-MM-DD'),
        description: '完成需求分析和确认'
      })
    }
    
    if (duration >= 60) {
      suggestedMilestones.push({
        id: Date.now().toString() + '_2',
        name: '方案设计完成',
        targetDate: startDate.add(Math.floor(duration * 0.3), 'day').format('YYYY-MM-DD'),
        description: '完成整体方案设计'
      })
    }
    
    suggestedMilestones.push({
      id: Date.now().toString() + '_3',
      name: '中期检查',
      targetDate: startDate.add(Math.floor(duration * 0.5), 'day').format('YYYY-MM-DD'),
      description: '项目中期进度检查'
    })
    
    if (duration >= 45) {
      suggestedMilestones.push({
        id: Date.now().toString() + '_4',
        name: '测试验收',
        targetDate: startDate.add(Math.floor(duration * 0.85), 'day').format('YYYY-MM-DD'),
        description: '完成测试和验收'
      })
    }
    
    suggestedMilestones.push({
      id: Date.now().toString() + '_5',
      name: '项目完成',
      targetDate: endDate.format('YYYY-MM-DD'),
      description: '项目交付和总结',
      assigneeIds: formData.ownerId ? [formData.ownerId] : []
    })
    
    // 为所有建议的里程碑设置默认负责人为项目负责人
    const milestonesWithAssignees = suggestedMilestones.map(m => ({
      ...m,
      assigneeIds: formData.ownerId ? [formData.ownerId] : []
    }))
    
    setMilestones(milestonesWithAssignees)
    message.success('已生成里程碑建议，默认负责人为项目总负责人')
  }

  // 打开编辑项目抽屉
  const openEditDrawer = (project: Project) => {
    setEditingProject(project)
    setEditSelectedColor(project.color || projectColors[0])
    setEditPreviewName(project.name)
    setEditPreviewDesc(project.description || '')
    editForm.setFieldsValue({
      name: project.name,
      description: project.description,
      key: project.key
    })
    setEditDrawerVisible(true)
  }

  // 关闭编辑项目抽屉
  const closeEditDrawer = () => {
    setEditDrawerVisible(false)
    setEditingProject(null)
    editForm.resetFields()
    setEditPreviewName('')
    setEditPreviewDesc('')
  }

  // 提交编辑项目
  const handleEditProject = async (values: Record<string, unknown>) => {
    if (!editingProject) return
    
    setEditLoading(true)
    try {
      await projectApi.updateProject(editingProject.id, {
        name: values.name as string,
        description: values.description as string | undefined,
        color: editSelectedColor,
      })
      
      message.success('项目更新成功')
      closeEditDrawer()
      loadProjects()
    } catch (error: unknown) {
      console.error('Update project error:', error)
      const errorMessage = error instanceof Error ? error.message : '更新失败，请重试'
      message.error(errorMessage)
    } finally {
      setEditLoading(false)
    }
  }

  // 处理编辑表单值变化，实时更新预览
  const handleEditFormValuesChange = (changedValues: Record<string, unknown>) => {
    if ('name' in changedValues) {
      setEditPreviewName(changedValues.name as string || '')
    }
    if ('description' in changedValues) {
      setEditPreviewDesc(changedValues.description as string || '')
    }
  }

  // 打开项目设置抽屉
  const openSettingsDrawer = (project: Project) => {
    setSettingsProject(project)
    setSettingsProjectColor(project.color || '#2b7de9')
    settingsForm.setFieldsValue({
      name: project.name,
      key: project.key,
      description: project.description,
      visibility: 'private',
      notifyOnTaskCreate: true,
      notifyOnTaskUpdate: true,
      notifyOnComment: true,
      notifyOnMention: true,
    })
    setSettingsDrawerVisible(true)
  }

  // 关闭项目设置抽屉
  const closeSettingsDrawer = () => {
    setSettingsDrawerVisible(false)
    setSettingsProject(null)
    settingsForm.resetFields()
  }

  // 保存项目设置
  const handleSaveSettings = async () => {
    if (!settingsProject) return
    
    try {
      setSettingsLoading(true)
      await settingsForm.validateFields()
      const values = settingsForm.getFieldsValue()
      
      await projectApi.updateProject(settingsProject.id, {
        name: values.name as string,
        description: values.description as string | undefined,
        color: settingsProjectColor,
      })
      
      message.success('设置已保存')
      closeSettingsDrawer()
      loadProjects()
    } catch (error) {
      console.error('Save settings error:', error)
      const errorMessage = error instanceof Error ? error.message : '保存失败，请重试'
      message.error(errorMessage)
    } finally {
      setSettingsLoading(false)
    }
  }

  // 处理设置颜色变化
  const handleSettingsColorChange = (color: Color) => {
    setSettingsProjectColor(color.toHexString())
  }

  // 归档项目
  const handleArchiveProject = async () => {
    if (!settingsProject) return
    try {
      await projectApi.archiveProject(settingsProject.id)
      message.success('项目已归档')
      closeSettingsDrawer()
      loadProjects()
    } catch {
      message.error('归档失败')
    }
  }

  // 恢复归档项目
  const handleRestoreProject = async (projectId: string) => {
    try {
      await projectApi.restoreProject(projectId)
      message.success('项目已恢复')
      loadProjects()
    } catch {
      message.error('恢复失败')
    }
  }

  // 删除项目（从设置抽屉）
  const handleDeleteProjectFromSettings = async () => {
    if (!settingsProject) return
    try {
      await projectApi.deleteProject(settingsProject.id)
      message.success('项目已删除')
      closeSettingsDrawer()
      loadProjects()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleStar = async (projectId: string, starred: number) => {
    try {
      await projectApi.toggleProjectStar(projectId)
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, starred: starred === 1 ? 0 : 1 } : p
      ))
      message.success(starred === 1 ? '已取消收藏' : '已收藏')
    } catch {
      message.error('操作失败')
    }
  }

  // 打开项目详情抽屉
  const openDetailDrawer = async (project: Project) => {
    setSelectedProject(project as ProjectType)
    setDetailDrawerVisible(true)
    setDetailLoading(true)
    
    try {
      // 尝试加载完整项目详情
      let projectRes: ProjectType
      let hasFullDetails = false
      try {
        const fullRes = await projectApi.getProjectDetailFull(project.id)
        projectRes = fullRes
        hasFullDetails = true
        if (fullRes.members) setProjectMembers(fullRes.members)
        if (fullRes.milestones) setProjectMilestones(fullRes.milestones)
        if (fullRes.statistics) setProjectStats(fullRes.statistics)
      } catch {
        // 回退到简单查询
        projectRes = await projectApi.getProjectById(project.id)
      }
      
      const [deptTasksRes, tasksRes, activitiesRes] = await Promise.all([
        departmentTaskApi.getDepartmentTasksByProjectId(project.id).catch(() => []),
        taskApi.getTasksByProjectId(project.id).catch(() => []),
        getRecentActivities(5).catch(() => [])
      ])
      
      setSelectedProject(projectRes)
      setDepartmentTasks(deptTasksRes || [])
      setTasks(tasksRes || [])
      setActivities(activitiesRes as any || [])
      
      // 如果没有从完整详情获取成员和里程碑，单独加载
      if (!hasFullDetails) {
        try {
          const members = await projectApi.getProjectMembers(project.id)
          setProjectMembers(members || [])
        } catch {
          setProjectMembers([])
        }
        
        try {
          const milestones = await projectApi.getProjectMilestones(project.id)
          setProjectMilestones(milestones || [])
        } catch {
          setProjectMilestones([])
        }
        
        try {
          const stats = await projectApi.getProjectStatistics(project.id)
          setProjectStats(stats)
        } catch {
          setProjectStats(null)
        }
      }
    } catch (error) {
      console.error('Failed to load project details:', error)
      message.error('加载项目详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  // 关闭项目详情抽屉
  const closeDetailDrawer = () => {
    setDetailDrawerVisible(false)
    setSelectedProject(null)
    setProjectMembers([])
    setProjectMilestones([])
    setProjectStats(null)
    setDepartmentTasks([])
    setTasks([])
    setActivities([])
  }

  // 刷新项目详情数据
  const refreshProjectDetail = async () => {
    if (!selectedProject) return
    await openDetailDrawer(selectedProject as Project)
  }

  // 获取项目状态标签（详情抽屉用）
  const getDetailStatusTag = (status: string) => {
    const config = PROJECT_STATUS_CONFIG[status] || { color: 'default', text: status, icon: null }
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // 获取优先级标签
  const getPriorityTag = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || { color: 'default', text: priority }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 获取部门任务状态标签
  const getDeptTaskStatusTag = (status: DepartmentTaskStatus) => {
    return <Tag color={departmentTaskApi.getStatusColor(status)}>{departmentTaskApi.getStatusText(status)}</Tag>
  }

  // 获取任务状态标签
  const getTaskStatusTag = (status: TaskStatus) => {
    return <Tag color={taskApi.getStatusColor(status)}>{taskApi.getStatusText(status)}</Tag>
  }

  // 获取任务优先级标签
  const getTaskPriorityTag = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || { color: 'default', text: priority }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const handleDeleteProject = async (projectId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除项目后，所有相关数据将被清除，此操作不可恢复。',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectApi.deleteProject(projectId)
          message.success('项目已删除')
          loadProjects()
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key })
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: '进行中' },
      completed: { color: 'blue', text: '已完成' },
      archived: { color: 'default', text: '已归档' },
      planning: { color: 'orange', text: '规划中' }
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const getProjectMenuItems = (project: Project) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑项目',
      onClick: (info: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
        info.domEvent.stopPropagation()
        openEditDrawer(project)
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: (info: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
        info.domEvent.stopPropagation()
        openSettingsDrawer(project)
      }
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: (info: { domEvent: React.MouseEvent | React.KeyboardEvent }) => {
        info.domEvent.stopPropagation()
        handleDeleteProject(project.id)
      }
    }
  ]

  // ==================== 步骤内容渲染 ====================
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              visibility: 'private',
              ...formData
            }}
          >
            <div className={styles.drawerSectionTitle}>基本信息</div>
            
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="项目名称"
                  name="name"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input
                    size="large"
                    placeholder="请输入项目名称"
                    onChange={(e) => {
                      setPreviewName(e.target.value)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="项目标识"
                  tooltip="项目标识由系统自动生成，创建后不可修改"
                >
                  <Input
                    size="large"
                    value={loadingKey ? '加载中...' : projectKey}
                    disabled
                    style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a', fontWeight: 500 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="项目描述"
              name="description"
            >
              <TextArea
                rows={4}
                placeholder="请输入项目描述，帮助团队成员了解项目目标和范围"
                maxLength={500}
                showCount
                onChange={(e) => setPreviewDesc(e.target.value)}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="项目周期"
                  name="dateRange"
                  rules={[{ required: true, message: '请选择项目周期' }]}
                >
                  <RangePicker
                    size="large"
                    style={{ width: '100%' }}
                    placeholder={['开始日期', '结束日期']}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="项目负责人"
                  name="ownerId"
                  rules={[{ required: true, message: '请选择项目负责人' }]}
                >
                  <Select
                    size="large"
                    placeholder="请选择项目负责人"
                    notFoundContent={
                      <div style={{ padding: '16px', textAlign: 'center' }}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="暂无员工"
                        >
                          <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/members?action=add')}
                          >
                            添加员工
                          </Button>
                        </Empty>
                      </div>
                    }
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ padding: '0 8px 8px' }}>
                          <Button
                            type="link"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/members?action=add')}
                            style={{ width: '100%' }}
                          >
                            添加新员工
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    {users.map(user => {
                      const displayName = user.nickname || user.username || '未知用户'
                      return (
                        <Select.Option key={user.id} value={user.id}>
                          <Space>
                            <Avatar size="small" src={user.avatar}>{displayName.charAt(0)}</Avatar>
                            {displayName}
                          </Space>
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="项目颜色">
              <div className={styles.colorPicker}>
                {projectColors.map(color => (
                  <div
                    key={color}
                    className={`${styles.colorItem} ${selectedColor === color ? styles.colorItemActive : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </Form.Item>

            {/* 文件上传 */}
            <Form.Item
              label={
                <span>
                  <PaperClipOutlined style={{ marginRight: 4 }} />
                  项目附件
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>(可选)</span>
                </span>
              }
            >
              <Upload.Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined style={{ fontSize: 32, color: '#1677ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持上传项目相关文档、设计稿、需求文档等，单个文件不超过 50MB
                </p>
              </Upload.Dragger>
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">已选择 {uploadedFiles.length} 个文件</Text>
                </div>
              )}
            </Form.Item>
          </Form>
        )
      
      case 1:
        return (
          <div>
            <div className={styles.drawerSectionTitle}>
              <FlagOutlined style={{ marginRight: 8 }} />
              设置项目里程碑
              <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>(可选)</span>
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              设置项目的关键节点，帮助跟踪项目进度
            </p>
            
            <div className={styles.milestoneForm}>
              <Row gutter={12} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <Input
                    placeholder="里程碑名称"
                    value={newMilestone.name}
                    onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                  />
                </Col>
                <Col span={6}>
                  <DatePicker
                    placeholder="目标日期"
                    style={{ width: '100%' }}
                    value={newMilestone.targetDate ? dayjs(newMilestone.targetDate) : null}
                    onChange={(date) => setNewMilestone({ ...newMilestone, targetDate: date?.format('YYYY-MM-DD') || '' })}
                  />
                </Col>
                <Col span={10}>
                  <Input
                    placeholder="描述（可选）"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  />
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={18}>
                  <Select
                    mode="multiple"
                    placeholder="选择里程碑负责人（可多选）"
                    style={{ width: '100%' }}
                    value={newMilestone.assigneeIds}
                    onChange={(values) => setNewMilestone({ ...newMilestone, assigneeIds: values })}
                    optionFilterProp="children"
                    showSearch
                    notFoundContent={
                      <div style={{ padding: '8px', textAlign: 'center' }}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="暂无员工"
                        >
                          <Button
                            type="link"
                            size="small"
                            icon={<UserAddOutlined />}
                            onClick={() => navigate('/members?action=add')}
                          >
                            添加员工
                          </Button>
                        </Empty>
                      </div>
                    }
                  >
                    {users.map(user => {
                      const displayName = user.nickname || user.username || '未知用户'
                      return (
                        <Select.Option key={user.id} value={user.id}>
                          <Space>
                            <Avatar size="small" src={user.avatar}>{displayName.charAt(0)}</Avatar>
                            {displayName}
                          </Space>
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Col>
                <Col span={6}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMilestone} style={{ width: '100%' }}>
                    添加里程碑
                  </Button>
                </Col>
              </Row>
            </div>
            
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              <Button
                icon={<RobotOutlined />}
                onClick={handleAIGenerateMilestones}
              >
                AI智能生成里程碑建议
              </Button>
            </div>
            
            {milestones.length === 0 ? (
              <Empty description="暂未设置里程碑" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className={styles.milestoneList}>
                {milestones.map((item, index) => {
                  // 获取负责人信息
                  const assignees = (item.assigneeIds || []).map(id => {
                    const user = users.find(u => u.id === id)
                    return user ? (user.nickname || user.username || '未知用户') : '未知用户'
                  })
                  
                  const isEditing = editingMilestone?.id === item.id
                  const isDragging = draggedMilestone === item.id
                  
                  return (
                    <div
                      key={item.id}
                      className={`${styles.milestoneItem} ${isDragging ? styles.milestoneItemDragging : ''}`}
                      draggable={!isEditing}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      {isEditing ? (
                        // 编辑模式
                        <div className={styles.milestoneEditForm}>
                          <Row gutter={12} style={{ marginBottom: 12 }}>
                            <Col span={8}>
                              <Input
                                placeholder="里程碑名称"
                                value={editingMilestone.name}
                                onChange={(e) => setEditingMilestone({ ...editingMilestone, name: e.target.value })}
                              />
                            </Col>
                            <Col span={6}>
                              <DatePicker
                                placeholder="目标日期"
                                style={{ width: '100%' }}
                                value={editingMilestone.targetDate ? dayjs(editingMilestone.targetDate) : null}
                                onChange={(date) => setEditingMilestone({ ...editingMilestone, targetDate: date?.format('YYYY-MM-DD') || '' })}
                              />
                            </Col>
                            <Col span={10}>
                              <Input
                                placeholder="描述（可选）"
                                value={editingMilestone.description}
                                onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                              />
                            </Col>
                          </Row>
                          <Row gutter={12}>
                            <Col span={16}>
                              <Select
                                mode="multiple"
                                placeholder="选择里程碑负责人（可多选）"
                                style={{ width: '100%' }}
                                value={editingMilestone.assigneeIds}
                                onChange={(values) => setEditingMilestone({ ...editingMilestone, assigneeIds: values })}
                                optionFilterProp="children"
                                showSearch
                              >
                                {users.map(user => {
                                  const displayName = user.nickname || user.username || '未知用户'
                                  return (
                                    <Select.Option key={user.id} value={user.id}>
                                      <Space>
                                        <Avatar size="small" src={user.avatar}>{displayName.charAt(0)}</Avatar>
                                        {displayName}
                                      </Space>
                                    </Select.Option>
                                  )
                                })}
                              </Select>
                            </Col>
                            <Col span={8}>
                              <Space>
                                <Button type="primary" size="small" onClick={handleSaveEditMilestone}>
                                  保存
                                </Button>
                                <Button size="small" onClick={handleCancelEditMilestone}>
                                  取消
                                </Button>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      ) : (
                        // 显示模式
                        <>
                          <div className={styles.milestoneDragHandle}>
                            <HolderOutlined />
                          </div>
                          <div className={styles.milestoneIndex}>
                            <FlagOutlined />
                          </div>
                          <div className={styles.milestoneInfo}>
                            <div className={styles.milestoneTitle}>
                              <Space>
                                <span style={{ fontWeight: 500 }}>{item.name}</span>
                                {assignees.length > 0 && (
                                  <Avatar.Group maxCount={3} size="small">
                                    {(item.assigneeIds || []).map(id => {
                                      const user = users.find(u => u.id === id)
                                      const displayName = user?.nickname || user?.username || '未知'
                                      return (
                                        <Tooltip key={id} title={displayName}>
                                          <Avatar size="small" src={user?.avatar}>
                                            {displayName.charAt(0)}
                                          </Avatar>
                                        </Tooltip>
                                      )
                                    })}
                                  </Avatar.Group>
                                )}
                              </Space>
                            </div>
                            <div className={styles.milestoneDesc}>
                              <Space wrap>
                                <span><CalendarOutlined /> {item.targetDate}</span>
                                {item.description && <span>· {item.description}</span>}
                                {assignees.length > 0 && (
                                  <Tag color="blue" icon={<UserOutlined />}>
                                    {assignees.length} 位负责人
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          </div>
                          <div className={styles.milestoneActions}>
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEditMilestone(item)}
                            />
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteMilestone(item.id)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  // ==================== 创建项目抽屉内容 ====================
  const renderCreateDrawer = () => (
    <Drawer
      title={
        <span className={styles.drawerTitle}>
          <FolderAddOutlined className={styles.drawerTitleIcon} />
          新建项目
        </span>
      }
      placement="right"
      width={1100}
      onClose={closeCreateDrawer}
      open={drawerVisible}
      styles={{ body: { padding: 0 } }}
      footer={
        <div className={styles.drawerFooter}>
          <div>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                上一步
              </Button>
            )}
          </div>
          <Space>
            <Button onClick={closeCreateDrawer}>取消</Button>
            {currentStep < 1 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="primary" loading={createLoading} onClick={handleCreateProject}>
                完成创建
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div className={styles.drawerContent}>
        <Row gutter={24}>
          {/* 左侧表单区域 */}
          <Col xs={24} lg={16}>
            <Card className={styles.drawerFormCard}>
              <Steps
                current={currentStep}
                items={[
                  { title: '基本信息', icon: <ProjectOutlined /> },
                  { title: '设置里程碑', icon: <FlagOutlined /> },
                ]}
                style={{ marginBottom: 32 }}
              />
              
              {renderStepContent()}
            </Card>
          </Col>

          {/* 右侧预览和提示区域 */}
          <Col xs={24} lg={8}>
            {/* 预览卡片 */}
            <Card className={styles.drawerPreviewCard} title="项目预览">
              <div className={styles.drawerPreviewContent}>
                <Avatar
                  size={64}
                  style={{ backgroundColor: selectedColor }}
                  icon={<ProjectOutlined />}
                />
                <h3 className={styles.drawerPreviewName}>
                  {previewName || formData.name || '项目名称'}
                </h3>
                <p className={styles.drawerPreviewKey}>
                  {loadingKey ? '加载中...' : projectKey || '系统自动生成'}
                </p>
                <p className={styles.drawerPreviewDesc}>
                  {previewDesc || formData.description || '项目描述将显示在这里'}
                </p>
                
                {selectedMembers.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>项目成员</div>
                    <Avatar.Group maxCount={5}>
                      {selectedMembers.map(memberId => {
                        const member = users.find(u => u.id === memberId)
                        const memberName = member?.nickname || member?.username || '未知用户'
                        return (
                          <Tooltip key={memberId} title={memberName}>
                            <Avatar src={member?.avatar}>{memberName.charAt(0)}</Avatar>
                          </Tooltip>
                        )
                      })}
                    </Avatar.Group>
                  </div>
                )}
                
                {milestones.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>里程碑</div>
                    <div style={{ fontSize: 14, color: '#1a1a1a' }}>{milestones.length} 个</div>
                  </div>
                )}
              </div>
            </Card>

            {/* 提示信息 */}
            <Card
              className={styles.drawerTipsCard}
              title={
                <span>
                  <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
                  创建指南
                </span>
              }
            >
              <div className={styles.tipItem}>
                <RocketOutlined className={styles.tipIcon} />
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>步骤引导</div>
                  <div className={styles.tipDesc}>按照步骤完成项目创建，确保信息完整</div>
                </div>
              </div>
              <div className={styles.tipItem}>
                <SafetyCertificateOutlined className={styles.tipIcon} />
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>部门协作</div>
                  <div className={styles.tipDesc}>选择参与部门后可以为每个部门分配任务</div>
                </div>
              </div>
              <div className={styles.tipItem}>
                <ThunderboltOutlined className={styles.tipIcon} />
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>里程碑管理</div>
                  <div className={styles.tipDesc}>设置里程碑帮助跟踪项目关键节点</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Drawer>
  )

  // ==================== 编辑项目抽屉内容 ====================
  const renderEditDrawer = () => (
    <Drawer
      title={
        <span className={styles.drawerTitle}>
          <EditOutlined className={styles.drawerTitleIcon} />
          编辑项目
        </span>
      }
      placement="right"
      width={1100}
      onClose={closeEditDrawer}
      open={editDrawerVisible}
      styles={{ body: { padding: 0 } }}
      footer={
        <div className={styles.drawerFooter}>
          <Button onClick={closeEditDrawer}>取消</Button>
          <Button type="primary" loading={editLoading} onClick={() => editForm.submit()}>
            保存修改
          </Button>
        </div>
      }
    >
      <div className={styles.drawerContent}>
        <Row gutter={24}>
          {/* 左侧表单区域 */}
          <Col xs={24} lg={16}>
            <Card className={styles.drawerFormCard}>
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleEditProject}
                onValuesChange={handleEditFormValuesChange}
              >
                {/* 基本信息 */}
                <div className={styles.drawerSectionTitle}>基本信息</div>
                
                <Row gutter={16}>
                  <Col span={16}>
                    <Form.Item
                      label="项目名称"
                      name="name"
                      rules={[{ required: true, message: '请输入项目名称' }]}
                    >
                      <Input
                        size="large"
                        placeholder="请输入项目名称"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="项目标识"
                      name="key"
                      tooltip="项目标识创建后不可修改"
                    >
                      <Input
                        size="large"
                        disabled
                        className={styles.disabledInput}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="项目描述"
                  name="description"
                >
                  <TextArea
                    rows={4}
                    placeholder="请输入项目描述，帮助团队成员了解项目目标和范围"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                {/* 项目颜色 */}
                <Form.Item label="项目颜色">
                  <div className={styles.colorPicker}>
                    {projectColors.map(color => (
                      <div
                        key={color}
                        className={`${styles.colorItem} ${editSelectedColor === color ? styles.colorItemActive : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditSelectedColor(color)}
                      />
                    ))}
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 右侧预览区域 */}
          <Col xs={24} lg={8}>
            {/* 预览卡片 */}
            <Card className={styles.drawerPreviewCard} title="项目预览">
              <div className={styles.drawerPreviewContent}>
                <Avatar
                  size={64}
                  style={{ backgroundColor: editSelectedColor }}
                  icon={<ProjectOutlined />}
                />
                <h3 className={styles.drawerPreviewName}>
                  {editPreviewName || '项目名称'}
                </h3>
                <p className={styles.drawerPreviewKey}>
                  {editingProject?.key || 'AF-0001'}
                </p>
                <p className={styles.drawerPreviewDesc}>
                  {editPreviewDesc || '项目描述将显示在这里'}
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </Drawer>
  )

  // ==================== 项目设置抽屉内容 ====================
  const renderSettingsDrawer = () => {
    const settingsTabItems = [
      {
        key: 'general',
        label: (
          <span>
            <SettingOutlined />
            基本设置
          </span>
        ),
        children: (
          <div className={styles.settingsTabContent}>
            <Form.Item
              name="name"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>

            <Form.Item
              name="key"
              label="项目标识"
              rules={[{ required: true, message: '请输入项目标识' }]}
              extra="项目标识用于任务编号前缀，如 FE-1001"
            >
              <Input placeholder="请输入项目标识" style={{ width: 200 }} disabled />
            </Form.Item>

            <Form.Item
              name="description"
              label="项目描述"
            >
              <TextArea rows={4} placeholder="请输入项目描述" />
            </Form.Item>

            <Form.Item
              label="项目颜色"
            >
              <ColorPicker value={settingsProjectColor} onChange={handleSettingsColorChange} />
            </Form.Item>

            <Form.Item
              name="visibility"
              label="可见性"
            >
              <Select style={{ width: 200 }}>
                <Select.Option value="private">私有 - 仅项目成员可见</Select.Option>
                <Select.Option value="internal">内部 - 团队成员可见</Select.Option>
                <Select.Option value="public">公开 - 所有人可见</Select.Option>
              </Select>
            </Form.Item>

          </div>
        )
      },
      {
        key: 'notifications',
        label: (
          <span>
            <BellOutlined />
            通知设置
          </span>
        ),
        children: (
          <div className={styles.settingsTabContent}>
            <h3 className={styles.settingsSectionTitle}>任务通知</h3>
            
            <Form.Item
              name="notifyOnTaskCreate"
              label="创建任务时通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notifyOnTaskUpdate"
              label="更新任务时通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notifyOnComment"
              label="评论时通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notifyOnMention"
              label="被@时通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>
        )
      },
      {
        key: 'permissions',
        label: (
          <span>
            <SafetyOutlined />
            权限设置
          </span>
        ),
        children: (
          <div className={styles.settingsTabContent}>
            <h3 className={styles.settingsSectionTitle}>默认权限</h3>
            
            <Form.Item
              label="新成员默认角色"
            >
              <Select defaultValue="developer" style={{ width: 200 }}>
                <Select.Option value="admin">管理员</Select.Option>
                <Select.Option value="developer">开发者</Select.Option>
                <Select.Option value="designer">设计师</Select.Option>
                <Select.Option value="viewer">只读成员</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="谁可以创建任务"
            >
              <Select defaultValue="all" style={{ width: 200 }}>
                <Select.Option value="all">所有成员</Select.Option>
                <Select.Option value="admin">仅管理员</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="谁可以删除任务"
            >
              <Select defaultValue="admin" style={{ width: 200 }}>
                <Select.Option value="all">所有成员</Select.Option>
                <Select.Option value="admin">仅管理员</Select.Option>
                <Select.Option value="owner">仅创建者和管理员</Select.Option>
              </Select>
            </Form.Item>
          </div>
        )
      },
      {
        key: 'members',
        label: (
          <span>
            <TeamOutlined />
            成员管理
          </span>
        ),
        children: (
          <div className={styles.settingsTabContent}>
            <p>成员管理功能请前往 <a href="/members">成员管理</a> 页面</p>
          </div>
        )
      },
      {
        key: 'danger',
        label: (
          <span style={{ color: '#ff4d4f' }}>
            <DeleteOutlined />
            危险操作
          </span>
        ),
        children: (
          <div className={styles.settingsTabContent}>
            <div className={styles.dangerZone}>
              <h3>危险区域</h3>
              <p>以下操作不可逆，请谨慎操作</p>
              
              <div className={styles.dangerItem}>
                <div>
                  <h4>归档项目</h4>
                  <p>归档后项目将变为只读状态，可以随时恢复</p>
                </div>
                <Button danger onClick={handleArchiveProject}>归档项目</Button>
              </div>
              
              <Divider />
              
              <div className={styles.dangerItem}>
                <div>
                  <h4>删除项目</h4>
                  <p>删除后所有数据将被永久清除，无法恢复</p>
                </div>
                <Popconfirm
                  title="确定要删除项目吗？"
                  description="此操作不可逆，所有数据将被永久删除"
                  onConfirm={handleDeleteProjectFromSettings}
                  okText="确定删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger type="primary">删除项目</Button>
                </Popconfirm>
              </div>
            </div>
          </div>
        )
      }
    ]

    return (
      <Drawer
        title={
          <span className={styles.drawerTitle}>
            <SettingOutlined className={styles.drawerTitleIcon} />
            项目设置
          </span>
        }
        placement="right"
        width={1100}
        onClose={closeSettingsDrawer}
        open={settingsDrawerVisible}
        styles={{ body: { padding: 0 } }}
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={closeSettingsDrawer}>取消</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={settingsLoading}
              onClick={handleSaveSettings}
            >
              保存设置
            </Button>
          </div>
        }
      >
        <div className={styles.settingsDrawerContent}>
          <div className={styles.settingsHeader}>
            <Avatar
              shape="square"
              size={48}
              style={{ backgroundColor: settingsProjectColor }}
            >
              {settingsProject?.name?.charAt(0) || 'P'}
            </Avatar>
            <div className={styles.settingsHeaderInfo}>
              <h2>{settingsProject?.name || '项目名称'}</h2>
              <span className={styles.settingsHeaderKey}>{settingsProject?.key || 'KEY'}</span>
            </div>
          </div>
          
          <Form
            form={settingsForm}
            layout="vertical"
            name="settingsForm"
          >
            <Tabs items={settingsTabItems} className={styles.settingsTabs} />
          </Form>
        </div>
      </Drawer>
    )
  }

  // ==================== 甘特图数据转换 ====================
  const ganttTasks: GanttTask[] = useMemo(() => {
    return filteredProjects.map(project => ({
      id: project.id,
      name: project.name,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      progress: project.progress || 0,
      status: project.status === 'active' ? 'in_progress' : project.status === 'completed' ? 'completed' : 'pending',
      priority: project.priority || 'medium',
      assigneeName: project.ownerId ? `负责人 ${project.ownerId}` : undefined,
      color: project.color
    }))
  }, [filteredProjects])

  // ==================== 看板数据转换 ====================
  const kanbanTasks: KanbanTask[] = useMemo(() => {
    return filteredProjects.map(project => {
      let status: KanbanTaskStatus = 'todo'
      if (project.status === 'active') status = 'in_progress'
      else if (project.status === 'completed') status = 'done'
      else if (project.status === 'planning') status = 'todo'
      else if (project.status === 'archived') status = 'done'
      
      return {
        id: Number(project.id),
        title: project.name,
        description: project.description,
        status,
        priority: (project.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
        projectId: Number(project.id),
        projectName: project.key,
        dueDate: project.endDate
      }
    })
  }, [filteredProjects])

  // 处理看板任务移动
  const handleKanbanTaskMove = async (taskId: number, newStatus: KanbanTaskStatus): Promise<boolean> => {
    try {
      let projectStatus = 'planning'
      if (newStatus === 'in_progress') projectStatus = 'active'
      else if (newStatus === 'done') projectStatus = 'completed'
      else if (newStatus === 'review') projectStatus = 'active'
      
      await projectApi.updateProject(String(taskId), { status: projectStatus })
      loadProjects()
      return true
    } catch (error) {
      console.error('Failed to update project status:', error)
      return false
    }
  }

  // 处理看板任务点击
  const handleKanbanTaskClick = (task: KanbanTask) => {
    const project = projects.find(p => Number(p.id) === task.id)
    if (project) {
      openDetailDrawer(project)
    }
  }

  // 处理甘特图任务点击
  const handleGanttTaskClick = (task: GanttTask) => {
    const project = projects.find(p => p.id === task.id)
    if (project) {
      openDetailDrawer(project)
    }
  }

  // 处理视图配置应用
  const handleApplyViewConfig = (config: ViewConfigData) => {
    setCurrentViewConfig(config)
    // 应用筛选条件
    if (config.filters?.status) {
      setStatusFilter(config.filters.status as string)
    }
    if (config.filters?.search) {
      setSearchText(config.filters.search as string)
    }
    // 应用视图模式
    if (config.viewMode) {
      setViewMode(config.viewMode as typeof viewMode)
    }
  }

  // 更新当前视图配置
  const updateCurrentViewConfig = () => {
    setCurrentViewConfig({
      filters: {
        status: statusFilter,
        search: searchText
      },
      sort: { field: 'createdAt', order: 'desc' },
      columns: ['name', 'status', 'progress', 'memberCount'],
      viewMode
    })
  }

  // 监听筛选条件变化，更新视图配置
  useEffect(() => {
    updateCurrentViewConfig()
  }, [statusFilter, searchText, viewMode])

  // ==================== 项目列表视图 ====================
  const renderListTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="搜索项目"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'active', label: '进行中' },
              { value: 'completed', label: '已完成' },
              { value: 'archived', label: '已归档' }
            ]}
          />
        </div>
        <div className={styles.viewToggle}>
          <Space>
            <ViewSaver
              viewType="project"
              currentConfig={currentViewConfig}
              onApplyView={handleApplyViewConfig}
            />
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as typeof viewMode)}
              options={[
                { value: 'grid', icon: <AppstoreOutlined />, label: '卡片' },
                { value: 'list', icon: <UnorderedListOutlined />, label: '列表' },
                { value: 'gantt', icon: <BarChartOutlined />, label: '甘特图' },
                { value: 'calendar', icon: <CalendarOutlined />, label: '日历' },
                { value: 'kanban', icon: <TableOutlined />, label: '看板' },
              ]}
            />
          </Space>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : filteredProjects.length === 0 && viewMode !== 'calendar' ? (
        <Empty
          description="暂无项目"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={openCreateDrawer}>
            创建第一个项目
          </Button>
        </Empty>
      ) : (
        <>
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'gantt' && renderGanttView()}
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'kanban' && renderKanbanView()}
        </>
      )}
    </div>
  )

  // ==================== 甘特图视图 ====================
  const renderGanttView = () => (
    <Card className={styles.ganttCard}>
      <GanttChart
        tasks={ganttTasks}
        onTaskClick={handleGanttTaskClick}
        onTaskDoubleClick={handleGanttTaskClick}
        showDependencies={true}
        showProgress={true}
        showToday={true}
      />
    </Card>
  )

  // ==================== 日历视图 ====================
  const renderCalendarView = () => (
    <Card className={styles.calendarCard}>
      <Calendar
        userId={1}
        defaultView="month"
        height="calc(100vh - 300px)"
        onDateSelect={(date) => {
          console.log('Selected date:', date)
        }}
      />
    </Card>
  )

  // ==================== 看板视图 ====================
  const renderKanbanView = () => (
    <KanbanBoard
      tasks={kanbanTasks}
      loading={loading}
      onTaskMove={handleKanbanTaskMove}
      onTaskClick={handleKanbanTaskClick}
      validateDependencies={false}
    />
  )

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredProjects.map(project => (
        <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
          <Card
            className={styles.projectCard}
            hoverable
            onClick={() => openDetailDrawer(project)}
          >
            <div className={styles.cardHeader}>
              <Avatar
                shape="square"
                size={48}
                style={{ backgroundColor: project.color || '#1677ff' }}
              >
                {project.name.charAt(0)}
              </Avatar>
              <div className={styles.cardActions}>
                <Button
                  type="text"
                  size="small"
                  icon={project.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleStar(project.id, project.starred || 0)
                  }}
                />
                <Dropdown
                  menu={{ items: getProjectMenuItems(project) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.projectName}>{project.name}</h3>
              <p className={styles.projectKey}>{project.key}</p>
              <p className={styles.projectDesc}>
                {project.description || '暂无描述'}
              </p>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.projectMeta}>
                {getStatusTag(project.status)}
                <span className={styles.memberCount}>
                  {project.memberCount} 成员
                </span>
              </div>
              <Progress
                percent={project.progress || 0}
                size="small"
                showInfo={false}
                strokeColor="#1677ff"
              />
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )

  const renderListView = () => (
    <div className={styles.listView}>
      {filteredProjects.map(project => (
        <Card
          key={project.id}
          className={styles.listItem}
          hoverable
          onClick={() => openDetailDrawer(project)}
        >
          <div className={styles.listItemContent}>
            <Avatar
              shape="square"
              size={40}
              style={{ backgroundColor: project.color || '#1677ff' }}
            >
              {project.name.charAt(0)}
            </Avatar>
            <div className={styles.listItemInfo}>
              <div className={styles.listItemHeader}>
                <h3>{project.name}</h3>
                <span className={styles.projectKey}>{project.key}</span>
              </div>
              <p className={styles.projectDesc}>
                {project.description || '暂无描述'}
              </p>
            </div>
            <div className={styles.listItemMeta}>
              {getStatusTag(project.status)}
              <span>{project.memberCount} 成员</span>
              <span>{project.issueCount} 事项</span>
            </div>
            <div className={styles.listItemProgress}>
              <Progress
                percent={project.progress || 0}
                size="small"
                strokeColor="#1677ff"
              />
            </div>
            <div className={styles.listItemActions}>
              <Button
                type="text"
                icon={project.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleStar(project.id, project.starred || 0)
                }}
              />
              <Dropdown
                menu={{ items: getProjectMenuItems(project) }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  // ==================== 项目分析视图 ====================
  const renderAnalyticsTab = () => {
    const overviewStats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalMembers: projects.reduce((sum, p) => sum + (p.memberCount || 0), 0),
      avgCompletionRate: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
        : 0,
    }

    const projectColumns = [
      {
        title: '项目名称',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: Project) => (
          <Space>
            <Avatar size="small" style={{ backgroundColor: record.color || '#1677ff' }}>
              {text.charAt(0)}
            </Avatar>
            <Text strong>{text}</Text>
          </Space>
        ),
      },
      {
        title: '进度',
        dataIndex: 'progress',
        key: 'progress',
        render: (progress: number) => (
          <Progress 
            percent={progress || 0} 
            size="small" 
            status={progress === 100 ? 'success' : 'active'}
          />
        ),
      },
      {
        title: '成员',
        dataIndex: 'memberCount',
        key: 'memberCount',
        render: (count: number) => <Text>{count || 0} 人</Text>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => getStatusTag(status),
      },
    ]

    return (
      <div className={styles.tabContent}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="项目总数"
                value={overviewStats.totalProjects}
                prefix={<ProjectOutlined style={{ color: '#2b7de9' }} />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="活跃项目"
                value={overviewStats.activeProjects}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="团队成员"
                value={overviewStats.totalMembers}
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                suffix="人"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="平均完成率"
                value={overviewStats.avgCompletionRate}
                prefix={<RiseOutlined style={{ color: '#13c2c2' }} />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Card title="项目进度详情" style={{ marginTop: 16 }}>
          <Table
            columns={projectColumns}
            dataSource={filteredProjects}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </div>
    )
  }

  // ==================== 归档项目视图 ====================
  const renderArchivedTab = () => {
    const archivedProjects = projects.filter(p => p.status === 'archived')
    
    return (
      <div className={styles.tabContent}>
        {archivedProjects.length === 0 ? (
          <Empty
            description="暂无归档项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className={styles.listView}>
            {archivedProjects.map(project => (
              <Card
                key={project.id}
                className={styles.listItem}
                hoverable
                onClick={() => openDetailDrawer(project)}
              >
                <div className={styles.listItemContent}>
                  <Avatar
                    shape="square"
                    size={40}
                    style={{ backgroundColor: project.color || '#8c8c8c', opacity: 0.7 }}
                  >
                    {project.name.charAt(0)}
                  </Avatar>
                  <div className={styles.listItemInfo}>
                    <div className={styles.listItemHeader}>
                      <h3 style={{ color: '#8c8c8c' }}>{project.name}</h3>
                      <span className={styles.projectKey}>{project.key}</span>
                    </div>
                    <p className={styles.projectDesc}>
                      {project.description || '暂无描述'}
                    </p>
                  </div>
                  <div className={styles.listItemMeta}>
                    <Tag color="default">已归档</Tag>
                    <span>{project.memberCount} 成员</span>
                  </div>
                  <div className={styles.listItemActions}>
                    <Tooltip title="恢复项目">
                      <Button
                        type="primary"
                        ghost
                        icon={<UndoOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestoreProject(project.id)
                        }}
                      >
                        恢复
                      </Button>
                    </Tooltip>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: '永久删除',
                            danger: true,
                            onClick: (info) => {
                              info.domEvent.stopPropagation()
                              handleDeleteProject(project.id)
                            }
                          }
                        ]
                      }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Tab items configuration - V2.0 design includes list, analytics, and archived
  const archivedCount = projects.filter(p => p.status === 'archived').length
  const tabItems = [
    { key: 'list', label: '项目列表', children: renderListTab() },
    { key: 'analytics', label: '项目分析', children: renderAnalyticsTab() },
    {
      key: 'archived',
      label: (
        <span>
          归档项目 {archivedCount > 0 && <Tag style={{ marginLeft: 4 }}>{archivedCount}</Tag>}
        </span>
      ),
      children: renderArchivedTab()
    },
  ]

  return (
    <div className={styles.projects}>
      {/* 蓝色头部卡片 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={4} className={styles.headerTitle}>项目管理</Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateDrawer}
          className={styles.createBtn}
        >
          新建项目
        </Button>
      </div>

      {/* 标签页导航 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        className={styles.tabs}
      />

      {/* 创建项目抽屉 */}
      {renderCreateDrawer()}
      
      {/* 编辑项目抽屉 */}
      {renderEditDrawer()}
      
      {/* 项目设置抽屉 */}
      {renderSettingsDrawer()}
      
      {/* 项目详情抽屉 */}
      <Drawer
        title={null}
        placement="right"
        width="85%"
        onClose={closeDetailDrawer}
        open={detailDrawerVisible}
        styles={{
          body: { padding: 0, background: '#f5f7fa' },
          header: { display: 'none' }
        }}
        closable={false}
      >
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Spin size="large" />
          </div>
        ) : selectedProject ? (
          <div className={detailStyles.container} style={{ padding: '24px' }}>
            {/* 归档提示横幅 */}
            {selectedProject.status === 'archived' && (
              <div className={detailStyles.archivedBanner}>
                <InboxOutlined style={{ marginRight: 8 }} />
                此项目已归档，处于只读状态
              </div>
            )}

            {/* 项目头部 */}
            <div className={detailStyles.header}>
              <div className={detailStyles.headerLeft}>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={closeDetailDrawer}
                  style={{ marginRight: 8 }}
                />
                <div
                  className={detailStyles.projectAvatar}
                  style={{ backgroundColor: selectedProject.color || '#2b7de9' }}
                >
                  {selectedProject.name.charAt(0)}
                </div>
                <div className={detailStyles.projectInfo}>
                  <div className={detailStyles.projectTitle}>
                    <h1 className={detailStyles.projectName}>{selectedProject.name}</h1>
                    <span className={detailStyles.projectKey}>{selectedProject.key}</span>
                    {getDetailStatusTag(selectedProject.status)}
                    {selectedProject.priority && getPriorityTag(selectedProject.priority)}
                  </div>
                  <p className={detailStyles.projectDesc}>{selectedProject.description || '暂无描述'}</p>
                  <div className={detailStyles.projectMeta}>
                    <span><UserOutlined /> {projectMembers.length || selectedProject.memberCount || 0} 成员</span>
                    <span><ApartmentOutlined /> {departmentTasks.length} 部门任务</span>
                    <span><FlagOutlined /> {projectMilestones.length} 里程碑</span>
                    {selectedProject.startDate && selectedProject.endDate && (
                      <span>
                        <CalendarOutlined /> {dayjs(selectedProject.startDate).format('YYYY-MM-DD')} ~ {dayjs(selectedProject.endDate).format('YYYY-MM-DD')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Space>
                <Button
                  type="text"
                  icon={selectedProject.starred === 1 ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={async () => {
                    await handleToggleStar(selectedProject.id, selectedProject.starred || 0)
                    setSelectedProject({ ...selectedProject, starred: selectedProject.starred === 1 ? 0 : 1 })
                  }}
                />
                <Button icon={<EditOutlined />} onClick={() => {
                  openEditDrawer(selectedProject as Project)
                }} disabled={selectedProject.status === 'archived'}>
                  编辑
                </Button>
                <Button icon={<SettingOutlined />} onClick={() => {
                  openSettingsDrawer(selectedProject as Project)
                }}>
                  设置
                </Button>
                <Button onClick={() => navigate(`/projects/${selectedProject.id}`)}>
                  <EyeOutlined /> 查看完整页面
                </Button>
              </Space>
            </div>

            {/* 统计卡片 */}
            <div className={detailStyles.statsRow}>
              <div className={detailStyles.statCard}>
                <Statistic
                  title="部门任务"
                  value={departmentTasks.length}
                  prefix={<ApartmentOutlined style={{ color: '#2b7de9' }} />}
                  suffix="个"
                />
              </div>
              <div className={detailStyles.statCard}>
                <Statistic
                  title="待分配"
                  value={departmentTasks.filter(t => t.status === 'pending').length}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                  suffix="个"
                />
              </div>
              <div className={detailStyles.statCard}>
                <Statistic
                  title="进行中"
                  value={departmentTasks.filter(t => t.status === 'in_progress').length}
                  valueStyle={{ color: '#1677ff' }}
                  prefix={<RiseOutlined />}
                  suffix="个"
                />
              </div>
              <div className={detailStyles.statCard}>
                <Statistic
                  title="已完成"
                  value={departmentTasks.filter(t => t.status === 'completed').length}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                  suffix="个"
                />
              </div>
            </div>

            {/* 主内容区 */}
            <Tabs
              defaultActiveKey="overview"
              className={detailStyles.tabs}
              items={[
                {
                  key: 'overview',
                  label: '概览',
                  children: (
                    <div className={detailStyles.contentGrid}>
                      <div className={detailStyles.mainContent}>
                        {/* 项目进度 */}
                        <div className={detailStyles.card}>
                          <div className={detailStyles.cardHeader}>
                            <h3 className={detailStyles.cardTitle}>项目进度</h3>
                          </div>
                          <div className={detailStyles.progressSection}>
                            <div className={detailStyles.progressLabel}>
                              <span>整体进度</span>
                              <span>{projectStats?.completionRate || (departmentTasks.length > 0
                                ? Math.round(departmentTasks.reduce((sum, t) => sum + t.progress, 0) / departmentTasks.length)
                                : 0)}%</span>
                            </div>
                            <Progress
                              percent={projectStats?.completionRate || (departmentTasks.length > 0
                                ? Math.round(departmentTasks.reduce((sum, t) => sum + t.progress, 0) / departmentTasks.length)
                                : 0)}
                              showInfo={false}
                              strokeColor="#1677ff"
                            />
                          </div>
                          <Row gutter={16} style={{ marginTop: 24 }}>
                            <Col span={6}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>{departmentTasks.length}</div>
                                <div style={{ color: '#8c8c8c', fontSize: 13 }}>部门任务</div>
                              </div>
                            </Col>
                            <Col span={6}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>{tasks.length}</div>
                                <div style={{ color: '#8c8c8c', fontSize: 13 }}>执行任务</div>
                              </div>
                            </Col>
                            <Col span={6}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{tasks.filter(t => t.status === 'completed').length}</div>
                                <div style={{ color: '#8c8c8c', fontSize: 13 }}>已完成</div>
                              </div>
                            </Col>
                            <Col span={6}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 600, color: '#722ed1' }}>{projectMilestones.length}</div>
                                <div style={{ color: '#8c8c8c', fontSize: 13 }}>里程碑</div>
                              </div>
                            </Col>
                          </Row>
                        </div>

                        {/* 部门任务概览 */}
                        <div className={detailStyles.card}>
                          <div className={detailStyles.cardHeader}>
                            <h3 className={detailStyles.cardTitle}>部门任务</h3>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              disabled={selectedProject.status === 'archived'}
                            >
                              分配任务
                            </Button>
                          </div>
                          {departmentTasks.length === 0 ? (
                            <Empty
                              description="暂无部门任务"
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          ) : (
                            departmentTasks.slice(0, 5).map(task => (
                              <div key={task.id} className={detailStyles.issueItem}>
                                <ApartmentOutlined style={{ color: '#2b7de9' }} />
                                <span className={detailStyles.issueKey}>
                                  {departments.find(d => d.id === task.departmentId)?.name || '未分配'}
                                </span>
                                <span className={detailStyles.issueTitle}>{task.name}</span>
                                <Progress percent={task.progress} size="small" style={{ width: 100 }} />
                                {getDeptTaskStatusTag(task.status)}
                              </div>
                            ))
                          )}
                          {departmentTasks.length > 5 && (
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                              <Button type="link">查看全部 {departmentTasks.length} 个任务</Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={detailStyles.sideContent}>
                        {/* 团队成员 */}
                        <div className={detailStyles.card}>
                          <div className={detailStyles.cardHeader}>
                            <h3 className={detailStyles.cardTitle}>团队成员</h3>
                          </div>
                          {projectMembers.length === 0 ? (
                            <Empty description="暂无成员" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          ) : (
                            <>
                              {projectMembers.slice(0, 5).map(member => (
                                <div key={member.id} className={detailStyles.memberItem}>
                                  <Avatar src={member.userAvatar}>{member.userName?.charAt(0)}</Avatar>
                                  <div className={detailStyles.memberInfo}>
                                    <div className={detailStyles.memberName}>{member.userName}</div>
                                    <div className={detailStyles.memberRole}>
                                      {member.role || '成员'}
                                      {member.departmentName && ` · ${member.departmentName}`}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {projectMembers.length > 5 && (
                                <div style={{ textAlign: 'center', marginTop: 12 }}>
                                  <Button type="link" size="small">
                                    查看全部 {projectMembers.length} 名成员
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* 最近活动 */}
                        <div className={detailStyles.card}>
                          <div className={detailStyles.cardHeader}>
                            <h3 className={detailStyles.cardTitle}>最近活动</h3>
                          </div>
                          {activities.length === 0 ? (
                            <Empty description="暂无活动" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          ) : (
                            activities.slice(0, 5).map((activity: any) => {
                              const user = users.find(u => u.id === activity.userId)
                              const userName = user?.nickname || user?.username || '未知用户'
                              return (
                                <div key={activity.id} className={detailStyles.activityItem}>
                                  <Avatar size="small" src={user?.avatar}>
                                    {userName.charAt(0)}
                                  </Avatar>
                                  <div className={detailStyles.activityContent}>
                                    <div className={detailStyles.activityText}>
                                      <strong>{userName}</strong> {activity.action} {activity.target}
                                    </div>
                                    <div className={detailStyles.activityTime}>{activity.time}</div>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'department-tasks',
                  label: '部门任务',
                  children: (
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            disabled={selectedProject.status === 'archived'}
                          >
                            分配任务
                          </Button>
                        </Space>
                      </div>
                      <Table
                        columns={[
                          {
                            title: '任务名称',
                            dataIndex: 'name',
                            key: 'name',
                            render: (text: string, record: DepartmentTask) => (
                              <a onClick={() => navigate(`/department-tasks/${record.id}`)}>{text}</a>
                            )
                          },
                          {
                            title: '负责部门',
                            dataIndex: 'departmentName',
                            key: 'departmentName',
                            width: 120,
                            render: (text: string, record: DepartmentTask) => {
                              const dept = departments.find(d => d.id === record.departmentId)
                              return (
                                <Space>
                                  <ApartmentOutlined />
                                  {dept?.name || text || '未分配'}
                                </Space>
                              )
                            }
                          },
                          {
                            title: '负责人',
                            dataIndex: 'managerName',
                            key: 'managerName',
                            width: 120,
                            render: (text: string, record: DepartmentTask) => {
                              const user = users.find(u => u.id === record.managerId)
                              const managerName = user?.nickname || user?.username || text
                              return user ? (
                                <Space>
                                  <Avatar size="small" src={user.avatar}>{managerName?.charAt(0)}</Avatar>
                                  {managerName}
                                </Space>
                              ) : text || '-'
                            }
                          },
                          {
                            title: '优先级',
                            dataIndex: 'priority',
                            key: 'priority',
                            width: 80,
                            render: (priority: string) => getTaskPriorityTag(priority)
                          },
                          {
                            title: '进度',
                            dataIndex: 'progress',
                            key: 'progress',
                            width: 150,
                            render: (progress: number) => (
                              <Progress percent={progress} size="small" />
                            )
                          },
                          {
                            title: '状态',
                            dataIndex: 'status',
                            key: 'status',
                            width: 100,
                            render: (status: DepartmentTaskStatus) => getDeptTaskStatusTag(status)
                          },
                          {
                            title: '截止日期',
                            dataIndex: 'endDate',
                            key: 'endDate',
                            width: 110,
                            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                          }
                        ]}
                        dataSource={departmentTasks}
                        rowKey="id"
                        pagination={{
                          total: departmentTasks.length,
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 条`
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'tasks',
                  label: '执行任务',
                  children: (
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                          <Button type="primary" icon={<PlusOutlined />} disabled={selectedProject.status === 'archived'}>
                            新建任务
                          </Button>
                        </Space>
                      </div>
                      <Table
                        columns={[
                          {
                            title: '任务名称',
                            dataIndex: 'name',
                            key: 'name',
                            render: (text: string, record: Task) => (
                              <a onClick={() => navigate(`/tasks/${record.id}`)}>{text}</a>
                            )
                          },
                          {
                            title: '所属部门任务',
                            dataIndex: 'departmentTaskName',
                            key: 'departmentTaskName',
                            width: 150,
                            render: (text: string, record: Task) => {
                              const deptTask = departmentTasks.find(t => t.id === record.departmentTaskId)
                              return deptTask?.name || text || '-'
                            }
                          },
                          {
                            title: '执行人',
                            dataIndex: 'assigneeName',
                            key: 'assigneeName',
                            width: 120,
                            render: (text: string, record: Task) => {
                              const user = users.find(u => u.id === record.assigneeId)
                              const assigneeName = user?.nickname || user?.username || text
                              return user ? (
                                <Space>
                                  <Avatar size="small" src={user.avatar}>{assigneeName?.charAt(0)}</Avatar>
                                  {assigneeName}
                                </Space>
                              ) : text || '未分配'
                            }
                          },
                          {
                            title: '优先级',
                            dataIndex: 'priority',
                            key: 'priority',
                            width: 80,
                            render: (priority: string) => getTaskPriorityTag(priority)
                          },
                          {
                            title: '进度',
                            dataIndex: 'progress',
                            key: 'progress',
                            width: 150,
                            render: (progress: number) => (
                              <Progress percent={progress} size="small" />
                            )
                          },
                          {
                            title: '状态',
                            dataIndex: 'status',
                            key: 'status',
                            width: 100,
                            render: (status: TaskStatus) => getTaskStatusTag(status)
                          },
                          {
                            title: '截止日期',
                            dataIndex: 'endDate',
                            key: 'endDate',
                            width: 110,
                            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                          }
                        ]}
                        dataSource={tasks}
                        rowKey="id"
                        pagination={{
                          total: tasks.length,
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 条`
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'milestones',
                  label: (
                    <span>
                      <FlagOutlined /> 里程碑 ({projectMilestones.length})
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '16px 0' }}>
                      <MilestoneTimeline
                        projectId={selectedProject.id}
                        editable={selectedProject.status !== 'archived'}
                        onMilestoneChange={refreshProjectDetail}
                      />
                    </div>
                  )
                },
                {
                  key: 'members',
                  label: (
                    <span>
                      <TeamOutlined /> 成员 ({projectMembers.length})
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            disabled={selectedProject.status === 'archived'}
                          >
                            添加成员
                          </Button>
                        </Space>
                      </div>
                      <Table
                        columns={[
                          {
                            title: '成员',
                            dataIndex: 'userName',
                            key: 'userName',
                            render: (text: string, record: ProjectMember) => (
                              <Space>
                                <Avatar src={record.userAvatar}>{text?.charAt(0)}</Avatar>
                                {text}
                              </Space>
                            )
                          },
                          {
                            title: '部门',
                            dataIndex: 'departmentName',
                            key: 'departmentName',
                            render: (text: string) => text || '-'
                          },
                          {
                            title: '角色',
                            dataIndex: 'role',
                            key: 'role',
                            width: 150,
                            render: (role: string) => (
                              <Tag>{role || '成员'}</Tag>
                            )
                          },
                          {
                            title: '加入时间',
                            dataIndex: 'joinedAt',
                            key: 'joinedAt',
                            width: 120,
                            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                          }
                        ]}
                        dataSource={projectMembers}
                        rowKey="id"
                        pagination={{
                          total: projectMembers.length,
                          pageSize: 10,
                          showSizeChanger: true,
                          showTotal: (total) => `共 ${total} 名成员`
                        }}
                      />
                    </div>
                  )
                },
                {
                  key: 'ai-assistant',
                  label: (
                    <span>
                      <RobotOutlined /> AI 助手
                    </span>
                  ),
                  children: (
                    <AIProjectAssistant
                      projectId={selectedProject.id}
                      projectName={selectedProject.name}
                      projectDescription={selectedProject.description}
                      departments={departments.map(d => ({ id: Number(d.id), name: d.name }))}
                      departmentTasks={departmentTasks}
                      tasks={tasks}
                    />
                  )
                }
              ]}
            />
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

export default Projects