import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import {
  Button,
  Tag,
  Progress,
  Avatar,
  Space,
  Spin,
  message,
  Dropdown,
  Modal,
  Drawer,
  Form,
  Input,
  Slider,
  Tabs
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FileTextOutlined,
  CommentOutlined,
  PaperClipOutlined,
  HistoryOutlined,
  FileAddOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined,
  SubnodeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { taskApi, departmentTaskApi, projectApi } from '@/services/api'
import type { Task, TaskStatus } from '@/services/api/task'
import type { DepartmentTask } from '@/services/api/departmentTask'
import { getUsers } from '@/services/api/user'
import TaskComments from '@/components/TaskComments'
import DeliverableList from '@/components/DeliverableList'
import TaskTemplateSelector from '@/components/TaskTemplateSelector'
import SubtaskList from '@/components/SubtaskList'
import ChecklistPanel from '@/components/ChecklistPanel'
import styles from './index.module.css'

const { TextArea } = Input

/**
 * 执行任务详情页面 - V3.0
 * 集成TaskComments、DeliverableList、SubtaskList和ChecklistPanel组件
 */
const TaskDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)
  const [departmentTask, setDepartmentTask] = useState<DepartmentTask | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [projectMembers, setProjectMembers] = useState<Array<{ id: number; name: string; avatar?: string }>>([])
  const [activeTab, setActiveTab] = useState('subtasks')
  
  // 从用户上下文获取当前用户ID
  const currentUserId = useMemo(() => user?.id || 0, [user])
  
  // 更新进度抽屉
  const [updateProgressDrawerVisible, setUpdateProgressDrawerVisible] = useState(false)
  const [updateProgressLoading, setUpdateProgressLoading] = useState(false)
  const [progressForm] = Form.useForm()
  
  // 任务模板选择器
  const [templateSelectorVisible, setTemplateSelectorVisible] = useState(false)

  useEffect(() => {
    if (id) {
      loadData(parseInt(id))
    }
  }, [id])

  const loadData = async (taskId: number) => {
    setLoading(true)
    try {
      const [taskRes, usersRes] = await Promise.all([
        taskApi.getTaskById(taskId),
        getUsers().catch(() => ({ list: [] }))
      ])
      
      setTask(taskRes)
      setUsers((usersRes as any).list || [])
      
      // 加载部门任务信息
      if (taskRes.departmentTaskId) {
        try {
          const deptTaskRes = await departmentTaskApi.getDepartmentTaskById(taskRes.departmentTaskId)
          setDepartmentTask(deptTaskRes)
          
          // 加载项目成员用于@提及功能
          if (deptTaskRes.projectId) {
            try {
              const members = await projectApi.getProjectMembers(deptTaskRes.projectId)
              setProjectMembers(members.map((m: any) => ({
                id: m.userId || m.id,
                name: m.userName || m.name,
                avatar: m.userAvatar || m.avatar
              })))
            } catch (e) {
              console.warn('Failed to load project members:', e)
            }
          }
        } catch {
          // 忽略错误
        }
      }
    } catch (error) {
      console.error('Failed to load task:', error)
      message.error('加载任务失败')
      // 使用模拟数据
      setTask({
        id: String(taskId),
        departmentTaskId: '1',
        projectId: '1',
        name: '市场调研报告撰写',
        description: '完成Q1季度市场调研报告，包括竞品分析、用户画像、市场趋势等内容',
        assigneeId: '1',
        status: 'in_progress' as TaskStatus,
        priority: 'high' as any,
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        progress: 60,
        progressNote: '已完成竞品分析部分，正在进行用户画像分析',
        sortOrder: 1
      })
      setDepartmentTask({
        id: '1',
        projectId: '1',
        departmentId: '1',
        managerId: '1',
        name: '市场推广方案制定',
        status: 'in_progress' as any,
        priority: 'high' as any,
        progress: 45,
        requirePlan: true,
        requireApproval: true
      })
    } finally {
      setLoading(false)
    }
  }

  const getTaskStatusTag = (status: TaskStatus) => {
    return <Tag color={taskApi.getStatusColor(status)}>{taskApi.getStatusText(status)}</Tag>
  }

  const getPriorityTag = (priority: string) => {
    const config: Record<string, { color: string; text: string }> = {
      low: { color: 'green', text: '低' },
      medium: { color: 'blue', text: '中' },
      high: { color: 'orange', text: '高' },
      urgent: { color: 'red', text: '紧急' }
    }
    return <Tag color={config[priority]?.color}>{config[priority]?.text}</Tag>
  }

  // 更新进度
  const handleUpdateProgress = async (values: any) => {
    if (!task) return
    
    setUpdateProgressLoading(true)
    try {
      await taskApi.updateTaskProgress(task.id, values.progress, values.note)
      message.success('进度更新成功')
      setUpdateProgressDrawerVisible(false)
      progressForm.resetFields()
      loadData(parseInt(id!))
    } catch (error) {
      console.error('Update progress error:', error)
      message.error('更新失败，请重试')
    } finally {
      setUpdateProgressLoading(false)
    }
  }

  // 完成任务
  const handleCompleteTask = async () => {
    if (!task) return
    
    Modal.confirm({
      title: '确认完成',
      content: '确认将此任务标记为已完成吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await taskApi.completeTask(task.id)
          message.success('任务已完成')
          loadData(parseInt(id!))
        } catch {
          message.error('操作失败')
        }
      }
    })
  }

  // 删除任务
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确认删除此任务吗？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await taskApi.deleteTask(parseInt(id!))
          message.success('任务已删除')
          navigate(-1)
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  // 子任务进度变化回调
  const handleSubtaskProgressChange = (progress: number) => {
    console.log('Subtask progress changed:', progress)
    // 可以在这里更新任务进度
  }

  // 检查清单进度变化回调
  const handleChecklistProgressChange = (progress: number) => {
    console.log('Checklist progress changed:', progress)
    // 可以在这里更新任务进度
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h2>任务不存在</h2>
          <Button type="primary" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  const assignee = users.find(u => u.id === task.assigneeId)

  // 模拟进度记录数据
  const progressHistory = [
    {
      id: 1,
      progress: 60,
      note: '已完成竞品分析部分',
      createdAt: '2024-01-15 14:30'
    },
    {
      id: 2,
      progress: 30,
      note: '开始数据收集',
      createdAt: '2024-01-12 10:00'
    },
    {
      id: 3,
      progress: 0,
      note: '任务开始',
      createdAt: '2024-01-10 09:00'
    }
  ]

  return (
    <div className={styles.container}>
      {/* 任务头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
          />
          <div className={styles.taskIcon}>
            <CheckCircleOutlined />
          </div>
          <div className={styles.taskInfo}>
            <div className={styles.taskTitle}>
              <h1 className={styles.taskName}>{task.name}</h1>
              {getTaskStatusTag(task.status)}
              {getPriorityTag(task.priority)}
            </div>
            <p className={styles.taskDesc}>{task.description || '暂无描述'}</p>
            <div className={styles.taskMeta}>
              <span>
                <UserOutlined /> 
                {assignee ? (
                  <Space>
                    <Avatar size="small" src={assignee.avatar}>{assignee.name?.charAt(0)}</Avatar>
                    {assignee.name}
                  </Space>
                ) : '未分配'}
              </span>
              <span><CalendarOutlined /> {task.startDate} ~ {task.endDate}</span>
              {departmentTask && (
                <span>
                  <FileTextOutlined /> 
                  <a onClick={() => navigate(`/department-tasks/${departmentTask.id}`)}>
                    {departmentTask.name}
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>
        <Space>
          {task.status !== 'completed' && (
            <>
              <Button 
                icon={<RiseOutlined />}
                onClick={() => {
                  progressForm.setFieldValue('progress', task.progress)
                  setUpdateProgressDrawerVisible(true)
                }}
              >
                更新进度
              </Button>
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleCompleteTask}
              >
                完成任务
              </Button>
            </>
          )}
          <Button icon={<EditOutlined />}>
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'pause', label: '暂停任务' },
                { type: 'divider' },
                { key: 'delete', label: '删除任务', danger: true, onClick: handleDelete }
              ]
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* 主内容区 */}
      <div className={styles.contentGrid}>
        <div className={styles.mainContent}>
          {/* 进度卡片 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>任务进度</h3>
            </div>
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>当前进度</span>
                <span className={styles.progressValue}>{task.progress}%</span>
              </div>
              <Progress
                percent={task.progress}
                showInfo={false}
                strokeColor={{
                  '0%': '#52c41a',
                  '100%': '#73d13d',
                }}
                size={{ height: 12 }}
              />
              {task.progressNote && (
                <p style={{ marginTop: 12, color: '#666', fontSize: 14 }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {task.progressNote}
                </p>
              )}
            </div>
          </div>

          {/* Tabs: 子任务、检查清单、讨论、交付物、进度记录 */}
          <div className={styles.card}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'subtasks',
                  label: (
                    <span>
                      <SubnodeOutlined /> 子任务
                    </span>
                  ),
                  children: (
                    <SubtaskList
                      taskId={Number(task.id)}
                      projectId={departmentTask?.projectId ? Number(departmentTask.projectId) : undefined}
                      editable={task.status !== 'completed'}
                      onProgressChange={handleSubtaskProgressChange}
                    />
                  )
                },
                {
                  key: 'checklist',
                  label: (
                    <span>
                      <CheckSquareOutlined /> 检查清单
                    </span>
                  ),
                  children: (
                    <ChecklistPanel
                      taskId={Number(task.id)}
                      editable={task.status !== 'completed'}
                      onProgressChange={handleChecklistProgressChange}
                    />
                  )
                },
                {
                  key: 'comments',
                  label: (
                    <span>
                      <CommentOutlined /> 讨论
                    </span>
                  ),
                  children: (
                    <TaskComments
                      taskId={Number(task.id)}
                      currentUserId={currentUserId}
                      projectMembers={projectMembers}
                    />
                  )
                },
                {
                  key: 'deliverables',
                  label: (
                    <span>
                      <PaperClipOutlined /> 交付物
                    </span>
                  ),
                  children: (
                    <DeliverableList taskId={Number(task.id)} editable={true} />
                  )
                },
                {
                  key: 'history',
                  label: (
                    <span>
                      <HistoryOutlined /> 进度记录
                    </span>
                  ),
                  children: (
                    <div className={styles.timeline}>
                      {progressHistory.map((item) => (
                        <div key={item.id} className={styles.timelineItem}>
                          <div className={styles.timelineDot} />
                          <div className={styles.timelineContent}>
                            <div className={styles.timelineTitle}>
                              进度更新至 {item.progress}%
                            </div>
                            <div className={styles.timelineTime}>
                              {item.createdAt} - {item.note}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className={styles.sideContent}>
          {/* 任务详情 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>任务详情</h3>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>状态</span>
                <span className={styles.infoValue}>{getTaskStatusTag(task.status)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>优先级</span>
                <span className={styles.infoValue}>{getPriorityTag(task.priority)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>执行人</span>
                <span className={styles.infoValue}>
                  {assignee ? (
                    <Space>
                      <Avatar size="small" src={assignee.avatar}>{assignee.name?.charAt(0)}</Avatar>
                      {assignee.name}
                    </Space>
                  ) : '未分配'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>开始日期</span>
                <span className={styles.infoValue}>{task.startDate || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>截止日期</span>
                <span className={styles.infoValue}>{task.endDate || '-'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>所属部门任务</span>
                <span className={styles.infoValue}>
                  {departmentTask ? (
                    <a onClick={() => navigate(`/department-tasks/${departmentTask.id}`)}>
                      {departmentTask.name}
                    </a>
                  ) : '-'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>创建时间</span>
                <span className={styles.infoValue}>{task.createdAt ? dayjs(task.createdAt).format('YYYY-MM-DD HH:mm') : '-'}</span>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>快捷操作</h3>
            </div>
            <div className={styles.quickActions}>
              <Button
                block
                icon={<RiseOutlined />}
                onClick={() => {
                  progressForm.setFieldValue('progress', task.progress)
                  setUpdateProgressDrawerVisible(true)
                }}
                disabled={task.status === 'completed'}
              >
                更新进度
              </Button>
              <Button
                block
                icon={<SubnodeOutlined />}
                onClick={() => setActiveTab('subtasks')}
              >
                管理子任务
              </Button>
              <Button
                block
                icon={<CheckSquareOutlined />}
                onClick={() => setActiveTab('checklist')}
              >
                管理检查清单
              </Button>
              <Button
                block
                icon={<PaperClipOutlined />}
                onClick={() => setActiveTab('deliverables')}
              >
                上传交付物
              </Button>
              <Button
                block
                icon={<CommentOutlined />}
                onClick={() => setActiveTab('comments')}
              >
                添加评论
              </Button>
              <Button
                block
                icon={<FileAddOutlined />}
                onClick={() => setTemplateSelectorVisible(true)}
              >
                从模板创建子任务
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 更新进度抽屉 */}
      <Drawer
        title="更新任务进度"
        placement="right"
        width={500}
        onClose={() => setUpdateProgressDrawerVisible(false)}
        open={updateProgressDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setUpdateProgressDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={updateProgressLoading} onClick={() => progressForm.submit()}>
              更新
            </Button>
          </div>
        }
      >
        <Form
          form={progressForm}
          layout="vertical"
          onFinish={handleUpdateProgress}
        >
          <Form.Item
            name="progress"
            label="当前进度"
            rules={[{ required: true, message: '请设置进度' }]}
          >
            <Slider 
              marks={{
                0: '0%',
                25: '25%',
                50: '50%',
                75: '75%',
                100: '100%'
              }}
            />
          </Form.Item>

          <Form.Item
            name="note"
            label="进度说明"
          >
            <TextArea rows={4} placeholder="请输入进度说明（可选）" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 任务模板选择器 */}
      <TaskTemplateSelector
        visible={templateSelectorVisible}
        projectId={departmentTask?.projectId ? Number(departmentTask.projectId) : 0}
        onSelect={(taskId) => {
          setTemplateSelectorVisible(false)
          message.success('子任务创建成功')
          navigate(`/tasks/${taskId}`)
        }}
        onCancel={() => setTemplateSelectorVisible(false)}
      />
    </div>
  )
}

export default TaskDetail