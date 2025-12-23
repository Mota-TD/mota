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
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  ExportOutlined
} from '@ant-design/icons'
import styles from './index.module.css'

const { Title, Text } = Typography

interface Requirement {
  id: number
  key: string
  title: string
  description?: string
  status: string
  priority: string
  type: string
  source: string
  reporter: string
  assignee?: string
  progress: number
  createdAt: string
}

/**
 * 需求管理页面
 */
const Requirements = () => {
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadRequirements()
  }, [])

  const loadRequirements = async () => {
    setLoading(true)
    // 模拟数据
    const mockData: Requirement[] = [
      { id: 1, key: 'REQ-001', title: '用户登录功能优化', description: '优化登录流程，支持多种登录方式', status: 'approved', priority: 'high', type: 'feature', source: '客户反馈', reporter: '张三', assignee: '李四', progress: 80, createdAt: '2024-01-15' },
      { id: 2, key: 'REQ-002', title: '数据导出功能', description: '支持导出Excel和PDF格式', status: 'pending', priority: 'medium', type: 'feature', source: '内部需求', reporter: '王五', assignee: '赵六', progress: 30, createdAt: '2024-01-14' },
      { id: 3, key: 'REQ-003', title: '移动端适配', description: '优化移动端显示效果', status: 'in_review', priority: 'high', type: 'improvement', source: '用户调研', reporter: '张三', assignee: '钱七', progress: 50, createdAt: '2024-01-13' },
      { id: 4, key: 'REQ-004', title: '性能优化', description: '提升页面加载速度', status: 'approved', priority: 'highest', type: 'improvement', source: '技术评审', reporter: '李四', assignee: '张三', progress: 60, createdAt: '2024-01-12' },
      { id: 5, key: 'REQ-005', title: '权限管理增强', description: '支持更细粒度的权限控制', status: 'rejected', priority: 'low', type: 'feature', source: '客户反馈', reporter: '王五', progress: 0, createdAt: '2024-01-11' },
      { id: 6, key: 'REQ-006', title: '报表功能', description: '新增数据统计报表', status: 'pending', priority: 'medium', type: 'feature', source: '产品规划', reporter: '赵六', progress: 0, createdAt: '2024-01-10' },
      { id: 7, key: 'REQ-007', title: '消息通知优化', description: '支持多渠道消息推送', status: 'approved', priority: 'medium', type: 'improvement', source: '用户调研', reporter: '张三', assignee: '李四', progress: 90, createdAt: '2024-01-09' },
      { id: 8, key: 'REQ-008', title: 'API接口升级', description: '升级到RESTful API v2', status: 'in_review', priority: 'high', type: 'technical', source: '技术评审', reporter: '钱七', progress: 20, createdAt: '2024-01-08' },
    ]
    setRequirements(mockData)
    setLoading(false)
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '待评审' },
      in_review: { color: 'processing', text: '评审中' },
      approved: { color: 'success', text: '已通过' },
      rejected: { color: 'error', text: '已拒绝' },
    }
    const s = statusMap[status] || { color: 'default', text: status }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      highest: { color: '#ff4d4f', text: '最高' },
      high: { color: '#fa8c16', text: '高' },
      medium: { color: '#faad14', text: '中' },
      low: { color: '#52c41a', text: '低' },
      lowest: { color: '#8c8c8c', text: '最低' },
    }
    const p = priorityMap[priority] || { color: '#faad14', text: priority }
    return <Tag color={p.color}>{p.text}</Tag>
  }

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      feature: { color: 'blue', text: '新功能' },
      improvement: { color: 'green', text: '优化' },
      technical: { color: 'purple', text: '技术需求' },
    }
    const t = typeMap[type] || { color: 'default', text: type }
    return <Tag color={t.color}>{t.text}</Tag>
  }

  const columns = [
    {
      title: '需求编号',
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (text: string) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: '需求标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Requirement) => (
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
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
      render: (assignee: string) => assignee ? (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
            {assignee.charAt(0)}
          </Avatar>
          <Text>{assignee}</Text>
        </Space>
      ) : <Text type="secondary">未分配</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Requirement) => (
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

  const filteredRequirements = requirements.filter(req => {
    const matchSearch = !searchText || 
      req.title.toLowerCase().includes(searchText.toLowerCase()) ||
      req.key.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === 'all' || req.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCreate = async (values: any) => {
    message.success('需求创建成功')
    setCreateModalVisible(false)
    form.resetFields()
    loadRequirements()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={4} style={{ margin: 0 }}>需求管理</Title>
          <Text type="secondary">管理和跟踪所有产品需求</Text>
        </div>
        <div className={styles.headerRight}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            新建需求
          </Button>
        </div>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <Input
              placeholder="搜索需求"
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
                { value: 'pending', label: '待评审' },
                { value: 'in_review', label: '评审中' },
                { value: 'approved', label: '已通过' },
                { value: 'rejected', label: '已拒绝' },
              ]}
            />
          </div>
          <div className={styles.actions}>
            <Button icon={<FilterOutlined />}>筛选</Button>
            <Button icon={<ExportOutlined />}>导出</Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRequirements}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredRequirements.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条需求`,
          }}
        />
      </Card>

      <Modal
        title="新建需求"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="需求标题" rules={[{ required: true, message: '请输入需求标题' }]}>
            <Input placeholder="请输入需求标题" />
          </Form.Item>
          <Form.Item name="description" label="需求描述">
            <Input.TextArea rows={4} placeholder="请输入需求描述" />
          </Form.Item>
          <Form.Item name="type" label="需求类型" rules={[{ required: true, message: '请选择需求类型' }]}>
            <Select placeholder="请选择需求类型">
              <Select.Option value="feature">新功能</Select.Option>
              <Select.Option value="improvement">优化</Select.Option>
              <Select.Option value="technical">技术需求</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请选择优先级' }]}>
            <Select placeholder="请选择优先级">
              <Select.Option value="highest">最高</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="lowest">最低</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="需求来源">
            <Input placeholder="请输入需求来源" />
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

export default Requirements