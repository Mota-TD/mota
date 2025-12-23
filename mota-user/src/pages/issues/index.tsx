import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Table,
  Input,
  Button,
  Select,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Modal,
  Form,
  message,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Tabs,
  Spin,
  Empty
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  FireOutlined,
  UserOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  StarOutlined
} from '@ant-design/icons'
import * as issueApi from '@/services/api/issue'
import * as projectApi from '@/services/api/project'
import * as sprintApi from '@/services/api/sprint'
import styles from './index.module.css'

const { Title, Text } = Typography

interface Issue {
  id: number
  key: string
  title: string
  type: string
  status: string
  priority: string
  assignee: number
  assigneeName?: string | null
  reporter: number
  reporterName?: string | null
  projectId: number
  projectName?: string | null
  sprintId: number
  storyPoints: number
  createdAt: string
  updatedAt: string
  startDate?: string
  endDate?: string
  progress?: number
  dueDate?: string
}

interface KanbanColumn {
  id: string
  title: string
  status: string
  issues: Issue[]
  limit?: number
}

/**
 * 任务管理页面
 * 包含任务列表、任务分析、任务看板、任务甘特图四个视图
 */
const Issues = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<Issue[]>([])
  const [total, setTotal] = useState(0)
  const [projects, setProjects] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({
    projectId: undefined as number | undefined,
    type: undefined as string | undefined,
    status: undefined as string | undefined,
    priority: undefined as string | undefined
  })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 })
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [selectedProject, setSelectedProject] = useState<number | undefined>()
  const [selectedSprint, setSelectedSprint] = useState<number | undefined>()
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null)
  
  // 当前激活的标签页
  const activeTab = searchParams.get('tab') || 'list'

  // 看板列配置
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'open', title: '待处理', status: 'open', issues: [], limit: 10 },
    { id: 'in_progress', title: '进行中', status: 'in_progress', issues: [], limit: 5 },
    { id: 'testing', title: '测试中', status: 'testing', issues: [], limit: 5 },
    { id: 'done', title: '已完成', status: 'done', issues: [] }
  ])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    loadIssues()
  }, [pagination, filters])

  useEffect(() => {
    if (selectedProject) {
      loadSprints()
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      const res = await projectApi.getProjects()
      const projectList = res.list || []
      setProjects(projectList)
      if (projectList.length > 0) {
        setSelectedProject(projectList[0].id)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadSprints = async () => {
    try {
      const res = await sprintApi.getSprints({ projectId: selectedProject! })
      const sprintList = (res as any).list || res || []
      setSprints(sprintList)
    } catch (error) {
      console.error('Failed to load sprints:', error)
    }
  }

  const loadIssues = async () => {
    setLoading(true)
    try {
      const res = await issueApi.getIssues({
        projectId: filters.projectId,
        status: filters.status,
        type: filters.type,
        search: searchText || undefined
      })
      // 添加模拟的日期数据用于甘特图
      const issuesWithDates = ((res.list || []) as Issue[]).map((issue, index) => ({
        ...issue,
        startDate: `2024-01-${String((index % 20) + 1).padStart(2, '0')}`,
        endDate: `2024-01-${String((index % 20) + 10).padStart(2, '0')}`,
        progress: issue.status === 'done' ? 100 : issue.status === 'in_progress' ? 50 : 0,
      }))
      setIssues(issuesWithDates)
      setTotal(res.total || 0)
      
      // 更新看板列
      const newColumns = columns.map(col => ({
        ...col,
        issues: issuesWithDates.filter(issue => issue.status === col.status)
      }))
      setColumns(newColumns)
    } catch (error) {
      console.error('Failed to load issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 })
    loadIssues()
  }

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key })
  }

  const handleCreateIssue = async (values: any) => {
    try {
      await issueApi.createIssue(values)
      message.success('任务创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      loadIssues()
    } catch (error: any) {
      message.error(error.message || '创建失败')
    }
  }

  const handleDeleteIssue = (issueId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个任务吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await issueApi.deleteIssue(issueId)
          message.success('任务已删除')
          loadIssues()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  // 看板拖拽处理
  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    setDraggedIssue(issue)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault()
    
    if (!draggedIssue) return
    
    if (targetColumn.limit && targetColumn.issues.length >= targetColumn.limit) {
      message.warning(`${targetColumn.title} 列已达到在制品限制 (${targetColumn.limit})`)
      return
    }
    
    const newColumns = columns.map(col => {
      if (col.id === targetColumn.id) {
        return {
          ...col,
          issues: [...col.issues, { ...draggedIssue, status: col.status }]
        }
      }
      return {
        ...col,
        issues: col.issues.filter(issue => issue.id !== draggedIssue.id)
      }
    })
    setColumns(newColumns)
    
    try {
      await issueApi.updateIssue(draggedIssue.id, { status: targetColumn.status } as any)
      message.success('状态已更新')
    } catch (error) {
      message.error('更新失败')
      loadIssues()
    }
    
    setDraggedIssue(null)
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      story: { color: 'green', text: '需求' },
      task: { color: 'blue', text: '任务' },
      bug: { color: 'red', text: '缺陷' },
      epic: { color: 'purple', text: '史诗' }
    }
    const t = typeMap[type] || { color: 'default', text: type }
    return <Tag color={t.color}>{t.text}</Tag>
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      open: { color: 'default', text: '待处理' },
      in_progress: { color: 'processing', text: '进行中' },
      testing: { color: 'warning', text: '测试中' },
      done: { color: 'success', text: '已完成' },
      closed: { color: 'default', text: '已关闭' }
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      highest: { color: '#ff4d4f', text: '最高' },
      high: { color: '#fa8c16', text: '高' },
      medium: { color: '#1677ff', text: '中' },
      low: { color: '#52c41a', text: '低' },
      lowest: { color: '#8c8c8c', text: '最低' }
    }
    const p = priorityMap[priority] || { color: '#8c8c8c', text: priority }
    return <Tag color={p.color}>{p.text}</Tag>
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      story: '#52c41a',
      task: '#1677ff',
      bug: '#ff4d4f',
      epic: '#722ed1'
    }
    return colors[type] || '#8c8c8c'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#faad14',
      in_progress: '#1677ff',
      testing: '#fa8c16',
      done: '#52c41a',
      closed: '#8c8c8c',
    }
    return colors[status] || '#1677ff'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      highest: '#ff4d4f',
      high: '#fa8c16',
      medium: '#faad14',
      low: '#52c41a',
      lowest: '#8c8c8c',
    }
    return colors[priority] || '#faad14'
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      story: <StarOutlined style={{ color: '#52c41a' }} />,
      task: <CheckSquareOutlined style={{ color: '#1677ff' }} />,
      bug: <BugOutlined style={{ color: '#ff4d4f' }} />,
      epic: <ExclamationCircleOutlined style={{ color: '#722ed1' }} />,
    }
    return icons[type] || <CheckSquareOutlined />
  }

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, { color: string; icon: string }> = {
      highest: { color: '#ff4d4f', icon: '⬆⬆' },
      high: { color: '#fa8c16', icon: '⬆' },
      medium: { color: '#1677ff', icon: '➡' },
      low: { color: '#52c41a', icon: '⬇' },
      lowest: { color: '#8c8c8c', icon: '⬇⬇' }
    }
    const p = icons[priority] || icons.medium
    return <span style={{ color: p.color }}>{p.icon}</span>
  }

  // ==================== 任务列表视图 ====================
  const renderListTab = () => {
    const tableColumns: ColumnsType<Issue> = [
      {
        title: '标识',
        dataIndex: 'key',
        key: 'key',
        width: 100,
        render: (key: string) => (
          <span className={styles.issueKey}>{key}</span>
        )
      },
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (title: string, record: Issue) => (
          <a onClick={() => navigate(`/issues/${record.id}`)}>{title}</a>
        )
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 80,
        render: (type: string) => getTypeTag(type)
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => getStatusTag(status)
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 80,
        render: (priority: string) => getPriorityTag(priority)
      },
      {
        title: '经办人',
        dataIndex: 'assigneeName',
        key: 'assignee',
        width: 120,
        render: (name: string) => (
          name ? (
            <Space>
              <Avatar size="small">{name.charAt(0)}</Avatar>
              <span>{name}</span>
            </Space>
          ) : '-'
        )
      },
      {
        title: '故事点',
        dataIndex: 'storyPoints',
        key: 'storyPoints',
        width: 80,
        align: 'center'
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 120
      },
      {
        title: '操作',
        key: 'action',
        width: 80,
        fixed: 'right',
        render: (_: any, record: Issue) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: '查看详情',
                  onClick: () => navigate(`/issues/${record.id}`)
                },
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: '编辑',
                  onClick: () => navigate(`/issues/${record.id}`)
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  onClick: () => handleDeleteIssue(record.id)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )
      }
    ]

    return (
      <div className={styles.tabContent}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <Input
              placeholder="搜索任务"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="项目"
              value={filters.projectId}
              onChange={(value) => setFilters({ ...filters, projectId: value })}
              style={{ width: 150 }}
              allowClear
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
            <Select
              placeholder="类型"
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              style={{ width: 100 }}
              allowClear
              options={[
                { value: 'story', label: '需求' },
                { value: 'task', label: '任务' },
                { value: 'bug', label: '缺陷' },
                { value: 'epic', label: '史诗' }
              ]}
            />
            <Select
              placeholder="状态"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: 100 }}
              allowClear
              options={[
                { value: 'open', label: '待处理' },
                { value: 'in_progress', label: '进行中' },
                { value: 'done', label: '已完成' },
                { value: 'closed', label: '已关闭' }
              ]}
            />
            <Select
              placeholder="优先级"
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
              style={{ width: 100 }}
              allowClear
              options={[
                { value: 'highest', label: '最高' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
                { value: 'lowest', label: '最低' }
              ]}
            />
            <Tooltip title="更多筛选">
              <Button icon={<FilterOutlined />} />
            </Tooltip>
          </div>
        </div>

        <Table
          columns={tableColumns}
          dataSource={issues}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={(pag) => {
            setPagination({
              current: pag.current || 1,
              pageSize: pag.pageSize || 20
            })
          }}
          scroll={{ x: 1200 }}
        />
      </div>
    )
  }

  // ==================== 任务分析视图 ====================
  const renderAnalyticsTab = () => {
    const overviewStats = {
      totalTasks: issues.length,
      completedTasks: issues.filter(i => i.status === 'done').length,
      inProgressTasks: issues.filter(i => i.status === 'in_progress').length,
      pendingTasks: issues.filter(i => i.status === 'open').length,
      overdueTask: 8,
      avgCompletionTime: 3.5,
      completionRate: issues.length > 0 
        ? Math.round((issues.filter(i => i.status === 'done').length / issues.length) * 100)
        : 0,
      onTimeRate: 85.2,
    }

    const taskTypeDistribution = [
      { type: '需求', count: issues.filter(i => i.type === 'story').length, color: '#52c41a' },
      { type: '缺陷', count: issues.filter(i => i.type === 'bug').length, color: '#ff4d4f' },
      { type: '任务', count: issues.filter(i => i.type === 'task').length, color: '#1677ff' },
      { type: '史诗', count: issues.filter(i => i.type === 'epic').length, color: '#722ed1' },
    ]

    return (
      <div className={styles.tabContent}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="任务总数"
                value={overviewStats.totalTasks}
                prefix={<BugOutlined style={{ color: '#2b7de9' }} />}
                suffix="个"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="完成率"
                value={overviewStats.completionRate}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="按时完成率"
                value={overviewStats.onTimeRate}
                prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard}>
              <Statistic
                title="平均完成时间"
                value={overviewStats.avgCompletionTime}
                prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
                suffix="天"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="任务状态分布" className={styles.chartCard}>
              <Row gutter={16}>
                <Col span={8}>
                  <div className={styles.statusItem}>
                    <Progress
                      type="circle"
                      percent={overviewStats.totalTasks > 0 ? Math.round((overviewStats.completedTasks / overviewStats.totalTasks) * 100) : 0}
                      strokeColor="#52c41a"
                      size={80}
                    />
                    <div className={styles.statusLabel}>
                      <Text strong>{overviewStats.completedTasks}</Text>
                      <Text type="secondary">已完成</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.statusItem}>
                    <Progress
                      type="circle"
                      percent={overviewStats.totalTasks > 0 ? Math.round((overviewStats.inProgressTasks / overviewStats.totalTasks) * 100) : 0}
                      strokeColor="#2b7de9"
                      size={80}
                    />
                    <div className={styles.statusLabel}>
                      <Text strong>{overviewStats.inProgressTasks}</Text>
                      <Text type="secondary">进行中</Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.statusItem}>
                    <Progress
                      type="circle"
                      percent={overviewStats.totalTasks > 0 ? Math.round((overviewStats.pendingTasks / overviewStats.totalTasks) * 100) : 0}
                      strokeColor="#faad14"
                      size={80}
                    />
                    <div className={styles.statusLabel}>
                      <Text strong>{overviewStats.pendingTasks}</Text>
                      <Text type="secondary">待处理</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="任务类型分布" className={styles.chartCard}>
              <div className={styles.typeDistribution}>
                {taskTypeDistribution.map((item) => (
                  <div key={item.type} className={styles.typeItem}>
                    <div className={styles.typeHeader}>
                      <Tag color={item.color}>{item.type}</Tag>
                      <Text strong>{item.count}</Text>
                    </div>
                    <Progress
                      percent={overviewStats.totalTasks > 0 ? Math.round((item.count / overviewStats.totalTasks) * 100) : 0}
                      strokeColor={item.color}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  // ==================== 任务看板视图 ====================
  const renderKanbanTab = () => {
    const renderIssueCard = (issue: Issue) => (
      <div
        key={issue.id}
        className={styles.issueCard}
        draggable
        onDragStart={(e) => handleDragStart(e, issue)}
      >
        <div className={styles.cardHeader}>
          <span
            className={styles.issueType}
            style={{ backgroundColor: getTypeColor(issue.type) }}
          />
          <span className={styles.issueKeySmall}>{issue.key}</span>
          <span className={styles.issuePriority}>{getPriorityIcon(issue.priority)}</span>
        </div>
        <div className={styles.cardBody}>
          <p className={styles.issueTitle}>{issue.title}</p>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.cardMeta}>
            {issue.storyPoints && (
              <Tag className={styles.storyPoints}>{issue.storyPoints}</Tag>
            )}
          </div>
          {issue.assigneeName ? (
            <Avatar size="small" className={styles.assignee}>
              {issue.assigneeName.charAt(0)}
            </Avatar>
          ) : (
            <Avatar size="small" icon={<UserOutlined />} className={styles.assignee} />
          )}
        </div>
      </div>
    )

    return (
      <div className={styles.tabContent}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <Select
              placeholder="选择项目"
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: 180 }}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
            <Select
              placeholder="选择迭代"
              value={selectedSprint}
              onChange={setSelectedSprint}
              style={{ width: 180 }}
              allowClear
              options={sprints.map(s => ({ value: s.id, label: s.name }))}
            />
            <Input
              placeholder="搜索任务"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <Spin size="large" />
          </div>
        ) : (
          <div className={styles.board}>
            {columns.map(column => (
              <div
                key={column.id}
                className={styles.column}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitle}>
                    <span>{column.title}</span>
                    <span className={styles.columnCount}>{column.issues.length}</span>
                    {column.limit && (
                      <span className={styles.columnLimit}>/ {column.limit}</span>
                    )}
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'add', label: '添加任务' },
                        { key: 'settings', label: '列设置' }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
                <div className={styles.columnBody}>
                  {column.issues.map(issue => renderIssueCard(issue))}
                  {column.issues.length === 0 && (
                    <div className={styles.emptyColumn}>
                      拖拽任务到此处
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ==================== 任务甘特图视图 ====================
  const renderGanttTab = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    const calculateBarStyle = (issue: Issue) => {
      const startDay = issue.startDate ? parseInt(issue.startDate.split('-')[2]) : 1
      const endDay = issue.endDate ? parseInt(issue.endDate.split('-')[2]) : 31
      const left = ((startDay - 1) / 31) * 100
      const width = ((endDay - startDay + 1) / 31) * 100
      return { left: `${left}%`, width: `${width}%` }
    }

    return (
      <div className={styles.tabContent}>
        <Card className={styles.ganttCard}>
          {issues.length === 0 ? (
            <Empty description="暂无任务" />
          ) : (
            <div className={styles.ganttContainer}>
              <div className={styles.ganttHeader}>
                <div className={styles.ganttTaskColumn}>
                  <Text strong>任务名称</Text>
                </div>
                <div className={styles.ganttTimelineHeader}>
                  {days.map((day) => (
                    <div key={day} className={styles.ganttDayCell}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.ganttBody}>
                {issues.slice(0, 15).map((issue) => (
                  <div key={issue.id} className={styles.ganttRow}>
                    <div className={styles.ganttTaskColumn}>
                      <div className={styles.ganttTaskInfo}>
                        {getTypeIcon(issue.type)}
                        <div className={styles.ganttTaskMeta}>
                          <Text strong className={styles.ganttTaskTitle}>{issue.title}</Text>
                          <div className={styles.ganttTaskSubInfo}>
                            <Text type="secondary" className={styles.issueKeySmall}>{issue.key}</Text>
                            <Tag color={getPriorityColor(issue.priority)} style={{ fontSize: 10 }}>
                              {issue.priority}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.ganttTimelineCell}>
                      <div className={styles.ganttGridLines}>
                        {days.map((day) => (
                          <div key={day} className={styles.ganttGridLine} />
                        ))}
                      </div>
                      <Tooltip
                        title={
                          <div>
                            <div>{issue.title}</div>
                            <div>进度: {issue.progress || 0}%</div>
                            <div>负责人: {issue.assigneeName || '未分配'}</div>
                          </div>
                        }
                      >
                        <div
                          className={styles.ganttBar}
                          style={{
                            ...calculateBarStyle(issue),
                            backgroundColor: getStatusColor(issue.status),
                          }}
                        >
                          <div 
                            className={styles.ganttProgressFill}
                            style={{ width: `${issue.progress || 0}%` }}
                          />
                          <span className={styles.ganttBarLabel}>{issue.progress || 0}%</span>
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
          <Text type="secondary">状态图例：</Text>
          <Space>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#faad14' }} />
              待处理
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
              已关闭
            </span>
          </Space>
        </div>
      </div>
    )
  }

  // Tab items configuration
  const tabItems = [
    { key: 'list', label: '任务列表', children: renderListTab() },
    { key: 'analytics', label: '任务分析', children: renderAnalyticsTab() },
    { key: 'kanban', label: '任务看板', children: renderKanbanTab() },
    { key: 'gantt', label: '任务甘特图', children: renderGanttTab() },
  ]

  return (
    <div className={styles.issues}>
      {/* 蓝色头部卡片 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={4} className={styles.headerTitle}>任务管理</Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className={styles.createBtn}
        >
          新建任务
        </Button>
      </div>

      {/* 标签页导航 */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        className={styles.tabs}
      />

      {/* 创建任务弹窗 */}
      <Modal
        title="新建任务"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateIssue}
        >
          <Form.Item
            name="projectId"
            label="所属项目"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select
              placeholder="请选择项目"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select
              placeholder="请选择类型"
              options={[
                { value: 'story', label: '需求' },
                { value: 'task', label: '任务' },
                { value: 'bug', label: '缺陷' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            initialValue="medium"
          >
            <Select
              options={[
                { value: 'highest', label: '最高' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
                { value: 'lowest', label: '最低' }
              ]}
            />
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

export default Issues