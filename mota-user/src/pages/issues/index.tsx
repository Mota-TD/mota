import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Tooltip
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import * as issueApi from '@/services/api/issue'
import * as projectApi from '@/services/api/project'
import styles from './index.module.css'

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
}

/**
 * 事项列表页面
 */
const Issues = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<Issue[]>([])
  const [total, setTotal] = useState(0)
  const [projects, setProjects] = useState<any[]>([])
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

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    loadIssues()
  }, [pagination, filters])

  const loadProjects = async () => {
    try {
      const res = await projectApi.getProjects()
      setProjects(res.list || [])
    } catch (error) {
      console.error('Failed to load projects:', error)
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
      setIssues((res.list || []) as Issue[])
      setTotal(res.total || 0)
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

  const handleCreateIssue = async (values: any) => {
    try {
      await issueApi.createIssue(values)
      message.success('事项创建成功')
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
      content: '删除后不可恢复，确定要删除这个事项吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await issueApi.deleteIssue(issueId)
          message.success('事项已删除')
          loadIssues()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
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

  const columns: ColumnsType<Issue> = [
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
    <div className={styles.issues}>
      <div className={styles.header}>
        <h2>任务管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          新建任务
        </Button>
      </div>

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
        columns={columns}
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