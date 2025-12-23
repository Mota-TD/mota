import { useEffect, useState, useCallback } from 'react'
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
  message,
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
  Upload,
  Checkbox,
  Switch,
  Divider,
  Popconfirm,
  ColorPicker
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
  SaveOutlined
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import locale from 'antd/es/date-picker/locale/zh_CN'
import * as projectApi from '@/services/api/project'
import styles from './index.module.css'

// 设置 dayjs 中文
dayjs.locale('zh-cn')

const { Title, Text } = Typography
const { TextArea } = Input

// 项目颜色
const projectColors = [
  '#2b7de9', '#52c41a', '#722ed1', '#fa8c16', 
  '#13c2c2', '#eb2f96', '#f5222d', '#faad14'
]

interface Project {
  id: number
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

/**
 * 项目管理页面
 * 包含项目列表、项目分析、项目看板、项目甘特图四个视图
 */
const Projects = () => {
  const navigate = useNavigate()
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
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [form] = Form.useForm()
  const [projectKey, setProjectKey] = useState('')
  const [isLongTerm, setIsLongTerm] = useState(false)
  
  // 实时预览状态
  const [previewName, setPreviewName] = useState('')
  const [previewDesc, setPreviewDesc] = useState('')
  
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
  }, [])

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

  // 生成项目标识 - AF-0001 格式
  const generateProjectKey = useCallback(() => {
    const nextNumber = projects.length + 1
    const paddedNumber = String(nextNumber).padStart(4, '0')
    return `AF-${paddedNumber}`
  }, [projects.length])

  // 打开创建项目抽屉
  const openCreateDrawer = () => {
    const newKey = generateProjectKey()
    setProjectKey(newKey)
    setDrawerVisible(true)
    setSelectedColor(projectColors[0])
    setFileList([])
    setPreviewName('')
    setPreviewDesc('')
    setIsLongTerm(false)
    form.resetFields()
    form.setFieldValue('key', newKey)
  }

  // 关闭创建项目抽屉
  const closeCreateDrawer = () => {
    setDrawerVisible(false)
    form.resetFields()
    setPreviewName('')
    setPreviewDesc('')
    setIsLongTerm(false)
  }

  // 提交创建项目
  const handleCreateProject = async (values: Record<string, unknown>) => {
    setCreateLoading(true)
    try {
      await projectApi.createProject({
        name: values.name as string,
        key: projectKey,
        description: values.description as string | undefined,
        color: selectedColor,
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

  // 处理表单值变化，实时更新预览
  const handleFormValuesChange = (changedValues: Record<string, unknown>) => {
    if ('name' in changedValues) {
      setPreviewName(changedValues.name as string || '')
    }
    if ('description' in changedValues) {
      setPreviewDesc(changedValues.description as string || '')
    }
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
      enableIssues: true,
      enableWiki: true,
      enableIterations: true,
      notifyOnIssueCreate: true,
      notifyOnIssueUpdate: true,
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
    message.success('项目已归档')
    closeSettingsDrawer()
    loadProjects()
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

  const handleToggleStar = async (projectId: number, starred: number) => {
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

  const handleDeleteProject = async (projectId: number) => {
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
          <Button onClick={closeCreateDrawer}>取消</Button>
          <Button type="primary" loading={createLoading} onClick={() => form.submit()}>
            创建项目
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
                form={form}
                layout="vertical"
                onFinish={handleCreateProject}
                onValuesChange={handleFormValuesChange}
                initialValues={{
                  visibility: 'private'
                }}
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
                      tooltip="项目标识由系统自动生成，创建后不可修改"
                    >
                      <Input
                        size="large"
                        value={projectKey}
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

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="项目周期">
                      <div className={styles.datePickerWrapper}>
                        <Form.Item name="startDate" noStyle>
                          <DatePicker
                            size="large"
                            style={{ width: '100%' }}
                            placeholder="开始日期"
                            locale={locale}
                            format="YYYY年MM月DD日"
                          />
                        </Form.Item>
                        <span className={styles.dateSeparator}>至</span>
                        {isLongTerm ? (
                          <Input
                            size="large"
                            value="长期"
                            disabled
                            className={styles.longTermInput}
                          />
                        ) : (
                          <Form.Item name="endDate" noStyle>
                            <DatePicker
                              size="large"
                              style={{ width: '100%' }}
                              placeholder="结束日期"
                              locale={locale}
                              format="YYYY年MM月DD日"
                            />
                          </Form.Item>
                        )}
                      </div>
                      <Checkbox
                        checked={isLongTerm}
                        onChange={(e) => {
                          setIsLongTerm(e.target.checked)
                          if (e.target.checked) {
                            form.setFieldValue('endDate', null)
                          }
                        }}
                        className={styles.longTermCheckbox}
                      >
                        长期项目（无固定结束日期）
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="可见性"
                      name="visibility"
                      rules={[{ required: true }]}
                    >
                      <Select size="large">
                        <Select.Option value="private">私有 - 仅项目成员可见</Select.Option>
                        <Select.Option value="internal">内部 - 团队成员可见</Select.Option>
                        <Select.Option value="public">公开 - 所有人可见</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* 项目颜色 */}
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

                {/* 项目封面 */}
                <Form.Item label="项目封面">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    {fileList.length === 0 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传封面</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Form>
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
                  {previewName || '项目名称'}
                </h3>
                <p className={styles.drawerPreviewKey}>
                  {projectKey || 'AF-0001'}
                </p>
                <p className={styles.drawerPreviewDesc}>
                  {previewDesc || '项目描述将显示在这里'}
                </p>
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
                  <div className={styles.tipTitle}>快速启动</div>
                  <div className={styles.tipDesc}>填写项目名称即可快速创建，其他信息可稍后完善</div>
                </div>
              </div>
              <div className={styles.tipItem}>
                <SafetyCertificateOutlined className={styles.tipIcon} />
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>唯一标识</div>
                  <div className={styles.tipDesc}>项目标识由系统自动生成，确保全局唯一性</div>
                </div>
              </div>
              <div className={styles.tipItem}>
                <ThunderboltOutlined className={styles.tipIcon} />
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>灵活配置</div>
                  <div className={styles.tipDesc}>创建后可随时在项目设置中调整配置信息</div>
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
              extra="项目标识用于事项编号前缀，如 FE-1001"
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

            <Divider />

            <h3 className={styles.settingsSectionTitle}>功能开关</h3>

            <Form.Item
              name="enableIssues"
              label="启用事项管理"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableWiki"
              label="启用知识库"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableIterations"
              label="启用迭代管理"
              valuePropName="checked"
            >
              <Switch />
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
            <h3 className={styles.settingsSectionTitle}>事项通知</h3>
            
            <Form.Item
              name="notifyOnIssueCreate"
              label="创建事项时通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="notifyOnIssueUpdate"
              label="更新事项时通知"
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
              label="谁可以创建事项"
            >
              <Select defaultValue="all" style={{ width: 200 }}>
                <Select.Option value="all">所有成员</Select.Option>
                <Select.Option value="admin">仅管理员</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="谁可以删除事项"
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

  // ==================== 项目看板视图 ====================
  const renderKanbanTab = () => {
    const groupedProjects = {
      planning: filteredProjects.filter(p => p.status === 'planning'),
      active: filteredProjects.filter(p => p.status === 'active'),
      completed: filteredProjects.filter(p => p.status === 'completed'),
      archived: filteredProjects.filter(p => p.status === 'archived'),
    }

    const statusConfig = {
      planning: { title: '规划中', color: '#faad14' },
      active: { title: '进行中', color: '#1677ff' },
      completed: { title: '已完成', color: '#52c41a' },
      archived: { title: '已归档', color: '#8c8c8c' },
    }

    const renderKanbanCard = (project: Project) => (
      <Card key={project.id} className={styles.kanbanCard} hoverable onClick={() => navigate(`/projects/${project.id}`)}>
        <div className={styles.kanbanCardHeader}>
          <Avatar
            shape="square"
            size={36}
            style={{ backgroundColor: project.color || '#1677ff' }}
          >
            {project.name.charAt(0)}
          </Avatar>
          <div className={styles.kanbanCardTitle}>
            <Text strong>{project.name}</Text>
            <Text type="secondary" className={styles.projectKey}>{project.key}</Text>
          </div>
        </div>
        <div className={styles.kanbanCardBody}>
          <Text type="secondary" className={styles.description}>
            {project.description || '暂无描述'}
          </Text>
        </div>
        <div className={styles.kanbanCardFooter}>
          <div className={styles.stats}>
            <span><TeamOutlined /> {project.memberCount || 0}</span>
          </div>
          <Progress 
            percent={project.progress || 0} 
            size="small" 
            showInfo={false}
            strokeColor={project.color || '#1677ff'}
          />
        </div>
      </Card>
    )

    const renderColumn = (status: keyof typeof statusConfig) => {
      const config = statusConfig[status]
      const columnProjects = groupedProjects[status]
      
      return (
        <div className={styles.kanbanColumn}>
          <div className={styles.kanbanColumnHeader}>
            <span className={styles.statusDot} style={{ backgroundColor: config.color }} />
            <Text strong>{config.title}</Text>
            <Tag>{columnProjects.length}</Tag>
          </div>
          <div className={styles.kanbanColumnContent}>
            {columnProjects.length === 0 ? (
              <Empty description="暂无项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              columnProjects.map(renderKanbanCard)
            )}
          </div>
        </div>
      )
    }

    return (
      <div className={styles.tabContent}>
        <div className={styles.kanbanBoard}>
          {renderColumn('planning')}
          {renderColumn('active')}
          {renderColumn('completed')}
          {renderColumn('archived')}
        </div>
      </div>
    )
  }

  // ==================== 项目甘特图视图 ====================
  const renderGanttTab = () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        planning: '#faad14',
        active: '#1677ff',
        completed: '#52c41a',
        archived: '#8c8c8c',
      }
      return colors[status] || '#1677ff'
    }

    const getStatusText = (status: string) => {
      const texts: Record<string, string> = {
        planning: '规划中',
        active: '进行中',
        completed: '已完成',
        archived: '已归档',
      }
      return texts[status] || status
    }

    const calculateBarStyle = (project: Project) => {
      const startMonth = project.startDate ? parseInt(project.startDate.split('-')[1]) : 1
      const endMonth = project.endDate ? parseInt(project.endDate.split('-')[1]) : 12
      const left = ((startMonth - 1) / 12) * 100
      const width = ((endMonth - startMonth + 1) / 12) * 100
      return { left: `${left}%`, width: `${width}%` }
    }

    return (
      <div className={styles.tabContent}>
        <Card className={styles.ganttCard}>
          {filteredProjects.length === 0 ? (
            <Empty description="暂无项目" />
          ) : (
            <div className={styles.ganttContainer}>
              <div className={styles.ganttHeader}>
                <div className={styles.ganttProjectColumn}>
                  <Text strong>项目名称</Text>
                </div>
                <div className={styles.ganttTimelineHeader}>
                  {months.map((month) => (
                    <div key={month} className={styles.ganttMonthCell}>
                      {month}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.ganttBody}>
                {filteredProjects.map((project) => (
                  <div key={project.id} className={styles.ganttRow}>
                    <div className={styles.ganttProjectColumn}>
                      <div className={styles.ganttProjectInfo}>
                        <Avatar size="small" style={{ backgroundColor: project.color || '#1677ff' }}>
                          {project.name.charAt(0)}
                        </Avatar>
                        <div className={styles.ganttProjectMeta}>
                          <Text strong className={styles.ganttProjectName}>{project.name}</Text>
                          <Text type="secondary" className={styles.projectKey}>{project.key}</Text>
                        </div>
                      </div>
                    </div>
                    <div className={styles.ganttTimelineCell}>
                      <div className={styles.ganttGridLines}>
                        {months.map((_, index) => (
                          <div key={index} className={styles.ganttGridLine} />
                        ))}
                      </div>
                      <Tooltip
                        title={
                          <div>
                            <div>{project.name}</div>
                            <div>进度: {project.progress || 0}%</div>
                            <div>状态: {getStatusText(project.status)}</div>
                          </div>
                        }
                      >
                        <div
                          className={styles.ganttBar}
                          style={{
                            ...calculateBarStyle(project),
                            backgroundColor: project.color || getStatusColor(project.status),
                          }}
                        >
                          <div 
                            className={styles.ganttProgressFill}
                            style={{ width: `${project.progress || 0}%` }}
                          />
                          <span className={styles.ganttBarLabel}>{project.progress || 0}%</span>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className={styles.ganttLegend}>
          <Text type="secondary">图例：</Text>
          <Space>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#faad14' }} />
              规划中
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#1677ff' }} />
              进行中
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#52c41a' }} />
              已完成
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#8c8c8c' }} />
              已归档
            </span>
          </Space>
        </div>
      </div>
    )
  }

  // Tab items configuration
  const tabItems = [
    { key: 'list', label: '项目列表', children: renderListTab() },
    { key: 'analytics', label: '项目分析', children: renderAnalyticsTab() },
    { key: 'kanban', label: '项目看板', children: renderKanbanTab() },
    { key: 'gantt', label: '项目甘特图', children: renderGanttTab() },
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