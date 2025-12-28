import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Tag,
  Progress,
  Avatar,
  Tabs,
  Table,
  Space,
  Spin,
  message,
  Dropdown,
  Modal,
  Row,
  Col,
  Statistic,
  Empty,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Tooltip,
  Card,
  Popconfirm,
  List,
  Typography
} from 'antd'
import {
  SettingOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ApartmentOutlined,
  RiseOutlined,
  FlagOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  UndoOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  WarningOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CheckOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  AuditOutlined
} from '@ant-design/icons'
import { RobotOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as projectApi from '@/services/api/project'
import type { Project, ProjectMember, ProjectStatistics, Milestone } from '@/services/api/project'
import { departmentTaskApi, taskApi, departmentApi } from '@/services/api'
import type { DepartmentTask, DepartmentTaskStatus } from '@/services/api/departmentTask'
import type { Task } from '@/services/api/task'
import { TaskStatus } from '@/services/api/task'
import type { Department } from '@/services/api/department'
import { getUsers } from '@/services/api/user'
import { getRecentActivities } from '@/services/api/activity'
import AIProjectAssistant from '@/components/AIProjectAssistant'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import GanttChart from '@/components/GanttChart'
import type { GanttTask, GanttDependency } from '@/components/GanttChart'
import BurndownChart from '@/components/BurndownChart'
import KanbanBoard from '@/components/KanbanBoard'
import WorkPlanApproval from '@/components/WorkPlanApproval'
import * as taskDependencyApi from '@/services/api/taskDependency'
import styles from './index.module.css'

const { TextArea } = Input
const { Text } = Typography
const { RangePicker } = DatePicker

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

// 项目颜色选项
const PROJECT_COLORS = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16',
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

/**
 * 项目详情页面 - V2.0
 * 支持完整项目生命周期管理：创建、修改、删除、详情、管理、归档
 */
const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStatistics | null>(null)
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [starred, setStarred] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [taskDependencies, setTaskDependencies] = useState<any[]>([])
  const [criticalPath, setCriticalPath] = useState<number[]>([])
  
  // 创建部门任务抽屉
  const [createDeptTaskDrawerVisible, setCreateDeptTaskDrawerVisible] = useState(false)
  const [createDeptTaskLoading, setCreateDeptTaskLoading] = useState(false)
  const [deptTaskForm] = Form.useForm()
  
  // 项目设置抽屉
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsForm] = Form.useForm()
  const [settingsProjectColor, setSettingsProjectColor] = useState<string>('#2b7de9')
  
  // 成员管理抽屉
  const [membersDrawerVisible, setMembersDrawerVisible] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  
  // 编辑项目抽屉
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()
  const [editProjectColor, setEditProjectColor] = useState<string>('#2b7de9')

  useEffect(() => {
    if (id) {
      loadProjectData(id)
    }
  }, [id])

  const loadProjectData = useCallback(async (projectId: string) => {
    setLoading(true)
    try {
      // 尝试加载完整项目详情
      let projectRes: Project
      try {
        const fullRes = await projectApi.getProjectDetailFull(projectId)
        projectRes = fullRes
        if (fullRes.members) setProjectMembers(fullRes.members)
        if (fullRes.milestones) setProjectMilestones(fullRes.milestones)
        if (fullRes.statistics) setProjectStats(fullRes.statistics)
      } catch {
        // 回退到简单查询
        projectRes = await projectApi.getProjectById(projectId)
      }
      
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
      setUsers((usersRes as any).list || [])
      setActivities(activitiesRes as any || [])
      setTaskDependencies(dependenciesRes || [])
      
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
      if (!(projectRes as any).members) {
        try {
          const members = await projectApi.getProjectMembers(projectId)
          setProjectMembers(members || [])
        } catch {
          setProjectMembers([])
        }
      }
      
      if (!(projectRes as any).milestones) {
        try {
          const milestones = await projectApi.getProjectMilestones(projectId)
          setProjectMilestones(milestones || [])
        } catch {
          setProjectMilestones([])
        }
      }
      
      if (!(projectRes as any).statistics) {
        try {
          const stats = await projectApi.getProjectStatistics(projectId)
          setProjectStats(stats)
        } catch {
          setProjectStats(null)
        }
      }
      
      // 加载部门列表（假设 orgId 为 1）
      try {
        const deptsRes = await departmentApi.getDepartmentsByOrgId(1)
        setDepartments(deptsRes || [])
      } catch {
        console.error('Failed to load departments')
        message.error('加载部门数据失败')
        setDepartments([])
      }
    } catch (error) {
      console.error('Failed to load project:', error)
      message.error('加载项目失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleToggleStar = async () => {
    try {
      await projectApi.toggleProjectStar(id!)
      setStarred(!starred)
      message.success(starred ? '已取消收藏' : '已收藏')
    } catch {
      message.error('操作失败')
    }
  }

  // 归档项目
  const handleArchiveProject = async () => {
    Modal.confirm({
      title: '确认归档',
      icon: <InboxOutlined />,
      content: '归档后项目将变为只读状态，可以随时恢复。确定要归档此项目吗？',
      okText: '确认归档',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectApi.archiveProject(id!)
          message.success('项目已归档')
          loadProjectData(id!)
        } catch {
          message.error('归档失败')
        }
      }
    })
  }

  // 恢复归档项目
  const handleRestoreProject = async () => {
    try {
      await projectApi.restoreProject(id!)
      message.success('项目已恢复')
      loadProjectData(id!)
    } catch {
      message.error('恢复失败')
    }
  }

  // 更新项目状态
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await projectApi.updateProjectStatus(id!, newStatus)
      message.success('状态已更新')
      loadProjectData(id!)
    } catch {
      message.error('更新状态失败')
    }
  }

  // 删除项目
  const handleDeleteProject = () => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>删除项目后，所有相关数据将被清除，此操作不可恢复。</p>
          <p style={{ color: '#ff4d4f' }}>包括：部门任务、执行任务、里程碑、成员关系等</p>
        </div>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectApi.deleteProject(id!)
          message.success('项目已删除')
          navigate('/projects')
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  // 打开项目设置抽屉
  const openSettingsDrawer = () => {
    if (!project) return
    setSettingsProjectColor(project.color || '#2b7de9')
    settingsForm.setFieldsValue({
      name: project.name,
      key: project.key,
      description: project.description,
      priority: project.priority || 'medium',
      visibility: project.visibility || 'private',
      dateRange: project.startDate && project.endDate
        ? [dayjs(project.startDate), dayjs(project.endDate)]
        : undefined,
    })
    setSettingsDrawerVisible(true)
  }

  // 保存项目设置
  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true)
      const values = await settingsForm.validateFields()
      
      await projectApi.updateProject(id!, {
        name: values.name,
        description: values.description,
        color: settingsProjectColor,
        priority: values.priority,
        visibility: values.visibility,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      })
      
      message.success('设置已保存')
      setSettingsDrawerVisible(false)
      loadProjectData(id!)
    } catch (error) {
      console.error('Save settings error:', error)
      message.error('保存失败')
    } finally {
      setSettingsLoading(false)
    }
  }

  // 打开编辑项目抽屉
  const openEditDrawer = () => {
    if (!project) return
    setEditProjectColor(project.color || '#2b7de9')
    editForm.setFieldsValue({
      name: project.name,
      description: project.description,
    })
    setEditDrawerVisible(true)
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      setEditLoading(true)
      const values = await editForm.validateFields()
      
      await projectApi.updateProject(id!, {
        name: values.name,
        description: values.description,
        color: editProjectColor,
      })
      
      message.success('项目已更新')
      setEditDrawerVisible(false)
      loadProjectData(id!)
    } catch (error) {
      console.error('Save edit error:', error)
      message.error('更新失败')
    } finally {
      setEditLoading(false)
    }
  }

  // 打开成员管理抽屉
  const openMembersDrawer = () => {
    setSelectedMemberIds(projectMembers.map(m => m.userId))
    setMembersDrawerVisible(true)
  }

  // 添加成员
  const handleAddMembers = async () => {
    try {
      setMembersLoading(true)
      const currentMemberIds = projectMembers.map(m => m.userId)
      const newMemberIds = selectedMemberIds.filter(id => !currentMemberIds.includes(id))
      
      if (newMemberIds.length > 0) {
        await projectApi.addProjectMembers(id!, newMemberIds)
        message.success(`已添加 ${newMemberIds.length} 名成员`)
      }
      
      setMembersDrawerVisible(false)
      loadProjectData(id!)
    } catch (error) {
      console.error('Add members error:', error)
      message.error('添加成员失败')
    } finally {
      setMembersLoading(false)
    }
  }

  // 移除成员
  const handleRemoveMember = async (userId: string) => {
    try {
      await projectApi.removeProjectMember(id!, userId)
      message.success('成员已移除')
      loadProjectData(id!)
    } catch {
      message.error('移除失败')
    }
  }

  // 更新成员角色
  const handleUpdateMemberRole = async (userId: string, role: string) => {
    try {
      await projectApi.updateMemberRole(id!, userId, role)
      message.success('角色已更新')
      loadProjectData(id!)
    } catch {
      message.error('更新角色失败')
    }
  }

  const getStatusTag = (status: string) => {
    const config = PROJECT_STATUS_CONFIG[status] || { color: 'default', text: status, icon: null }
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  const getPriorityTag = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || { color: 'default', text: priority }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const getDeptTaskStatusTag = (status: DepartmentTaskStatus) => {
    return <Tag color={departmentTaskApi.getStatusColor(status)}>{departmentTaskApi.getStatusText(status)}</Tag>
  }

  const getTaskStatusTag = (status: TaskStatus) => {
    return <Tag color={taskApi.getStatusColor(status)}>{taskApi.getStatusText(status)}</Tag>
  }

  const getTaskPriorityTag = (priority: string) => {
    const config = PRIORITY_CONFIG[priority] || { color: 'default', text: priority }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 统计数据 - 优先使用API返回的统计，否则本地计算
  const stats = projectStats || {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    overdueTasks: tasks.filter(t => t.status !== 'completed' && t.endDate && dayjs(t.endDate).isBefore(dayjs())).length,
    departmentTaskCount: departmentTasks.length,
    completedMilestones: projectMilestones.filter(m => m.status === 'completed').length,
    totalMilestones: projectMilestones.length,
    completionRate: departmentTasks.length > 0
      ? Math.round(departmentTasks.reduce((sum, t) => sum + t.progress, 0) / departmentTasks.length)
      : 0
  }

  // 本地计算的部门任务统计
  const deptTaskStats = {
    total: departmentTasks.length,
    pending: departmentTasks.filter(t => t.status === 'pending').length,
    inProgress: departmentTasks.filter(t => t.status === 'in_progress').length,
    completed: departmentTasks.filter(t => t.status === 'completed').length,
  }

  // 检查项目是否已归档
  const isArchived = project?.status === 'archived'

  // 部门任务表格列
  const deptTaskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DepartmentTask) => (
        <a onClick={() => navigate(`/department-tasks/${record.id}`)}>{text}</a>
      )
    },
    {
      title: '关联里程碑',
      dataIndex: 'milestoneId',
      key: 'milestoneId',
      width: 140,
      render: (milestoneId: string, record: DepartmentTask) => {
        const milestone = projectMilestones.find(m => String(m.id) === String(milestoneId))
        return milestone ? (
          <Tag color="purple" icon={<FlagOutlined />}>
            {milestone.name}
          </Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      }
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
        return user ? (
          <Space>
            <Avatar size="small" src={user.avatar}>{user.name?.charAt(0)}</Avatar>
            {user.name}
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
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: DepartmentTask) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => navigate(`/department-tasks/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // 执行任务表格列
  const taskColumns = [
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
        return user ? (
          <Space>
            <Avatar size="small" src={user.avatar}>{user.name?.charAt(0)}</Avatar>
            {user.name}
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
  ]

  // 创建部门任务
  const handleCreateDeptTask = async (values: any) => {
    setCreateDeptTaskLoading(true)
    try {
      await departmentTaskApi.createDepartmentTask({
        projectId: id!,
        milestoneId: values.milestoneId,
        departmentId: values.departmentId,
        managerId: values.managerId,
        name: values.name,
        description: values.description,
        priority: values.priority,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        requirePlan: values.requirePlan,
        requireApproval: values.requireApproval
      })
      message.success('部门任务创建成功')
      setCreateDeptTaskDrawerVisible(false)
      deptTaskForm.resetFields()
      loadProjectData(id!)
    } catch (error) {
      console.error('Create department task error:', error)
      message.error('创建失败，请重试')
    } finally {
      setCreateDeptTaskLoading(false)
    }
  }

  // 最近活动
  const recentActivities = activities.slice(0, 5).map((a: any) => ({
    ...a,
    user: users.find(u => u.id === a.userId)
  }))

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>项目不存在</h2>
          <Button type="primary" onClick={() => navigate('/projects')}>返回项目列表</Button>
        </div>
      </div>
    )
  }

  // 状态切换菜单项
  const statusMenuItems = Object.entries(PROJECT_STATUS_CONFIG)
    .filter(([key]) => key !== 'archived' && key !== project?.status)
    .map(([key, config]) => ({
      key,
      icon: config.icon,
      label: `切换为${config.text}`,
      onClick: () => handleUpdateStatus(key)
    }))

  // 更多操作菜单
  const moreMenuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑项目',
      onClick: openEditDrawer,
      disabled: isArchived
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: openSettingsDrawer
    },
    {
      key: 'members',
      icon: <TeamOutlined />,
      label: '成员管理',
      onClick: openMembersDrawer,
      disabled: isArchived
    },
    { type: 'divider' as const },
    ...statusMenuItems,
    { type: 'divider' as const },
    isArchived ? {
      key: 'restore',
      icon: <UndoOutlined />,
      label: '恢复项目',
      onClick: handleRestoreProject
    } : {
      key: 'archive',
      icon: <InboxOutlined />,
      label: '归档项目',
      onClick: handleArchiveProject
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: handleDeleteProject
    }
  ]

  return (
    <div className={styles.container}>
      {/* 归档提示横幅 */}
      {isArchived && (
        <div className={styles.archivedBanner}>
          <InboxOutlined style={{ marginRight: 8 }} />
          此项目已归档，处于只读状态
          <Button
            type="link"
            size="small"
            onClick={handleRestoreProject}
            style={{ marginLeft: 16 }}
          >
            恢复项目
          </Button>
        </div>
      )}

      {/* 项目头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/projects')}
            style={{ marginRight: 8 }}
          />
          <div
            className={styles.projectAvatar}
            style={{ backgroundColor: project.color || '#2b7de9' }}
          >
            {project.name.charAt(0)}
          </div>
          <div className={styles.projectInfo}>
            <div className={styles.projectTitle}>
              <h1 className={styles.projectName}>{project.name}</h1>
              <span className={styles.projectKey}>{project.key}</span>
              {getStatusTag(project.status)}
              {project.priority && getPriorityTag(project.priority)}
            </div>
            <p className={styles.projectDesc}>{project.description || '暂无描述'}</p>
            <div className={styles.projectMeta}>
              <span><UserOutlined /> {projectMembers.length || project.memberCount || 0} 成员</span>
              <span><ApartmentOutlined /> {deptTaskStats.total} 部门任务</span>
              <span><FlagOutlined /> {projectMilestones.length} 里程碑</span>
              {project.startDate && project.endDate && (
                <span>
                  <CalendarOutlined /> {dayjs(project.startDate).format('YYYY-MM-DD')} ~ {dayjs(project.endDate).format('YYYY-MM-DD')}
                </span>
              )}
            </div>
          </div>
        </div>
        <Space>
          <Button
            type="text"
            icon={starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={handleToggleStar}
          />
          <Button icon={<EditOutlined />} onClick={openEditDrawer} disabled={isArchived}>
            编辑
          </Button>
          <Button icon={<SettingOutlined />} onClick={openSettingsDrawer}>
            设置
          </Button>
          <Dropdown menu={{ items: moreMenuItems }}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Statistic
            title="部门任务"
            value={deptTaskStats.total}
            prefix={<ApartmentOutlined style={{ color: '#2b7de9' }} />}
            suffix="个"
          />
        </div>
        <div className={styles.statCard}>
          <Statistic
            title="待分配"
            value={deptTaskStats.pending}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
            suffix="个"
          />
        </div>
        <div className={styles.statCard}>
          <Statistic
            title="进行中"
            value={deptTaskStats.inProgress}
            valueStyle={{ color: '#1677ff' }}
            prefix={<RiseOutlined />}
            suffix="个"
          />
        </div>
        <div className={styles.statCard}>
          <Statistic
            title="已完成"
            value={deptTaskStats.completed}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
            suffix="个"
          />
        </div>
        {stats.overdueTasks > 0 && (
          <div className={styles.statCard}>
            <Statistic
              title="已逾期"
              value={stats.overdueTasks}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
              suffix="个"
            />
          </div>
        )}
      </div>

      {/* 主内容区 */}
      <Tabs
        defaultActiveKey="overview"
        className={styles.tabs}
        items={[
          {
            key: 'overview',
            label: '概览',
            children: (
              <div className={styles.contentGrid}>
                <div className={styles.mainContent}>
                  {/* 项目进度 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>项目进度</h3>
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressLabel}>
                        <span>整体进度</span>
                        <span>{stats.completionRate}%</span>
                      </div>
                      <Progress percent={stats.completionRate} showInfo={false} strokeColor="#1677ff" />
                    </div>
                    <Row gutter={16} style={{ marginTop: 24 }}>
                      <Col span={6}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>{deptTaskStats.total}</div>
                          <div style={{ color: '#8c8c8c', fontSize: 13 }}>部门任务</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a' }}>{stats.totalTasks}</div>
                          <div style={{ color: '#8c8c8c', fontSize: 13 }}>执行任务</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{stats.completedTasks}</div>
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
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>部门任务</h3>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateDeptTaskDrawerVisible(true)}
                        disabled={isArchived}
                      >
                        分配任务
                      </Button>
                    </div>
                    {departmentTasks.length === 0 ? (
                      <Empty
                        description="暂无部门任务"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button
                          type="primary"
                          onClick={() => setCreateDeptTaskDrawerVisible(true)}
                          disabled={isArchived}
                        >
                          分配第一个任务
                        </Button>
                      </Empty>
                    ) : (
                      departmentTasks.slice(0, 5).map(task => (
                        <div key={task.id} className={styles.issueItem}>
                          <ApartmentOutlined style={{ color: '#2b7de9' }} />
                          <span className={styles.issueKey}>
                            {departments.find(d => d.id === task.departmentId)?.name || '未分配'}
                          </span>
                          <span className={styles.issueTitle}>{task.name}</span>
                          <Progress percent={task.progress} size="small" style={{ width: 100 }} />
                          {getDeptTaskStatusTag(task.status)}
                        </div>
                      ))
                    )}
                    {departmentTasks.length > 5 && (
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Button type="link" onClick={() => {}}>查看全部 {departmentTasks.length} 个任务</Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.sideContent}>
                  {/* 团队成员 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>团队成员</h3>
                      <Button type="link" size="small" onClick={openMembersDrawer} disabled={isArchived}>
                        管理
                      </Button>
                    </div>
                    {projectMembers.length === 0 ? (
                      <Empty description="暂无成员" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" size="small" onClick={openMembersDrawer} disabled={isArchived}>
                          添加成员
                        </Button>
                      </Empty>
                    ) : (
                      <>
                        {projectMembers.slice(0, 5).map(member => (
                          <div key={member.id} className={styles.memberItem}>
                            <Avatar src={member.userAvatar}>{member.userName?.charAt(0)}</Avatar>
                            <div className={styles.memberInfo}>
                              <div className={styles.memberName}>{member.userName}</div>
                              <div className={styles.memberRole}>
                                {member.role || '成员'}
                                {member.departmentName && ` · ${member.departmentName}`}
                              </div>
                            </div>
                          </div>
                        ))}
                        {projectMembers.length > 5 && (
                          <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <Button type="link" size="small" onClick={openMembersDrawer}>
                              查看全部 {projectMembers.length} 名成员
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* 最近活动 */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>最近活动</h3>
                    </div>
                    {recentActivities.length === 0 ? (
                      <Empty description="暂无活动" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      recentActivities.map(activity => (
                        <div key={activity.id} className={styles.activityItem}>
                          <Avatar size="small" src={activity.user?.avatar}>
                            {activity.user?.name?.charAt(0)}
                          </Avatar>
                          <div className={styles.activityContent}>
                            <div className={styles.activityText}>
                              <strong>{activity.user?.name}</strong> {activity.action} {activity.target}
                            </div>
                            <div className={styles.activityTime}>{activity.time}</div>
                          </div>
                        </div>
                      ))
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
                      onClick={() => setCreateDeptTaskDrawerVisible(true)}
                      disabled={isArchived}
                    >
                      分配任务
                    </Button>
                  </Space>
                </div>
                <Table
                  columns={deptTaskColumns}
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
                    <Button type="primary" icon={<PlusOutlined />} disabled={isArchived}>
                      新建任务
                    </Button>
                  </Space>
                  <Button onClick={() => navigate('/kanban')}>看板视图</Button>
                </div>
                <Table
                  columns={taskColumns}
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
            key: 'gantt',
            label: (
              <span>
                <CalendarOutlined /> 甘特图
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0', height: 'calc(100vh - 400px)', minHeight: '500px' }}>
                <GanttChart
                  tasks={tasks.map(task => ({
                    id: task.id,
                    name: task.name,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    progress: task.progress || 0,
                    status: task.status,
                    priority: task.priority,
                    assigneeId: task.assigneeId,
                    assigneeName: users.find(u => u.id === task.assigneeId)?.name,
                    isMilestone: false,
                  } as GanttTask))}
                  dependencies={taskDependencies.map(dep => ({
                    predecessorId: dep.predecessorId,
                    successorId: dep.successorId,
                    dependencyType: dep.dependencyType || 'FS',
                  } as GanttDependency))}
                  criticalPath={criticalPath}
                  onTaskClick={(task) => navigate(`/tasks/${task.id}`)}
                  showDependencies={true}
                  showProgress={true}
                  showToday={true}
                />
              </div>
            )
          },
          {
            key: 'burndown',
            label: (
              <span>
                <LineChartOutlined /> 燃尽图
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0', height: 'calc(100vh - 400px)', minHeight: '400px' }}>
                <BurndownChart
                  title={`${project.name} - 燃尽图`}
                  startDate={project.startDate || dayjs().format('YYYY-MM-DD')}
                  endDate={project.endDate || dayjs().add(30, 'day').format('YYYY-MM-DD')}
                  totalPoints={tasks.length}
                  completedByDate={(() => {
                    // 按日期统计完成的任务数
                    const completedTasks = tasks.filter(t => t.status === 'completed')
                    const dateMap = new Map<string, number>()
                    completedTasks.forEach(t => {
                      if (t.endDate) {
                        const date = dayjs(t.endDate).format('YYYY-MM-DD')
                        dateMap.set(date, (dateMap.get(date) || 0) + 1)
                      }
                    })
                    return Array.from(dateMap.entries()).map(([date, completed]) => ({ date, completed }))
                  })()}
                  height={400}
                  showLegend={true}
                  unit="tasks"
                />
              </div>
            )
          },
          {
            key: 'kanban',
            label: (
              <span>
                <AppstoreOutlined /> 看板视图
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0', minHeight: '500px' }}>
                <KanbanBoard
                  tasks={tasks.map(task => ({
                    id: Number(task.id),
                    title: task.name,
                    description: task.description,
                    status: (task.status === 'pending' ? 'todo' : task.status === 'in_progress' ? 'in_progress' : task.status === 'completed' ? 'done' : 'todo') as 'todo' | 'in_progress' | 'review' | 'done',
                    priority: (task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'normal' : 'low') as 'low' | 'normal' | 'high' | 'urgent',
                    assigneeId: task.assigneeId ? Number(task.assigneeId) : undefined,
                    assigneeName: users.find(u => u.id === task.assigneeId)?.name,
                    assigneeAvatar: users.find(u => u.id === task.assigneeId)?.avatar,
                    dueDate: task.endDate,
                    projectId: Number(id),
                  }))}
                  onTaskMove={async (taskId, newStatus) => {
                    // 映射看板状态到任务状态
                    const statusMap: Record<string, TaskStatus> = {
                      'todo': TaskStatus.PENDING,
                      'in_progress': TaskStatus.IN_PROGRESS,
                      'review': TaskStatus.IN_PROGRESS,
                      'done': TaskStatus.COMPLETED
                    }
                    try {
                      await taskApi.updateTaskStatus(taskId, statusMap[newStatus] || TaskStatus.PENDING)
                      message.success('任务状态已更新')
                      loadProjectData(id!)
                      return true
                    } catch {
                      message.error('更新失败')
                      return false
                    }
                  }}
                  onTaskClick={(task) => navigate(`/tasks/${task.id}`)}
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
                  projectId={id!}
                  editable={!isArchived}
                  onMilestoneChange={() => loadProjectData(id!)}
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
                      onClick={openMembersDrawer}
                      disabled={isArchived}
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
                      render: (role: string, record: ProjectMember) => (
                        <Select
                          value={role || 'member'}
                          style={{ width: 120 }}
                          onChange={(value) => handleUpdateMemberRole(record.userId, value)}
                          disabled={isArchived}
                          options={[
                            { value: 'owner', label: '负责人' },
                            { value: 'admin', label: '管理员' },
                            { value: 'member', label: '成员' },
                            { value: 'viewer', label: '只读' },
                          ]}
                        />
                      )
                    },
                    {
                      title: '加入时间',
                      dataIndex: 'joinedAt',
                      key: 'joinedAt',
                      width: 120,
                      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 80,
                      render: (_: any, record: ProjectMember) => (
                        <Popconfirm
                          title="确定要移除此成员吗？"
                          onConfirm={() => handleRemoveMember(record.userId)}
                          disabled={isArchived}
                        >
                          <Button type="text" danger size="small" icon={<DeleteOutlined />} disabled={isArchived} />
                        </Popconfirm>
                      )
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
            key: 'work-plan-approval',
            label: (
              <span>
                <AuditOutlined /> 工作计划审批
              </span>
            ),
            children: (
              <div style={{ padding: '16px 0' }}>
                <WorkPlanApproval
                  projectId={Number(id)}
                  onApprovalComplete={() => loadProjectData(id!)}
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
                projectId={id!}
                projectName={project.name}
                projectDescription={project.description}
                departments={departments.map(d => ({ id: Number(d.id), name: d.name }))}
                departmentTasks={departmentTasks}
                tasks={tasks}
              />
            )
          },
          {
            key: 'wiki',
            label: '文档',
            children: (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Button type="primary" onClick={() => navigate('/wiki')}>
                  进入知识库
                </Button>
              </div>
            )
          }
        ]}
      />

      {/* 创建部门任务抽屉 */}
      <Drawer
        title="分配部门任务"
        placement="right"
        width={600}
        onClose={() => setCreateDeptTaskDrawerVisible(false)}
        open={createDeptTaskDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCreateDeptTaskDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={createDeptTaskLoading} onClick={() => deptTaskForm.submit()}>
              创建
            </Button>
          </div>
        }
      >
        <Form
          form={deptTaskForm}
          layout="vertical"
          onFinish={handleCreateDeptTask}
          initialValues={{
            priority: 'medium',
            requirePlan: false,
            requireApproval: false
          }}
        >
          <Form.Item
            name="milestoneId"
            label="关联里程碑"
            extra="选择此任务关联的里程碑，任务进度将自动汇总到里程碑"
          >
            <Select placeholder="请选择关联里程碑（可选）" allowClear>
              {projectMilestones.map(milestone => (
                <Select.Option key={milestone.id} value={milestone.id}>
                  <Space>
                    <FlagOutlined style={{ color: '#722ed1' }} />
                    {milestone.name}
                    {milestone.targetDate && (
                      <span style={{ color: '#999', fontSize: 12 }}>
                        ({dayjs(milestone.targetDate).format('YYYY-MM-DD')})
                      </span>
                    )}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="负责部门"
            rules={[{ required: true, message: '请选择负责部门' }]}
          >
            <Select placeholder="请选择负责部门">
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="managerId"
            label="部门负责人"
            rules={[{ required: true, message: '请选择部门负责人' }]}
          >
            <Select placeholder="请选择部门负责人">
              {users.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" src={user.avatar}>{user.name?.charAt(0)}</Avatar>
                    {user.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
          >
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="urgent">紧急</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="任务周期"
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 项目设置抽屉 */}
      <Drawer
        title="项目设置"
        placement="right"
        width={600}
        onClose={() => setSettingsDrawerVisible(false)}
        open={settingsDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setSettingsDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={settingsLoading} onClick={handleSaveSettings} icon={<SaveOutlined />}>
              保存设置
            </Button>
          </div>
        }
      >
        <Form
          form={settingsForm}
          layout="vertical"
        >
          <Tabs
            items={[
              {
                key: 'general',
                label: <span><SettingOutlined /> 基本设置</span>,
                children: (
                  <div>
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
                      extra="项目标识创建后不可修改"
                    >
                      <Input disabled />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="项目描述"
                    >
                      <TextArea rows={4} placeholder="请输入项目描述" />
                    </Form.Item>

                    <Form.Item label="项目颜色">
                      <div style={{ display: 'flex', gap: 8 }}>
                        {PROJECT_COLORS.map(color => (
                          <div
                            key={color}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              backgroundColor: color,
                              cursor: 'pointer',
                              border: settingsProjectColor === color ? '3px solid #1677ff' : '3px solid transparent',
                            }}
                            onClick={() => setSettingsProjectColor(color)}
                          />
                        ))}
                      </div>
                    </Form.Item>

                    <Form.Item
                      name="priority"
                      label="优先级"
                    >
                      <Select
                        options={[
                          { value: 'low', label: '低' },
                          { value: 'medium', label: '中' },
                          { value: 'high', label: '高' },
                          { value: 'urgent', label: '紧急' },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      name="visibility"
                      label="可见性"
                    >
                      <Select
                        options={[
                          { value: 'private', label: '私有 - 仅项目成员可见' },
                          { value: 'internal', label: '内部 - 团队成员可见' },
                          { value: 'public', label: '公开 - 所有人可见' },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      name="dateRange"
                      label="项目周期"
                    >
                      <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                )
              },
              {
                key: 'danger',
                label: <span style={{ color: '#ff4d4f' }}><WarningOutlined /> 危险操作</span>,
                children: (
                  <div>
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>归档项目</Text>
                          <br />
                          <Text type="secondary">归档后项目将变为只读状态，可以随时恢复</Text>
                        </div>
                        <Button onClick={handleArchiveProject} disabled={isArchived}>
                          归档项目
                        </Button>
                      </div>
                    </Card>

                    <Card size="small" style={{ borderColor: '#ff4d4f' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ color: '#ff4d4f' }}>删除项目</Text>
                          <br />
                          <Text type="secondary">删除后所有数据将被永久清除，无法恢复</Text>
                        </div>
                        <Popconfirm
                          title="确定要删除项目吗？"
                          description="此操作不可逆，所有数据将被永久删除"
                          onConfirm={handleDeleteProject}
                          okText="确定删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger type="primary">删除项目</Button>
                        </Popconfirm>
                      </div>
                    </Card>
                  </div>
                )
              }
            ]}
          />
        </Form>
      </Drawer>

      {/* 编辑项目抽屉 */}
      <Drawer
        title="编辑项目"
        placement="right"
        width={500}
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setEditDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={editLoading} onClick={handleSaveEdit}>
              保存
            </Button>
          </div>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item label="项目颜色">
            <div style={{ display: 'flex', gap: 8 }}>
              {PROJECT_COLORS.map(color => (
                <div
                  key={color}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: editProjectColor === color ? '3px solid #1677ff' : '3px solid transparent',
                  }}
                  onClick={() => setEditProjectColor(color)}
                />
              ))}
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 成员管理抽屉 */}
      <Drawer
        title="添加项目成员"
        placement="right"
        width={500}
        onClose={() => setMembersDrawerVisible(false)}
        open={membersDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setMembersDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={membersLoading} onClick={handleAddMembers}>
              确认添加
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">选择要添加到项目的成员</Text>
        </div>
        
        {departments.map(dept => {
          const deptUsers = users.filter(u => u.departmentId === dept.id)
          if (deptUsers.length === 0) return null
          
          return (
            <div key={dept.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                <ApartmentOutlined style={{ marginRight: 8 }} />
                {dept.name}
              </div>
              <List
                size="small"
                dataSource={deptUsers}
                renderItem={(user: any) => (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedMemberIds.includes(user.id) ? '#e6f4ff' : 'transparent',
                      borderRadius: 6,
                      padding: '8px 12px',
                    }}
                    onClick={() => {
                      if (selectedMemberIds.includes(user.id)) {
                        setSelectedMemberIds(selectedMemberIds.filter(id => id !== user.id))
                      } else {
                        setSelectedMemberIds([...selectedMemberIds, user.id])
                      }
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={user.avatar}>{user.name?.charAt(0)}</Avatar>}
                      title={user.name}
                      description={user.role}
                    />
                    {selectedMemberIds.includes(user.id) && (
                      <CheckOutlined style={{ color: '#1677ff' }} />
                    )}
                  </List.Item>
                )}
              />
            </div>
          )
        })}
        
        <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: 6 }}>
          已选择 <Text strong>{selectedMemberIds.length}</Text> 名成员
        </div>
      </Drawer>
    </div>
  )
}

export default ProjectDetail