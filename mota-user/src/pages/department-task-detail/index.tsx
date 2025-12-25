/**
 * 部门任务详情页面
 * 集成工作计划、里程碑、评论、交付物、反馈、进度报告等功能
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import {
  Card,
  Tabs,
  Button,
  Space,
  Tag,
  Descriptions,
  Progress,
  Spin,
  message,
  Breadcrumb,
  Avatar,
  Statistic,
  Row,
  Col
} from 'antd'
import {
  ArrowLeftOutlined,
  ProjectOutlined,
  FileTextOutlined,
  CommentOutlined,
  FlagOutlined,
  MessageOutlined,
  BarChartOutlined,
  UserOutlined
} from '@ant-design/icons'
import { departmentTaskApi, projectApi } from '@/services/api'
import type { DepartmentTask } from '@/services/api/departmentTask'
import WorkPlanUpload from '@/components/WorkPlanUpload'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import TaskComments from '@/components/TaskComments'
import DeliverableList from '@/components/DeliverableList'
import WorkFeedbackComponent from '@/components/WorkFeedback'
import ProgressReportComponent from '@/components/ProgressReport'
import styles from './index.module.css'

const DepartmentTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState<DepartmentTask | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [projectMembers, setProjectMembers] = useState<Array<{ id: number; name: string; avatar?: string }>>([])

  const taskId = id ? parseInt(id, 10) : 0
  
  // 从用户上下文获取当前用户ID
  const currentUserId = useMemo(() => user?.id || 0, [user])

  useEffect(() => {
    if (taskId) {
      loadTask()
    }
  }, [taskId])

  const loadTask = async () => {
    setLoading(true)
    try {
      const data = await departmentTaskApi.getDepartmentTaskById(taskId)
      setTask(data)
      
      // 加载项目成员用于@提及功能
      if (data.projectId) {
        try {
          const members = await projectApi.getProjectMembers(data.projectId)
          setProjectMembers(members.map((m: any) => ({
            id: m.userId || m.id,
            name: m.userName || m.name,
            avatar: m.userAvatar || m.avatar
          })))
        } catch (e) {
          console.warn('Failed to load project members:', e)
        }
      }
    } catch (error) {
      console.error('Load task error:', error)
      message.error('加载任务详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const getStatusTag = (status: string) => {
    return (
      <Tag color={departmentTaskApi.getStatusColor(status as any)}>
        {departmentTaskApi.getStatusText(status as any)}
      </Tag>
    )
  }

  const getPriorityTag = (priority: string) => {
    return (
      <Tag color={departmentTaskApi.getPriorityColor(priority as any)}>
        {departmentTaskApi.getPriorityText(priority as any)}
      </Tag>
    )
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('zh-CN')
  }

  // 计算剩余天数
  const getDaysRemaining = () => {
    if (!task?.endDate) return null
    const end = new Date(task.endDate)
    const today = new Date()
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysRemaining = getDaysRemaining()

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <ProjectOutlined />
          概览
        </span>
      ),
      children: task && (
        <div className={styles.overviewTab}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="任务进度"
                  value={task.progress || 0}
                  suffix="%"
                  valueStyle={{ color: task.progress === 100 ? '#52c41a' : '#1677ff' }}
                />
                <Progress percent={task.progress || 0} showInfo={false} size="small" />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="剩余天数"
                  value={daysRemaining !== null ? Math.abs(daysRemaining) : '-'}
                  suffix={daysRemaining !== null ? (daysRemaining >= 0 ? '天' : '天(已逾期)') : ''}
                  valueStyle={{ color: daysRemaining !== null && daysRemaining < 0 ? '#ff4d4f' : '#333' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="子任务"
                  value={task.taskCount || 0}
                  suffix="个"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="已完成子任务"
                  value={task.completedTaskCount || 0}
                  suffix={`/ ${task.taskCount || 0}`}
                />
              </Card>
            </Col>
          </Row>

          <Card title="任务详情" className={styles.detailCard}>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
              <Descriptions.Item label="任务名称" span={3}>
                {task.name}
              </Descriptions.Item>
              <Descriptions.Item label="所属项目">
                {task.projectName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="负责部门">
                {task.departmentName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {task.managerName || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(task.status)}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                {getPriorityTag(task.priority)}
              </Descriptions.Item>
              <Descriptions.Item label="进度">
                <Progress percent={task.progress || 0} size="small" style={{ width: 100 }} />
              </Descriptions.Item>
              <Descriptions.Item label="开始日期">
                {formatDate(task.startDate)}
              </Descriptions.Item>
              <Descriptions.Item label="截止日期">
                {formatDate(task.endDate)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDate(task.createdAt)}
              </Descriptions.Item>
              {task.description && (
                <Descriptions.Item label="任务描述" span={3}>
                  <div className={styles.description}>{task.description}</div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </div>
      )
    },
    {
      key: 'workplan',
      label: (
        <span>
          <FileTextOutlined />
          工作计划
        </span>
      ),
      children: task && (
        <WorkPlanUpload
          departmentTaskId={taskId}
          requireApproval={true}
          onSuccess={loadTask}
        />
      )
    },
    {
      key: 'milestones',
      label: (
        <span>
          <FlagOutlined />
          里程碑
        </span>
      ),
      children: task && (
        <MilestoneTimeline
          projectId={task.projectId}
          editable={true}
          onMilestoneChange={loadTask}
        />
      )
    },
    {
      key: 'deliverables',
      label: (
        <span>
          <FileTextOutlined />
          交付物
        </span>
      ),
      children: task && (
        <DeliverableList
          taskId={taskId}
          editable={true}
          onDeliverableChange={loadTask}
        />
      )
    },
    {
      key: 'comments',
      label: (
        <span>
          <CommentOutlined />
          讨论
        </span>
      ),
      children: task && (
        <TaskComments
          taskId={taskId}
          currentUserId={currentUserId}
          projectMembers={projectMembers}
          onCommentChange={loadTask}
        />
      )
    },
    {
      key: 'feedback',
      label: (
        <span>
          <MessageOutlined />
          工作反馈
        </span>
      ),
      children: task && (
        <WorkFeedbackComponent
          taskId={taskId}
          currentUserId={currentUserId}
          onFeedbackChange={loadTask}
        />
      )
    },
    {
      key: 'reports',
      label: (
        <span>
          <BarChartOutlined />
          进度报告
        </span>
      ),
      children: task && (
        <ProgressReportComponent
          taskId={taskId}
          projectId={task.projectId ? Number(task.projectId) : undefined}
          onReportChange={loadTask}
        />
      )
    }
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className={styles.notFound}>
        <p>任务不存在或已被删除</p>
        <Button type="primary" onClick={handleBack}>
          返回
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 面包屑导航 */}
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          { title: '项目管理' },
          { title: task.projectName || '项目' },
          { title: '部门任务' },
          { title: task.name }
        ]}
      />

      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className={styles.backBtn}
          />
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{task.name}</h1>
            <Space>
              {getStatusTag(task.status)}
              {getPriorityTag(task.priority)}
            </Space>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Avatar.Group maxCount={3}>
              <Avatar icon={<UserOutlined />} />
            </Avatar.Group>
            <span className={styles.leaderName}>{task.managerName}</span>
          </Space>
        </div>
      </div>

      {/* 标签页内容 */}
      <Card className={styles.mainCard}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  )
}

export default DepartmentTaskDetail