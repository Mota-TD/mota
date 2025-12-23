import { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  message, 
  Typography,
  Dropdown,
  Avatar,
  Progress,
  Tabs,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BugOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text } = Typography

interface TestCase {
  id: number
  key: string
  title: string
  description?: string
  status: string
  priority: string
  type: string
  module: string
  executor?: string
  result?: string
  createdAt: string
  executedAt?: string
}

interface TestPlan {
  id: number
  name: string
  description?: string
  status: string
  progress: number
  totalCases: number
  passedCases: number
  failedCases: number
  startDate: string
  endDate: string
}

/**
 * 测试管理页面
 */
const Testing = () => {
  const [loading, setLoading] = useState(false)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [testPlans, setTestPlans] = useState<TestPlan[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('cases')
  const [form] = Form.useForm()

  useEffect(() => {
    loadTestCases()
    loadTestPlans()
  }, [])

  const loadTestCases = async () => {
    setLoading(true)
    // 模拟数据
    const mockData: TestCase[] = [
      { id: 1, key: 'TC-001', title: '用户登录功能测试', description: '验证用户登录功能正常', status: 'passed', priority: 'high', type: 'functional', module: '用户模块', executor: '张三', result: 'passed', createdAt: '2024-01-15', executedAt: '2024-01-16' },
      { id: 2, key: 'TC-002', title: '用户注册功能测试', description: '验证用户注册流程', status: 'passed', priority: 'high', type: 'functional', module: '用户模块', executor: '李四', result: 'passed', createdAt: '2024-01-14', executedAt: '2024-01-16' },
      { id: 3, key: 'TC-003', title: '项目创建测试', description: '验证项目创建功能', status: 'failed', priority: 'high', type: 'functional', module: '项目模块', executor: '王五', result: 'failed', createdAt: '2024-01-13', executedAt: '2024-01-16' },
      { id: 4, key: 'TC-004', title: '任务分配测试', description: '验证任务分配功能', status: 'pending', priority: 'medium', type: 'functional', module: '任务模块', createdAt: '2024-01-12' },
      { id: 5, key: 'TC-005', title: '性能压力测试', description: '验证系统在高并发下的表现', status: 'running', priority: 'high', type: 'performance', module: '系统', executor: '赵六', createdAt: '2024-01-11' },
      { id: 6, key: 'TC-006', title: '接口安全测试', description: '验证API接口安全性', status: 'pending', priority: 'highest', type: 'security', module: 'API', createdAt: '2024-01-10' },
      { id: 7, key: 'TC-007', title: '数据导出测试', description: '验证数据导出功能', status: 'passed', priority: 'medium', type: 'functional', module: '报表模块', executor: '钱七', result: 'passed', createdAt: '2024-01-09', executedAt: '2024-01-15' },
      { id: 8, key: 'TC-008', title: '移动端兼容性测试', description: '验证移动端显示效果', status: 'blocked', priority: 'medium', type: 'compatibility', module: '前端', createdAt: '2024-01-08' },
    ]
    setTestCases(mockData)
    setLoading(false)
  }

  const loadTestPlans = async () => {
    const mockPlans: TestPlan[] = [
      { id: 1, name: 'Sprint 2 测试计划', description: '第二迭代功能测试', status: 'active', progress: 65, totalCases: 45, passedCases: 28, failedCases: 3, startDate: '2024-01-15', endDate: '2024-01-28' },
      { id: 2, name: '回归测试计划', description: '版本发布前回归测试', status: 'pending', progress: 0, totalCases: 120, passedCases: 0, failedCases: 0, startDate: '2024-01-29', endDate: '2024-02-05' },
      { id: 3, name: 'Sprint 1 测试计划', description: '第一迭代功能测试', status: 'completed', progress: 100, totalCases: 38, passedCases: 35, failedCases: 3, startDate: '2024-01-01', endDate: '2024-01-14' },
    ]
    setTestPlans(mockPlans)
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { color: 'default', text: '待执行', icon: <ExclamationCircleOutlined /> },
      running: { color: 'processing', text: '执行中', icon: <PlayCircleOutlined /> },
      passed: { color: 'success', text: '通过', icon: <CheckCircleOutlined /> },
      failed: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
      blocked: { color: 'warning', text: '阻塞', icon: <ExclamationCircleOutlined /> },
    }
    const s = statusMap[status] || { color: 'default', text: status, icon: null }
    return <Tag color={s.color} icon={s.icon}>{s.text}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      highest: { color: '#ff4d4f', text: '最高' },
      high: { color: '#fa8c16', text: '高' },
      medium: { color: '#faad14', text: '中' },
      low: { color: '#52c41a', text: '低' },
    }
    const p = priorityMap[priority] || { color: '#faad14', text: priority }
    return <Tag color={p.color}>{p.text}</Tag>
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      functional: { color: 'blue', text: '功能测试' },
      performance: { color: 'purple', text: '性能测试' },
      security: { color: 'red', text: '安全测试' },
      compatibility: { color: 'orange', text: '兼容性测试' },
    }
    const t = typeMap[type] || { color: 'default', text: type }
    return <Tag color={t.color}>{t.text}</Tag>
  }

  const testCaseColumns = [
    {
      title: '用例编号',
      dataIndex: 'key',
      key: 'key',
      width: 100,
      render: (text: string) => <Text strong style={{ color: '#fa8c16' }}>{text}</Text>,
    },
    {
      title: '用例标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: TestCase) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
    },
    {
      title: '执行人',
      dataIndex: 'executor',
      key: 'executor',
      width: 100,
      render: (executor: string) => executor ? (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
            {executor.charAt(0)}
          </Avatar>
          <Text>{executor}</Text>
        </Space>
      ) : <Text type="secondary">未分配</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: TestCase) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: '查看详情' },
              { key: 'run', icon: <PlayCircleOutlined />, label: '执行测试' },
              { key: 'edit', icon: <EditOutlined />, label: '编辑' },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const testPlanColumns = [
    {
      title: '计划名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TestPlan) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: '待开始' },
          active: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
        }
        const s = statusMap[status] || { color: 'default', text: status }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: '用例统计',
      key: 'stats',
      width: 200,
      render: (_: any, record: TestPlan) => (
        <Space>
          <Tag color="default">总计: {record.totalCases}</Tag>
          <Tag color="success">通过: {record.passedCases}</Tag>
          <Tag color="error">失败: {record.failedCases}</Tag>
        </Space>
      ),
    },
    {
      title: '时间范围',
      key: 'dateRange',
      width: 180,
      render: (_: any, record: TestPlan) => (
        <Text type="secondary">{record.startDate} ~ {record.endDate}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: '查看详情' },
              { key: 'edit', icon: <EditOutlined />, label: '编辑' },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const filteredTestCases = testCases.filter(tc => {
    const matchSearch = !searchText || 
      tc.title.toLowerCase().includes(searchText.toLowerCase()) ||
      tc.key.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === 'all' || tc.status === statusFilter
    return matchSearch && matchStatus
  })

  // 统计数据
  const stats = {
    total: testCases.length,
    passed: testCases.filter(tc => tc.status === 'passed').length,
    failed: testCases.filter(tc => tc.status === 'failed').length,
    pending: testCases.filter(tc => tc.status === 'pending').length,
    running: testCases.filter(tc => tc.status === 'running').length,
  }

  const tabItems = [
    {
      key: 'cases',
      label: '测试用例',
      children: (
        <div>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <Input
                placeholder="搜索用例"
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
                  { value: 'pending', label: '待执行' },
                  { value: 'running', label: '执行中' },
                  { value: 'passed', label: '通过' },
                  { value: 'failed', label: '失败' },
                  { value: 'blocked', label: '阻塞' },
                ]}
              />
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
              新建用例
            </Button>
          </div>
          <Table
            columns={testCaseColumns}
            dataSource={filteredTestCases}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredTestCases.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条用例`,
            }}
          />
        </div>
      ),
    },
    {
      key: 'plans',
      label: '测试计划',
      children: (
        <div>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <Input
                placeholder="搜索计划"
                prefix={<SearchOutlined />}
                style={{ width: 240 }}
                allowClear
              />
            </div>
            <Button type="primary" icon={<PlusOutlined />}>
              新建计划
            </Button>
          </div>
          <Table
            columns={testPlanColumns}
            dataSource={testPlans}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      {/* 蓝色头部卡片 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={4} className={styles.headerTitle}>测试管理</Title>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="用例总数"
              value={stats.total}
              prefix={<ExperimentOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="通过"
              value={stats.passed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="失败"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="待执行"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className={styles.tableCard}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      <Modal
        title="新建测试用例"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={() => { message.success('用例创建成功'); setCreateModalVisible(false) }}>
          <Form.Item name="title" label="用例标题" rules={[{ required: true, message: '请输入用例标题' }]}>
            <Input placeholder="请输入用例标题" />
          </Form.Item>
          <Form.Item name="description" label="用例描述">
            <Input.TextArea rows={4} placeholder="请输入用例描述" />
          </Form.Item>
          <Form.Item name="type" label="测试类型" rules={[{ required: true, message: '请选择测试类型' }]}>
            <Select placeholder="请选择测试类型">
              <Select.Option value="functional">功能测试</Select.Option>
              <Select.Option value="performance">性能测试</Select.Option>
              <Select.Option value="security">安全测试</Select.Option>
              <Select.Option value="compatibility">兼容性测试</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请选择优先级' }]}>
            <Select placeholder="请选择优先级">
              <Select.Option value="highest">最高</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="module" label="所属模块">
            <Input placeholder="请输入所属模块" />
          </Form.Item>
          <Form.Item>
            <div className={styles.formActions}>
              <Button onClick={() => { setCreateModalVisible(false); form.resetFields() }}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Testing