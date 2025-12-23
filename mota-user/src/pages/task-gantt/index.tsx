import { useState, useEffect } from 'react'
import { Card, Typography, Select, Space, Tag, Progress, Empty, Spin, Tooltip, Avatar } from 'antd'
import {
  BugOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  StarOutlined
} from '@ant-design/icons'
import * as issueApi from '@/services/api/issue'
import styles from './index.module.css'

const { Title, Text } = Typography

interface Task {
  id: number
  key: string
  title: string
  type: string
  status: string
  priority: string
  assigneeName?: string
  startDate?: string
  endDate?: string
  progress?: number
}

/**
 * 任务甘特图页面
 * 以时间线形式展示任务进度
 */
const TaskGantt = () => {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('month')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const res = await issueApi.getIssues()
      // 添加模拟的日期数据
      const tasksWithDates = (res.list || []).map((t: any, index: number) => ({
        id: t.id,
        key: t.key || `TASK-${t.id}`,
        title: t.title,
        type: t.type,
        status: t.status,
        priority: t.priority,
        assigneeName: t.assigneeName || '未分配',
        startDate: `2024-01-${String((index % 20) + 1).padStart(2, '0')}`,
        endDate: `2024-01-${String((index % 20) + 10).padStart(2, '0')}`,
        progress: t.status === 'done' ? 100 : t.status === 'in_progress' ? 50 : 0,
      }))
      setTasks(tasksWithDates)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: '#faad14',
      in_progress: '#1677ff',
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

  // 生成日期列表（一个月的天数）
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // 计算任务在甘特图中的位置和宽度
  const calculateBarStyle = (task: Task) => {
    const startDay = task.startDate ? parseInt(task.startDate.split('-')[2]) : 1
    const endDay = task.endDate ? parseInt(task.endDate.split('-')[2]) : 31
    const left = ((startDay - 1) / 31) * 100
    const width = ((endDay - startDay + 1) / 31) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  const projectOptions = [
    { value: 'all', label: '全部项目' },
    { value: '1', label: '摩塔项目管理系统' },
    { value: '2', label: '企业官网重构' },
    { value: '3', label: '移动端App开发' },
  ]

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={4} style={{ margin: 0 }}>任务甘特图</Title>
          <Text type="secondary">以时间线形式查看任务进度</Text>
        </div>
        <div className={styles.headerRight}>
          <Space>
            <Select
              value={projectFilter}
              onChange={setProjectFilter}
              options={projectOptions}
              style={{ width: 180 }}
              placeholder="选择项目"
            />
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 120 }}
              options={[
                { value: 'week', label: '按周查看' },
                { value: 'month', label: '按月查看' },
                { value: 'quarter', label: '按季度查看' },
              ]}
            />
          </Space>
        </div>
      </div>

      <Card className={styles.ganttCard}>
        {tasks.length === 0 ? (
          <Empty description="暂无任务" />
        ) : (
          <div className={styles.ganttContainer}>
            {/* 时间轴头部 */}
            <div className={styles.ganttHeader}>
              <div className={styles.taskColumn}>
                <Text strong>任务名称</Text>
              </div>
              <div className={styles.timelineHeader}>
                {days.map((day) => (
                  <div key={day} className={styles.dayCell}>
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* 任务行 */}
            <div className={styles.ganttBody}>
              {tasks.slice(0, 15).map((task) => (
                <div key={task.id} className={styles.ganttRow}>
                  <div className={styles.taskColumn}>
                    <div className={styles.taskInfo}>
                      {getTypeIcon(task.type)}
                      <div className={styles.taskMeta}>
                        <Text strong className={styles.taskTitle}>{task.title}</Text>
                        <div className={styles.taskSubInfo}>
                          <Text type="secondary" className={styles.taskKey}>{task.key}</Text>
                          <Tag color={getPriorityColor(task.priority)} style={{ fontSize: 10 }}>
                            {task.priority}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.timelineCell}>
                    <div className={styles.gridLines}>
                      {days.map((day) => (
                        <div key={day} className={styles.gridLine} />
                      ))}
                    </div>
                    <Tooltip
                      title={
                        <div>
                          <div>{task.title}</div>
                          <div>进度: {task.progress || 0}%</div>
                          <div>负责人: {task.assigneeName}</div>
                        </div>
                      }
                    >
                      <div
                        className={styles.ganttBar}
                        style={{
                          ...calculateBarStyle(task),
                          backgroundColor: getStatusColor(task.status),
                        }}
                      >
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                        <span className={styles.barLabel}>{task.progress || 0}%</span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 图例 */}
      <div className={styles.legend}>
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

export default TaskGantt