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
  Form,
  message,
  Empty,
  Spin,
  Typography,
  Space,
  Table,
  Statistic,
  Tooltip,
  Tabs
} from 'antd'
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
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import * as projectApi from '@/services/api/project'
import styles from './index.module.css'

const { Title, Text } = Typography

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
  starred?: boolean
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
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()
  
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

  const handleCreateProject = async (values: any) => {
    try {
      await projectApi.createProject(values)
      message.success('项目创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      loadProjects()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    }
  }

  const handleToggleStar = async (projectId: number, starred: boolean) => {
    try {
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, starred: !starred } : p
      ))
      message.success(starred ? '已取消收藏' : '已收藏')
    } catch (error) {
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
        } catch (error) {
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
      onClick: () => navigate(`/projects/${project.id}/settings`)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '项目设置',
      onClick: () => navigate(`/settings`)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除项目',
      danger: true,
      onClick: () => handleDeleteProject(project.id)
    }
  ]

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
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
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
                  icon={project.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleStar(project.id, project.starred || false)
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
                icon={project.starred ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleStar(project.id, project.starred || false)
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
      totalTasks: projects.reduce((sum, p) => sum + (p.issueCount || 0), 0),
      completedTasks: Math.floor(projects.reduce((sum, p) => sum + (p.issueCount || 0), 0) * 0.7),
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
          onClick={() => setCreateModalVisible(true)}
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

      {/* 创建项目弹窗 */}
      <Modal
        title="创建项目"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
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
            rules={[
              { required: true, message: '请输入项目标识' },
              { pattern: /^[A-Z][A-Z0-9]*$/, message: '项目标识必须以大写字母开头，只能包含大写字母和数字' }
            ]}
          >
            <Input placeholder="如：PROJ" />
          </Form.Item>
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item>
            <div className={styles.formActions}>
              <Button onClick={() => {
                setCreateModalVisible(false)
                form.resetFields()
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Projects