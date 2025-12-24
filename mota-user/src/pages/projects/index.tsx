import { useEffect, useState } from 'react'
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
  App
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
  InboxOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import * as projectApi from '@/services/api/project'
import { departmentApi } from '@/services/api'
import { getUsers } from '@/services/api/user'
import type { Department } from '@/services/api/department'
import styles from './index.module.css'

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
}

// 里程碑接口
interface MilestoneItem {
  id: string
  name: string
  targetDate: string
  description?: string
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
  const [newMilestone, setNewMilestone] = useState({ name: '', targetDate: '', description: '' })
  const [formData, setFormData] = useState<any>({})
  
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
        departmentApi.getDepartmentsByOrgId(1).catch((err) => {
          console.warn('Failed to load departments from API:', err)
          message.error('加载部门数据失败')
          return null
        }),
        getUsers().catch((err) => {
          console.warn('Failed to load users from API:', err)
          message.error('加载用户数据失败')
          return null
        })
      ])
      
      // 如果API返回了有效数据则使用，否则设置为空数组
      if (deptsRes && Array.isArray(deptsRes) && deptsRes.length > 0) {
        setDepartments(deptsRes)
      } else {
        setDepartments([])
      }
      
      if (usersRes && (usersRes as any).list && (usersRes as any).list.length > 0) {
        setUsers((usersRes as any).list)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      message.error('加载数据失败，请稍后重试')
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

  // 根据名称生成项目标识
  const generateKeyFromName = (name: string) => {
    if (!name) return ''
    const englishChars = name.split('').filter(char => {
      const code = char.charCodeAt(0)
      return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57)
    }).map(char => char.toUpperCase()).join('')
    
    if (!englishChars) {
      return 'PROJ' + Math.floor(Math.random() * 1000)
    }
    
    return englishChars.slice(0, 6).toUpperCase()
  }

  // 打开创建项目抽屉
  const openCreateDrawer = () => {
    setDrawerVisible(true)
    setCurrentStep(0)
    setSelectedColor(projectColors[0])
    setPreviewName('')
    setPreviewDesc('')
    setSelectedDepartments([])
    setSelectedMembers([])
    setMilestones([])
    setNewMilestone({ name: '', targetDate: '', description: '' })
    setFormData({})
    form.resetFields()
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
  }

  // 提交创建项目
  const handleCreateProject = async () => {
    setCreateLoading(true)
    try {
      const dateRange = formData.dateRange
      await projectApi.createProject({
        name: formData.name,
        key: formData.key,
        description: formData.description,
        color: selectedColor,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        ownerId: formData.ownerId,
        departmentIds: selectedDepartments,
        memberIds: selectedMembers,
        milestones: milestones.map(m => ({
          name: m.name,
          targetDate: m.targetDate,
          description: m.description
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
    } else if (currentStep === 1) {
      if (selectedDepartments.length === 0) {
        message.warning('请至少选择一个参与部门')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }
  
  // 切换部门选择
  const handleDepartmentToggle = (deptId: string) => {
    if (selectedDepartments.includes(deptId)) {
      setSelectedDepartments(selectedDepartments.filter(id => id !== deptId))
      // 同时移除该部门的成员
      const deptMembers = users.filter(u => u.departmentId === deptId).map(u => u.id)
      setSelectedMembers(selectedMembers.filter(id => !deptMembers.includes(id)))
    } else {
      setSelectedDepartments([...selectedDepartments, deptId])
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
    
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        name: newMilestone.name,
        targetDate: newMilestone.targetDate,
        description: newMilestone.description
      }
    ])
    setNewMilestone({ name: '', targetDate: '', description: '' })
  }

  // 删除里程碑
  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
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
      description: '项目交付和总结'
    })
    
    setMilestones(suggestedMilestones)
    message.success('已生成里程碑建议')
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
                      const key = generateKeyFromName(e.target.value)
                      form.setFieldValue('key', key)
                      setPreviewName(e.target.value)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="项目标识"
                  name="key"
                  rules={[
                    { required: true, message: '请输入项目标识' },
                    { pattern: /^[A-Z0-9]+$/, message: '只能包含大写字母和数字' }
                  ]}
                >
                  <Input size="large" placeholder="如: PROJ" maxLength={10} />
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
                  <Select size="large" placeholder="请选择项目负责人">
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
          </Form>
        )
      
      case 1:
        return (
          <div>
            <div className={styles.drawerSectionTitle}>
              <ApartmentOutlined style={{ marginRight: 8 }} />
              选择参与部门
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              选择需要参与此项目的部门，后续可以为每个部门分配任务
            </p>
            
            {loadingData ? (
              <div className={styles.loading}>
                <Spin tip="加载部门数据中..." />
              </div>
            ) : departments.length === 0 ? (
              <Empty description="暂无可选部门" />
            ) : (
              <div className={styles.departmentList}>
                {departments.map(dept => (
                  <div
                    key={dept.id}
                    className={`${styles.departmentItem} ${selectedDepartments.includes(dept.id) ? styles.departmentItemSelected : ''}`}
                    onClick={() => handleDepartmentToggle(dept.id)}
                  >
                    <Checkbox checked={selectedDepartments.includes(dept.id)} />
                    <div className={styles.departmentInfo}>
                      <div className={styles.departmentName}>{dept.name}</div>
                      <div className={styles.departmentMeta}>
                        <span><UserOutlined /> {dept.memberCount || 0} 人</span>
                        {dept.managerName && <span>负责人: {dept.managerName}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: 16, color: '#666' }}>
              已选择 <strong>{selectedDepartments.length}</strong> 个部门
            </div>
          </div>
        )
      
      case 2:
        return (
          <div>
            <div className={styles.drawerSectionTitle}>
              <TeamOutlined style={{ marginRight: 8 }} />
              添加项目成员
            </div>
            <p style={{ color: '#666', marginBottom: 16 }}>
              从已选部门中选择参与项目的成员
            </p>
            
            {selectedDepartments.length === 0 ? (
              <Empty description="请先选择参与部门" />
            ) : (
              <div className={styles.memberSelection}>
                {selectedDepartments.map(deptId => {
                  const dept = departments.find(d => d.id === deptId)
                  const deptMembers = users.filter(u => u.departmentId === deptId)
                  const selectedCount = deptMembers.filter(m => selectedMembers.includes(m.id)).length
                  const allSelected = deptMembers.length > 0 && deptMembers.every(m => selectedMembers.includes(m.id))
                  
                  return (
                    <div key={deptId} className={styles.memberGroup}>
                      <div className={styles.memberGroupHeader}>
                        <Checkbox
                          checked={allSelected}
                          indeterminate={selectedCount > 0 && !allSelected}
                          onChange={() => handleSelectAllDeptMembers(deptId)}
                        >
                          <strong>{dept?.name}</strong>
                        </Checkbox>
                        <span className={styles.memberCount}>
                          已选 {selectedCount}/{deptMembers.length} 人
                        </span>
                      </div>
                      <div className={styles.memberList}>
                        {deptMembers.map(member => (
                          <div
                            key={member.id}
                            className={`${styles.memberItem} ${selectedMembers.includes(member.id) ? styles.memberItemSelected : ''}`}
                            onClick={() => handleMemberToggle(member.id)}
                          >
                            <Checkbox checked={selectedMembers.includes(member.id)} />
                            <Avatar size="small" src={member.avatar}>{member.name?.charAt(0)}</Avatar>
                            <div className={styles.memberInfo}>
                              <div className={styles.memberName}>{member.name}</div>
                              <div className={styles.memberRole}>{member.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div style={{ marginTop: 16, color: '#666' }}>
              已选择 <strong>{selectedMembers.length}</strong> 名成员
            </div>
          </div>
        )
      
      case 3:
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
              <Row gutter={12}>
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
                <Col span={7}>
                  <Input
                    placeholder="描述（可选）"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  />
                </Col>
                <Col span={3}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMilestone}>
                    添加
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
              <List
                className={styles.milestoneList}
                dataSource={milestones.sort((a, b) => dayjs(a.targetDate).diff(dayjs(b.targetDate)))}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteMilestone(item.id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className={styles.milestoneIndex}>
                          <FlagOutlined />
                        </div>
                      }
                      title={item.name}
                      description={
                        <Space>
                          <CalendarOutlined />
                          {item.targetDate}
                          {item.description && <span>· {item.description}</span>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
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
            {currentStep < 3 ? (
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
                  { title: '选择部门', icon: <ApartmentOutlined /> },
                  { title: '添加成员', icon: <TeamOutlined /> },
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
                  {formData.key || form.getFieldValue('key') || 'KEY'}
                </p>
                <p className={styles.drawerPreviewDesc}>
                  {previewDesc || formData.description || '项目描述将显示在这里'}
                </p>
                
                {selectedDepartments.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>参与部门</div>
                    <Space wrap>
                      {selectedDepartments.map(deptId => {
                        const dept = departments.find(d => d.id === deptId)
                        return <Tag key={deptId}>{dept?.name}</Tag>
                      })}
                    </Space>
                  </div>
                )}
                
                {selectedMembers.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>项目成员</div>
                    <Avatar.Group maxCount={5}>
                      {selectedMembers.map(memberId => {
                        const member = users.find(u => u.id === memberId)
                        return (
                          <Tooltip key={memberId} title={member?.name}>
                            <Avatar src={member?.avatar}>{member?.name?.charAt(0)}</Avatar>
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
          <Button
            type={viewMode === 'grid' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('grid')}
          />
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('list')}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Empty
          description="暂无项目"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={openCreateDrawer}>
            创建第一个项目
          </Button>
        </Empty>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}
    </div>
  )

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {filteredProjects.map(project => (
        <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
          <Card
            className={styles.projectCard}
            hoverable
            onClick={() => navigate(`/projects/${project.id}`)}
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
          onClick={() => navigate(`/projects/${project.id}`)}
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
                onClick={() => navigate(`/projects/${project.id}`)}
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
    </div>
  )
}

export default Projects