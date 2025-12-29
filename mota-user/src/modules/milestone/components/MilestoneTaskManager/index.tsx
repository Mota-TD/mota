/**
 * 里程碑任务管理器
 * 管理里程碑与任务的关联关系，支持智能分解和进度同步
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Button,
  Progress,
  Tag,
  Timeline,
  Statistic,
  Row,
  Col,
  Space,
  Modal,
  Table,
  Alert,
  Tooltip,
  Dropdown,
  message,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  RobotOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  SyncOutlined,
  BulbOutlined,
  ApartmentOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useMilestoneStore } from '../../store/milestoneStore'
import { useTaskStore } from '@/modules/task/store/taskStore'
import { useProjectStore } from '@/modules/project/store/projectStore'
import { claudeClient } from '@/services/claude/claudeClient'
import TaskDecomposeWizard from '@/modules/task/components/TaskDecomposeWizard'
import type { Milestone, MilestoneTask } from '../../types'
import type { Task } from '@/modules/task/types'
import styles from './index.module.css'

interface MilestoneTaskManagerProps {
  milestoneId: string
  milestone?: Milestone
  className?: string
  style?: React.CSSProperties
}

interface TaskProgress {
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
  progress: number
}

interface DepartmentProgress {
  department: string
  tasks: MilestoneTask[]
  progress: TaskProgress
  estimatedDays: number
  actualDays: number
  status: 'on-track' | 'at-risk' | 'delayed'
}

const MilestoneTaskManager: React.FC<MilestoneTaskManagerProps> = ({
  milestoneId,
  milestone,
  className,
  style,
}) => {
  // 状态管理
  const [showDecomposeWizard, setShowDecomposeWizard] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)
  const [departmentProgress, setDepartmentProgress] = useState<DepartmentProgress[]>([])
  
  // Store hooks
  const {
    currentMilestone,
    tasks: milestoneTasks,
    fetchMilestoneDetail,
    fetchTasks,
    updateTask,
    deleteTask,
  } = useMilestoneStore()

  const {
    departmentTasks,
    tasks: executionTasks,
    fetchTasksByMilestone,
    updateTaskProgress,
  } = useTaskStore()

  const { currentProject } = useProjectStore()

  // 当前里程碑
  const currentMilestoneData = milestone || currentMilestone

  // 加载数据
  useEffect(() => {
    if (milestoneId) {
      fetchMilestoneDetail(milestoneId)
      fetchTasks(milestoneId)
      fetchTasksByMilestone(milestoneId)
    }
  }, [milestoneId])

  // 计算部门进度
  useEffect(() => {
    if (departmentTasks.length > 0 && currentProject) {
      const progress = calculateDepartmentProgress(departmentTasks, executionTasks)
      setDepartmentProgress(progress)
    }
  }, [departmentTasks, executionTasks, currentProject])

  // 计算部门进度
  const calculateDepartmentProgress = useCallback((
    deptTasks: Task[],
    execTasks: Task[]
  ): DepartmentProgress[] => {
    const departments = currentProject?.departments || []
    
    return departments.map(department => {
      const deptTasksForDept = deptTasks.filter(t => t.department === department)
      const execTasksForDept = execTasks.filter(t => 
        deptTasksForDept.some(dt => dt.id === t.departmentTaskId)
      )

      // 计算任务进度
      const total = execTasksForDept.length
      const completed = execTasksForDept.filter(t => t.status === 'completed').length
      const inProgress = execTasksForDept.filter(t => t.status === 'in_progress').length
      const pending = execTasksForDept.filter(t => t.status === 'pending').length
      
      // 计算逾期任务
      const now = new Date()
      const overdue = execTasksForDept.filter(t => 
        t.endDate && new Date(t.endDate) < now && t.status !== 'completed'
      ).length

      const progress = total > 0 ? Math.round((completed / total) * 100) : 0

      // 估算工期
      const estimatedDays = deptTasksForDept.reduce((sum, t) => sum + (t.estimatedDays || 0), 0)
      const actualDays = Math.max(...deptTasksForDept.map(t => {
        if (t.createdAt) {
          return Math.ceil((now.getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        }
        return 0
      }), 0)

      // 判断状态
      let status: DepartmentProgress['status'] = 'on-track'
      if (overdue > 0) {
        status = 'delayed'
      } else if (progress < 50 && actualDays > estimatedDays * 0.6) {
        status = 'at-risk'
      }

      return {
        department,
        tasks: deptTasksForDept as MilestoneTask[],
        progress: {
          total,
          completed,
          inProgress,
          pending,
          overdue,
          progress,
        },
        estimatedDays,
        actualDays,
        status,
      }
    }).filter(dp => dp.tasks.length > 0)
  }, [currentProject])

  // AI智能分析
  const handleAIAnalysis = async () => {
    if (!currentMilestoneData || !currentProject) return

    setLoading(true)
    try {
      const analysisResult = await claudeClient.generateRiskWarnings({
        projectId: currentProject.id,
        projectName: currentProject.name,
        departmentTasks: departmentTasks.map(t => ({
          name: t.name,
          status: t.status,
          progress: t.progress || 0,
          endDate: t.endDate,
        })),
        tasks: executionTasks.map(t => ({
          name: t.name,
          status: t.status,
          progress: t.progress || 0,
          endDate: t.endDate,
        })),
      })

      setAiAnalysisResult(analysisResult)
      message.success('AI分析完成')
    } catch (error) {
      console.error('AI分析失败:', error)
      message.error('AI分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 同步任务进度
  const handleSyncProgress = async () => {
    setLoading(true)
    try {
      // 重新计算所有任务进度并同步
      for (const deptProgress of departmentProgress) {
        for (const task of deptProgress.tasks) {
          // 更新任务进度到里程碑
          await updateTaskProgress(task.id, deptProgress.progress.progress)
        }
      }
      
      // 重新加载数据
      await fetchTasks(milestoneId)
      message.success('进度同步完成')
    } catch (error) {
      console.error('进度同步失败:', error)
      message.error('进度同步失败')
    } finally {
      setLoading(false)
    }
  }

  // 渲染概览卡片
  const renderOverviewCard = () => {
    const totalTasks = departmentProgress.reduce((sum, dp) => sum + dp.progress.total, 0)
    const completedTasks = departmentProgress.reduce((sum, dp) => sum + dp.progress.completed, 0)
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const delayedDepartments = departmentProgress.filter(dp => dp.status === 'delayed').length
    const atRiskDepartments = departmentProgress.filter(dp => dp.status === 'at-risk').length

    return (
      <Card title="里程碑概览" className={styles.overviewCard}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总体进度"
              value={overallProgress}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={overallProgress} size="small" />
          </Col>
          <Col span={6}>
            <Statistic
              title="任务总数"
              value={totalTasks}
              prefix={<ApartmentOutlined />}
            />
            <div className={styles.taskBreakdown}>
              <span>已完成: {completedTasks}</span>
            </div>
          </Col>
          <Col span={6}>
            <Statistic
              title="风险部门"
              value={atRiskDepartments}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="延期部门"
              value={delayedDepartments}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
      </Card>
    )
  }

  // 渲染部门进度卡片
  const renderDepartmentProgress = () => (
    <Card 
      title="部门进度跟踪" 
      className={styles.departmentCard}
      extra={
        <Space>
          <Button
            icon={<SyncOutlined />}
            loading={loading}
            onClick={handleSyncProgress}
          >
            同步进度
          </Button>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={loading}
            onClick={handleAIAnalysis}
          >
            AI分析
          </Button>
        </Space>
      }
    >
      {departmentProgress.length === 0 ? (
        <Empty description="暂无部门任务" />
      ) : (
        <div className={styles.departmentList}>
          {departmentProgress.map((deptProgress) => (
            <div key={deptProgress.department} className={styles.departmentItem}>
              <div className={styles.departmentHeader}>
                <div className={styles.departmentInfo}>
                  <h4>{deptProgress.department}</h4>
                  <Tag color={getStatusColor(deptProgress.status)}>
                    {getStatusText(deptProgress.status)}
                  </Tag>
                </div>
                <div className={styles.departmentStats}>
                  <span>{deptProgress.progress.completed}/{deptProgress.progress.total} 任务</span>
                </div>
              </div>
              
              <Progress 
                percent={deptProgress.progress.progress}
                status={deptProgress.status === 'delayed' ? 'exception' : 'active'}
                size="small"
              />
              
              <div className={styles.departmentMeta}>
                <span>预计: {deptProgress.estimatedDays}天</span>
                <span>实际: {deptProgress.actualDays}天</span>
                {deptProgress.progress.overdue > 0 && (
                  <span style={{ color: '#ff4d4f' }}>
                    逾期: {deptProgress.progress.overdue}个
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )

  // 渲染AI分析结果
  const renderAIAnalysis = () => {
    if (!aiAnalysisResult || aiAnalysisResult.length === 0) return null

    return (
      <Card title="AI风险分析" className={styles.analysisCard}>
        <Timeline>
          {aiAnalysisResult.map((risk: any, index: number) => (
            <Timeline.Item
              key={risk.id || index}
              color={getRiskColor(risk.severity)}
              dot={getRiskIcon(risk.type)}
            >
              <div className={styles.riskItem}>
                <div className={styles.riskHeader}>
                  <h4>{risk.title}</h4>
                  <Tag color={getRiskColor(risk.severity)}>
                    {getRiskSeverityText(risk.severity)}
                  </Tag>
                </div>
                <p>{risk.description}</p>
                {risk.affectedTasks?.length > 0 && (
                  <div className={styles.affectedTasks}>
                    <strong>影响任务:</strong>
                    {risk.affectedTasks.map((taskName: string, idx: number) => (
                      <Tag key={idx} size="small">{taskName}</Tag>
                    ))}
                  </div>
                )}
                {risk.suggestions?.length > 0 && (
                  <div className={styles.suggestions}>
                    <strong>建议措施:</strong>
                    <ul>
                      {risk.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    )
  }

  // 工具函数
  const getStatusColor = (status: DepartmentProgress['status']) => {
    switch (status) {
      case 'on-track': return 'green'
      case 'at-risk': return 'orange'
      case 'delayed': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: DepartmentProgress['status']) => {
    switch (status) {
      case 'on-track': return '按计划进行'
      case 'at-risk': return '存在风险'
      case 'delayed': return '进度延期'
      default: return '未知状态'
    }
  }

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'green'
      case 'medium': return 'orange'
      case 'high': return 'red'
      case 'critical': return 'red'
      default: return 'blue'
    }
  }

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'delay': return <ClockCircleOutlined />
      case 'resource': return <TeamOutlined />
      case 'dependency': return <ApartmentOutlined />
      case 'quality': return <ExclamationCircleOutlined />
      default: return <ExclamationCircleOutlined />
    }
  }

  const getRiskSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return '低风险'
      case 'medium': return '中等风险'
      case 'high': return '高风险'
      case 'critical': return '严重风险'
      default: return '未知'
    }
  }

  return (
    <div className={`${styles.container} ${className || ''}`} style={style}>
      {/* 操作栏 */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h3>里程碑任务管理</h3>
          {currentMilestoneData && (
            <span className={styles.milestoneName}>{currentMilestoneData.name}</span>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <Button
            type="primary"
            icon={<BulbOutlined />}
            onClick={() => setShowDecomposeWizard(true)}
          >
            智能分解任务
          </Button>
        </div>
      </div>

      {/* 概览卡片 */}
      {renderOverviewCard()}

      <Row gutter={16} style={{ marginTop: 16 }}>
        {/* 部门进度 */}
        <Col span={16}>
          {renderDepartmentProgress()}
        </Col>

        {/* AI分析 */}
        <Col span={8}>
          {renderAIAnalysis()}
        </Col>
      </Row>

      {/* 任务分解向导 */}
      {showDecomposeWizard && (
        <TaskDecomposeWizard
          milestoneId={milestoneId}
          milestone={currentMilestoneData}
          visible={showDecomposeWizard}
          onClose={() => setShowDecomposeWizard(false)}
          onSuccess={() => {
            setShowDecomposeWizard(false)
            fetchTasks(milestoneId)
            fetchTasksByMilestone(milestoneId)
          }}
        />
      )}
    </div>
  )
}

export default MilestoneTaskManager