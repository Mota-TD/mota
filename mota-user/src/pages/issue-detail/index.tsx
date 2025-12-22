import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Tag,
  Avatar,
  Space,
  Spin,
  message,
  Dropdown,
  Descriptions,
  Card,
  Input,
  Select,
  Timeline,
  Divider,
  Modal
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  PaperClipOutlined
} from '@ant-design/icons'
import { issueApi, projectApi } from '@/services/mock/api'
import { mockUsers, mockActivities } from '@/services/mock/data'
import styles from './index.module.css'

interface Issue {
  id: number
  key: string
  title: string
  type: string
  status: string
  priority: string
  assignee: number | null
  reporter: number
  projectId: number
  sprintId: number | null
  storyPoints: number
  description: string
  createdAt: string
  updatedAt: string
}

/**
 * 事项详情页面
 */
const IssueDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [project, setProject] = useState<any>(null)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (id) {
      loadIssueData(parseInt(id))
    }
  }, [id])

  const loadIssueData = async (issueId: number) => {
    setLoading(true)
    try {
      const issueRes = await issueApi.getIssueById(issueId)
      setIssue(issueRes.data)
      
      if (issueRes.data.projectId) {
        const projectRes = await projectApi.getProjectById(issueRes.data.projectId)
        setProject(projectRes.data)
      }
    } catch (error) {
      console.error('Failed to load issue:', error)
      message.error('加载事项失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!issue) return
    try {
      await issueApi.updateIssue(issue.id, { status: newStatus })
      setIssue({ ...issue, status: newStatus })
      message.success('状态已更新')
    } catch (error) {
      message.error('更新失败')
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个事项吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        if (!issue) return
        try {
          await issueApi.deleteIssue(issue.id)
          message.success('事项已删除')
          navigate('/issues')
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    message.success('评论已添加')
    setCommentText('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <BugOutlined style={{ color: '#ff4d4f' }} />
      case 'story':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#1677ff' }} />
    }
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
      review: { color: 'cyan', text: '待评审' },
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

  const getUser = (userId: number | null) => {
    if (!userId) return null
    return mockUsers.find(u => u.id === userId)
  }

  // 模拟活动记录
  const activities = mockActivities.slice(0, 3).map(a => ({
    ...a,
    user: mockUsers.find(u => u.id === a.userId)
  }))

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>事项不存在</h2>
          <Button type="primary" onClick={() => navigate('/issues')}>返回事项列表</Button>
        </div>
      </div>
    )
  }

  const assignee = getUser(issue.assignee)
  const reporter = getUser(issue.reporter)

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/issues')}
          />
          <div className={styles.issueKey}>
            {getTypeIcon(issue.type)}
            <span>{issue.key}</span>
          </div>
          {project && (
            <Tag 
              className={styles.projectTag}
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {project.name}
            </Tag>
          )}
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => message.info('编辑功能开发中')}>
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'link', icon: <LinkOutlined />, label: '复制链接' },
                { key: 'attach', icon: <PaperClipOutlined />, label: '添加附件' },
                { type: 'divider' },
                { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: handleDelete }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* 标题 */}
          <h1 className={styles.title}>{issue.title}</h1>

          {/* 状态操作栏 */}
          <div className={styles.statusBar}>
            <Space>
              <span>状态：</span>
              <Select
                value={issue.status}
                onChange={handleStatusChange}
                style={{ width: 120 }}
                options={[
                  { value: 'open', label: '待处理' },
                  { value: 'in_progress', label: '进行中' },
                  { value: 'testing', label: '测试中' },
                  { value: 'review', label: '待评审' },
                  { value: 'done', label: '已完成' },
                  { value: 'closed', label: '已关闭' }
                ]}
              />
            </Space>
          </div>

          {/* 描述 */}
          <Card title="描述" className={styles.card}>
            <div className={styles.description}>
              {issue.description || '暂无描述'}
            </div>
          </Card>

          {/* 评论 */}
          <Card title="评论" className={styles.card}>
            <div className={styles.commentInput}>
              <Avatar>{mockUsers[0].name.charAt(0)}</Avatar>
              <Input.TextArea
                placeholder="添加评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
              />
              <Button type="primary" onClick={handleAddComment}>
                发送
              </Button>
            </div>
            <Divider />
            <div className={styles.comments}>
              <div className={styles.commentItem}>
                <Avatar>{mockUsers[1].name.charAt(0)}</Avatar>
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{mockUsers[1].name}</span>
                    <span className={styles.commentTime}>2小时前</span>
                  </div>
                  <p>这个问题需要尽快处理，影响到用户体验。</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 活动记录 */}
          <Card title="活动记录" className={styles.card}>
            <Timeline
              items={activities.map(activity => ({
                children: (
                  <div className={styles.activityItem}>
                    <span className={styles.activityUser}>{activity.user?.name}</span>
                    <span className={styles.activityAction}>{activity.action}</span>
                    <span className={styles.activityTarget}>{activity.target}</span>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                )
              }))}
            />
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className={styles.sidebar}>
          <Card className={styles.detailCard}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="类型">
                {getTypeTag(issue.type)}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(issue.status)}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                {getPriorityTag(issue.priority)}
              </Descriptions.Item>
              <Descriptions.Item label="故事点">
                <Tag>{issue.storyPoints || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="经办人">
                {assignee ? (
                  <Space>
                    <Avatar size="small" src={assignee.avatar}>{assignee.name.charAt(0)}</Avatar>
                    {assignee.name}
                  </Space>
                ) : (
                  <span style={{ color: '#999' }}>未分配</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="报告人">
                {reporter ? (
                  <Space>
                    <Avatar size="small" src={reporter.avatar}>{reporter.name.charAt(0)}</Avatar>
                    {reporter.name}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {issue.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {issue.updatedAt}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default IssueDetail