import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  Button,
  Space,
  Tag,
  Progress,
  List,
  Typography,
  Spin,
  Empty,
  Badge,
  Collapse,
  message,
  Select
} from 'antd'
import {
  RobotOutlined,
  BulbOutlined,
  WarningOutlined,
  RiseOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as aiApi from '@/services/api/ai'
import { departmentTaskApi, taskApi } from '@/services/api'
import type { DepartmentTask } from '@/services/api/departmentTask'
import type { Task } from '@/services/api/task'
import styles from './index.module.css'

const { Text, Paragraph } = Typography

interface AIProjectAssistantProps {
  projectId: number | string
  projectName: string
  projectDescription?: string
  departments?: Array<{ id: number; name: string }>
  departmentTasks?: DepartmentTask[]
  tasks?: Task[]
}

/**
 * AI 项目助手组件
 * 提供 AI 驱动的项目管理功能
 */
const AIProjectAssistant: React.FC<AIProjectAssistantProps> = ({
  projectId,
  projectName,
  projectDescription,
  departments = [],
  departmentTasks: propDeptTasks,
  tasks: propTasks
}) => {
  const [loading, setLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  
  // 项目数据
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>(propDeptTasks || [])
  const [tasks, setTasks] = useState<Task[]>(propTasks || [])
  
  // AI 功能数据
  const [taskSuggestions, setTaskSuggestions] = useState<aiApi.TaskDecompositionSuggestion[]>([])
  const [progressPrediction, setProgressPrediction] = useState<aiApi.ProgressPrediction | null>(null)
  const [riskWarnings, setRiskWarnings] = useState<aiApi.RiskWarning[]>([])
  const [projectReport, setProjectReport] = useState<aiApi.ProjectReport | null>(null)

  // 加载项目数据
  useEffect(() => {
    if (!propDeptTasks || !propTasks) {
      loadProjectData()
    }
  }, [projectId])

  const loadProjectData = async () => {
    try {
      const [deptTasksRes, tasksRes] = await Promise.all([
        departmentTaskApi.getDepartmentTasksByProjectId(projectId).catch(() => []),
        taskApi.getTasksByProjectId(projectId).catch(() => [])
      ])
      setDepartmentTasks(deptTasksRes || [])
      setTasks(tasksRes || [])
    } catch (error) {
      console.error('Load project data error:', error)
    }
  }

  // 计算项目统计数据
  const projectStats = useMemo(() => {
    const totalDeptTasks = departmentTasks.length
    const completedDeptTasks = departmentTasks.filter(t => t.status === 'completed').length
    const inProgressDeptTasks = departmentTasks.filter(t => t.status === 'in_progress').length
    const pendingDeptTasks = departmentTasks.filter(t => t.status === 'pending').length
    
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
    
    // 计算逾期任务
    const today = dayjs()
    const overdueDeptTasks = departmentTasks.filter(t =>
      t.endDate && dayjs(t.endDate).isBefore(today) && t.status !== 'completed'
    )
    const overdueTasks = tasks.filter(t =>
      t.endDate && dayjs(t.endDate).isBefore(today) && t.status !== 'completed'
    )
    
    // 计算整体进度
    const overallProgress = totalDeptTasks > 0
      ? Math.round(departmentTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalDeptTasks)
      : 0
    
    return {
      totalDeptTasks,
      completedDeptTasks,
      inProgressDeptTasks,
      pendingDeptTasks,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueDeptTasks,
      overdueTasks,
      overallProgress
    }
  }, [departmentTasks, tasks])

  // AI 任务分解
  const handleTaskDecomposition = async () => {
    setLoading(true)
    setActiveFeature('decompose')
    try {
      const result = await aiApi.generateTaskDecomposition({
        projectName,
        projectDescription: projectDescription || '',
        departments: departments.map(d => d.name)
      })
      setTaskSuggestions(result.suggestions)
      message.success('AI 任务分解建议已生成')
    } catch (error) {
      console.error('Task decomposition error:', error)
      // 使用模拟数据
      setTaskSuggestions([
        {
          id: '1',
          name: '市场调研与分析',
          description: '进行目标市场调研，分析竞品和用户需求',
          suggestedDepartment: '市场部',
          suggestedPriority: 'high',
          estimatedDays: 14
        },
        {
          id: '2',
          name: '产品方案设计',
          description: '根据调研结果设计产品方案和功能规划',
          suggestedDepartment: '产品部',
          suggestedPriority: 'high',
          estimatedDays: 10,
          dependencies: ['1']
        },
        {
          id: '3',
          name: '技术架构设计',
          description: '设计系统技术架构和技术选型',
          suggestedDepartment: '技术部',
          suggestedPriority: 'medium',
          estimatedDays: 7,
          dependencies: ['2']
        },
        {
          id: '4',
          name: '运营推广计划',
          description: '制定产品上线后的运营推广计划',
          suggestedDepartment: '运营部',
          suggestedPriority: 'medium',
          estimatedDays: 7,
          dependencies: ['1']
        }
      ])
      message.info('已生成模拟的任务分解建议')
    } finally {
      setLoading(false)
    }
  }

  // AI 进度预测 - 基于实际数据进行智能分析
  const handleProgressPrediction = async () => {
    setLoading(true)
    setActiveFeature('predict')
    try {
      const result = await aiApi.predictProjectProgress(projectId)
      setProgressPrediction(result)
      message.success('AI 进度预测已完成')
    } catch (error) {
      console.error('Progress prediction error:', error)
      
      // 基于实际项目数据进行本地智能分析
      const { overallProgress, totalDeptTasks, overdueDeptTasks, overdueTasks } = projectStats
      
      // 计算预测进度（基于当前进度）
      const weeklyProgressRate = overallProgress > 0 ? Math.min(overallProgress / 4, 15) : 5 // 假设项目已进行4周
      const predictedProgress = Math.min(100, overallProgress + weeklyProgressRate)
      
      // 计算预计完成日期
      const remainingProgress = 100 - overallProgress
      const weeksToComplete = weeklyProgressRate > 0 ? Math.ceil(remainingProgress / weeklyProgressRate) : 12
      const predictedCompletionDate = dayjs().add(weeksToComplete, 'week').format('YYYY-MM-DD')
      
      // 计算置信度（基于数据完整性和逾期情况）
      let confidence = 0.85
      if (overdueDeptTasks.length > 0) confidence -= 0.1 * Math.min(overdueDeptTasks.length, 3)
      if (overdueTasks.length > 0) confidence -= 0.05 * Math.min(overdueTasks.length, 4)
      if (totalDeptTasks < 3) confidence -= 0.1 // 数据量不足
      confidence = Math.max(0.4, Math.min(0.95, confidence))
      
      // 生成影响因素分析
      const factors: string[] = []
      if (overallProgress >= 50) {
        factors.push('项目已完成过半，整体进展良好')
      } else if (overallProgress >= 25) {
        factors.push('项目处于中期阶段，需保持当前进度')
      } else {
        factors.push('项目处于初期阶段，建议加快推进')
      }
      
      if (overdueDeptTasks.length > 0) {
        factors.push(`有 ${overdueDeptTasks.length} 个部门任务已逾期，需重点关注`)
      } else {
        factors.push('所有部门任务均在计划时间内')
      }
      
      if (overdueTasks.length > 0) {
        factors.push(`有 ${overdueTasks.length} 个执行任务已逾期`)
      }
      
      // 分析各部门进度
      const deptProgress = departmentTasks.reduce((acc, t) => {
        const deptName = t.departmentName || '未分配部门'
        if (!acc[deptName]) {
          acc[deptName] = { total: 0, progress: 0 }
        }
        acc[deptName].total++
        acc[deptName].progress += t.progress || 0
        return acc
      }, {} as Record<string, { total: number; progress: number }>)
      
      Object.entries(deptProgress).forEach(([dept, data]) => {
        const avgProgress = data.total > 0 ? Math.round(data.progress / data.total) : 0
        if (avgProgress >= 70) {
          factors.push(`${dept}进展顺利（${avgProgress}%）`)
        } else if (avgProgress < 30 && data.total > 0) {
          factors.push(`${dept}进度较慢（${avgProgress}%），建议关注`)
        }
      })
      
      setProgressPrediction({
        projectId,
        currentProgress: overallProgress,
        predictedProgress: Math.round(predictedProgress),
        predictedCompletionDate,
        confidence,
        factors: factors.slice(0, 5) // 最多显示5个因素
      })
      message.success('AI 进度预测已完成（基于本地分析）')
    } finally {
      setLoading(false)
    }
  }

  // AI 风险预警 - 基于实际数据进行智能分析
  const handleRiskAnalysis = async () => {
    setLoading(true)
    setActiveFeature('risk')
    try {
      const result = await aiApi.getProjectRiskWarnings(projectId)
      setRiskWarnings(result)
      message.success('AI 风险分析已完成')
    } catch (error) {
      console.error('Risk analysis error:', error)
      
      // 基于实际项目数据进行本地风险分析
      const warnings: aiApi.RiskWarning[] = []
      const today = dayjs()
      
      // 1. 检查逾期的部门任务
      const overdueDeptTasks = departmentTasks.filter(t =>
        t.endDate && dayjs(t.endDate).isBefore(today) && t.status !== 'completed'
      )
      
      if (overdueDeptTasks.length > 0) {
        const severity = overdueDeptTasks.length >= 3 ? 'high' : overdueDeptTasks.length >= 2 ? 'medium' : 'low'
        warnings.push({
          id: 'delay-dept-' + Date.now(),
          type: 'delay',
          severity,
          title: `${overdueDeptTasks.length} 个部门任务已逾期`,
          description: `以下部门任务已超过截止日期但尚未完成，可能影响项目整体进度`,
          affectedTasks: overdueDeptTasks.map(t => t.name),
          suggestions: [
            '立即与相关部门负责人沟通了解延期原因',
            '评估是否需要调整资源分配',
            '考虑重新规划任务时间线',
            '必要时启动应急预案'
          ],
          createdAt: new Date().toISOString()
        })
      }
      
      // 2. 检查逾期的执行任务
      const overdueTasks = tasks.filter(t =>
        t.endDate && dayjs(t.endDate).isBefore(today) && t.status !== 'completed'
      )
      
      if (overdueTasks.length > 0) {
        const severity = overdueTasks.length >= 5 ? 'high' : overdueTasks.length >= 3 ? 'medium' : 'low'
        warnings.push({
          id: 'delay-task-' + Date.now(),
          type: 'delay',
          severity,
          title: `${overdueTasks.length} 个执行任务已逾期`,
          description: `多个执行任务已超过截止日期，需要及时处理`,
          affectedTasks: overdueTasks.slice(0, 5).map(t => t.name),
          suggestions: [
            '与任务执行人确认完成时间',
            '分析任务延期的根本原因',
            '考虑任务拆分或并行处理'
          ],
          createdAt: new Date().toISOString()
        })
      }
      
      // 3. 检查即将到期的任务（7天内）
      const upcomingDeptTasks = departmentTasks.filter(t => {
        if (!t.endDate || t.status === 'completed') return false
        const daysUntilDue = dayjs(t.endDate).diff(today, 'day')
        return daysUntilDue >= 0 && daysUntilDue <= 7 && (t.progress || 0) < 80
      })
      
      if (upcomingDeptTasks.length > 0) {
        warnings.push({
          id: 'upcoming-' + Date.now(),
          type: 'delay',
          severity: 'medium',
          title: `${upcomingDeptTasks.length} 个部门任务即将到期`,
          description: `以下任务将在7天内到期，但进度不足80%，存在延期风险`,
          affectedTasks: upcomingDeptTasks.map(t => `${t.name}（进度${t.progress || 0}%）`),
          suggestions: [
            '优先处理即将到期的任务',
            '评估是否需要加班或增加资源',
            '与相关人员确认能否按时完成'
          ],
          createdAt: new Date().toISOString()
        })
      }
      
      // 4. 检查进度异常的任务（进度过低）
      const lowProgressTasks = departmentTasks.filter(t => {
        if (t.status === 'completed' || t.status === 'pending') return false
        if (!t.startDate || !t.endDate) return false
        
        const totalDays = dayjs(t.endDate).diff(dayjs(t.startDate), 'day')
        const elapsedDays = today.diff(dayjs(t.startDate), 'day')
        const expectedProgress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0
        const actualProgress = t.progress || 0
        
        return expectedProgress > 30 && actualProgress < expectedProgress - 20
      })
      
      if (lowProgressTasks.length > 0) {
        warnings.push({
          id: 'progress-' + Date.now(),
          type: 'delay',
          severity: 'medium',
          title: `${lowProgressTasks.length} 个任务进度落后`,
          description: `以下任务的实际进度明显低于预期进度，需要关注`,
          affectedTasks: lowProgressTasks.map(t => t.name),
          suggestions: [
            '分析进度落后的原因',
            '考虑调整任务计划或增加资源',
            '加强进度跟踪和汇报频率'
          ],
          createdAt: new Date().toISOString()
        })
      }
      
      // 5. 检查资源分配问题（某部门任务过多）
      const deptTaskCount = departmentTasks.reduce((acc, t) => {
        const dept = t.departmentName || '未分配'
        acc[dept] = (acc[dept] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const overloadedDepts = Object.entries(deptTaskCount).filter(([_, count]) => count >= 5)
      if (overloadedDepts.length > 0) {
        warnings.push({
          id: 'resource-' + Date.now(),
          type: 'resource',
          severity: 'low',
          title: '部分部门任务负载较高',
          description: `以下部门承担的任务数量较多，可能存在资源紧张风险`,
          affectedTasks: overloadedDepts.map(([dept, count]) => `${dept}（${count}个任务）`),
          suggestions: [
            '评估各部门的实际工作负载',
            '考虑任务重新分配或外部支持',
            '优化任务优先级排序'
          ],
          createdAt: new Date().toISOString()
        })
      }
      
      // 如果没有发现风险，添加一个正面提示
      if (warnings.length === 0) {
        warnings.push({
          id: 'healthy-' + Date.now(),
          type: 'quality',
          severity: 'low',
          title: '项目状态良好',
          description: '当前未发现明显的风险问题，项目进展正常',
          affectedTasks: [],
          suggestions: [
            '继续保持当前的工作节奏',
            '定期进行风险评估',
            '关注潜在的变更需求'
          ],
          createdAt: new Date().toISOString()
        })
      }
      
      setRiskWarnings(warnings)
      message.success('AI 风险分析已完成（基于本地分析）')
    } finally {
      setLoading(false)
    }
  }

  // AI 生成报告 - 基于实际数据生成智能报告
  const handleGenerateReport = async () => {
    setLoading(true)
    setActiveFeature('report')
    try {
      const result = await aiApi.generateProjectReport(projectId, reportType)
      setProjectReport(result)
      message.success('AI 项目报告已生成')
    } catch (error) {
      console.error('Generate report error:', error)
      
      // 基于实际项目数据生成本地报告
      const {
        totalDeptTasks, completedDeptTasks, inProgressDeptTasks,
        totalTasks, completedTasks, inProgressTasks,
        overdueDeptTasks, overdueTasks, overallProgress
      } = projectStats
      
      // 生成报告摘要
      let summary = ''
      if (overallProgress >= 80) {
        summary = `项目进展顺利，整体完成度已达${overallProgress}%。`
      } else if (overallProgress >= 50) {
        summary = `项目处于中期阶段，整体完成度为${overallProgress}%。`
      } else if (overallProgress >= 25) {
        summary = `项目处于初期阶段，整体完成度为${overallProgress}%。`
      } else {
        summary = `项目刚刚启动，整体完成度为${overallProgress}%。`
      }
      
      summary += ` 共有${totalDeptTasks}个部门任务，其中${completedDeptTasks}个已完成，${inProgressDeptTasks}个进行中。`
      
      if (overdueDeptTasks.length > 0 || overdueTasks.length > 0) {
        summary += ` 需要关注${overdueDeptTasks.length}个逾期部门任务和${overdueTasks.length}个逾期执行任务。`
      }
      
      // 生成亮点
      const highlights: string[] = []
      if (completedDeptTasks > 0) {
        const recentCompleted = departmentTasks
          .filter(t => t.status === 'completed')
          .slice(0, 3)
          .map(t => t.name)
        highlights.push(`已完成部门任务：${recentCompleted.join('、')}`)
      }
      
      const highProgressTasks = departmentTasks
        .filter(t => (t.progress || 0) >= 80 && t.status !== 'completed')
        .slice(0, 2)
      if (highProgressTasks.length > 0) {
        highlights.push(`即将完成：${highProgressTasks.map(t => `${t.name}(${t.progress}%)`).join('、')}`)
      }
      
      if (overallProgress > 0) {
        highlights.push(`项目整体进度达到${overallProgress}%`)
      }
      
      if (highlights.length === 0) {
        highlights.push('项目正在有序推进中')
      }
      
      // 生成问题
      const issues: string[] = []
      if (overdueDeptTasks.length > 0) {
        issues.push(`${overdueDeptTasks.length}个部门任务已逾期：${overdueDeptTasks.slice(0, 2).map(t => t.name).join('、')}`)
      }
      if (overdueTasks.length > 0) {
        issues.push(`${overdueTasks.length}个执行任务已逾期`)
      }
      
      const lowProgressTasks = departmentTasks.filter(t =>
        t.status === 'in_progress' && (t.progress || 0) < 30
      )
      if (lowProgressTasks.length > 0) {
        issues.push(`${lowProgressTasks.length}个任务进度较慢，需要关注`)
      }
      
      if (issues.length === 0) {
        issues.push('暂无明显问题')
      }
      
      // 生成下一步计划
      const nextSteps: string[] = []
      const pendingTasks = departmentTasks.filter(t => t.status === 'pending').slice(0, 2)
      if (pendingTasks.length > 0) {
        nextSteps.push(`启动待分配任务：${pendingTasks.map(t => t.name).join('、')}`)
      }
      
      const inProgressHighPriority = departmentTasks
        .filter(t => t.status === 'in_progress' && t.priority === 'high')
        .slice(0, 2)
      if (inProgressHighPriority.length > 0) {
        nextSteps.push(`重点推进：${inProgressHighPriority.map(t => t.name).join('、')}`)
      }
      
      if (overdueDeptTasks.length > 0) {
        nextSteps.push('处理逾期任务，制定追赶计划')
      }
      
      nextSteps.push('持续跟踪各部门任务进度')
      
      // 计算进度变化（模拟）
      const progressChange = Math.max(0, Math.min(15, Math.round(overallProgress / 10)))
      
      const reportTypeText = reportType === 'daily' ? '日报' : reportType === 'weekly' ? '周报' : '月报'
      
      setProjectReport({
        id: Date.now().toString(),
        projectId,
        projectName,
        reportType,
        summary,
        highlights,
        issues,
        nextSteps,
        statistics: {
          totalTasks: totalDeptTasks + totalTasks,
          completedTasks: completedDeptTasks + completedTasks,
          inProgressTasks: inProgressDeptTasks + inProgressTasks,
          overdueTasks: overdueDeptTasks.length + overdueTasks.length,
          progressChange
        },
        generatedAt: new Date().toISOString()
      })
      message.success(`AI 项目${reportTypeText}已生成（基于本地分析）`)
    } finally {
      setLoading(false)
    }
  }

  // 导出报告
  const handleExportReport = () => {
    if (!projectReport) return
    
    const reportContent = `
# ${projectName} - 项目${projectReport.reportType === 'daily' ? '日报' : projectReport.reportType === 'weekly' ? '周报' : '月报'}

生成时间：${dayjs(projectReport.generatedAt).format('YYYY-MM-DD HH:mm')}

## 项目概述
${projectReport.summary}

## 统计数据
- 总任务数：${projectReport.statistics.totalTasks}
- 已完成：${projectReport.statistics.completedTasks}
- 进行中：${projectReport.statistics.inProgressTasks}
- 已逾期：${projectReport.statistics.overdueTasks}
- 本周进度：+${projectReport.statistics.progressChange}%

## 本周亮点
${projectReport.highlights.map(h => `- ${h}`).join('\n')}

## 存在问题
${projectReport.issues.map(i => `- ${i}`).join('\n')}

## 下一步计划
${projectReport.nextSteps.map(s => `- ${s}`).join('\n')}
`
    
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}-${projectReport.reportType}-report-${dayjs().format('YYYYMMDD')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success('报告已导出')
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'magenta'
    }
    return colors[severity] || 'default'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    }
    return colors[priority] || 'default'
  }

  return (
    <Card 
      className={styles.container}
      title={
        <Space>
          <RobotOutlined style={{ color: '#1677ff' }} />
          <span>AI 项目助手</span>
          <Tag color="blue">Beta</Tag>
        </Space>
      }
    >
      {/* AI 功能按钮 */}
      <div className={styles.featureButtons}>
        <Button 
          icon={<BulbOutlined />}
          onClick={handleTaskDecomposition}
          loading={loading && activeFeature === 'decompose'}
        >
          智能任务分解
        </Button>
        <Button 
          icon={<RiseOutlined />}
          onClick={handleProgressPrediction}
          loading={loading && activeFeature === 'predict'}
        >
          进度预测
        </Button>
        <Button 
          icon={<WarningOutlined />}
          onClick={handleRiskAnalysis}
          loading={loading && activeFeature === 'risk'}
        >
          风险预警
        </Button>
        <Space.Compact>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 100 }}
            options={[
              { value: 'daily', label: '日报' },
              { value: 'weekly', label: '周报' },
              { value: 'monthly', label: '月报' }
            ]}
          />
          <Button
            icon={<FileTextOutlined />}
            onClick={handleGenerateReport}
            loading={loading && activeFeature === 'report'}
          >
            生成报告
          </Button>
        </Space.Compact>
      </div>

      {/* AI 结果展示 */}
      <div className={styles.resultSection}>
        {loading && (
          <div className={styles.loadingContainer}>
            <Spin tip="AI 正在分析中..." />
          </div>
        )}

        {/* 任务分解建议 */}
        {!loading && taskSuggestions.length > 0 && activeFeature === 'decompose' && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <BulbOutlined style={{ color: '#faad14' }} />
              <span>AI 任务分解建议</span>
            </div>
            <List
              dataSource={taskSuggestions}
              renderItem={(item, index) => (
                <List.Item className={styles.suggestionItem}>
                  <div className={styles.suggestionContent}>
                    <div className={styles.suggestionHeader}>
                      <Badge count={index + 1} style={{ backgroundColor: '#1677ff' }} />
                      <Text strong>{item.name}</Text>
                      <Tag color={getPriorityColor(item.suggestedPriority)}>
                        {item.suggestedPriority === 'high' ? '高优先级' : 
                         item.suggestedPriority === 'medium' ? '中优先级' : '低优先级'}
                      </Tag>
                    </div>
                    <Paragraph type="secondary" className={styles.suggestionDesc}>
                      {item.description}
                    </Paragraph>
                    <Space className={styles.suggestionMeta}>
                      {item.suggestedDepartment && (
                        <Tag>{item.suggestedDepartment}</Tag>
                      )}
                      <Text type="secondary">预计 {item.estimatedDays} 天</Text>
                      {item.dependencies && item.dependencies.length > 0 && (
                        <Text type="secondary">依赖: 任务 {item.dependencies.join(', ')}</Text>
                      )}
                    </Space>
                  </div>
                  <Button type="link" size="small">采纳</Button>
                </List.Item>
              )}
            />
          </div>
        )}

        {/* 进度预测 */}
        {!loading && progressPrediction && activeFeature === 'predict' && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <span>AI 进度预测</span>
            </div>
            <div className={styles.predictionContent}>
              <div className={styles.predictionProgress}>
                <div className={styles.progressItem}>
                  <Text type="secondary">当前进度</Text>
                  <Progress 
                    percent={progressPrediction.currentProgress} 
                    strokeColor="#1677ff"
                  />
                </div>
                <div className={styles.progressItem}>
                  <Text type="secondary">预测下周进度</Text>
                  <Progress 
                    percent={progressPrediction.predictedProgress} 
                    strokeColor="#52c41a"
                  />
                </div>
              </div>
              <div className={styles.predictionInfo}>
                <div className={styles.infoItem}>
                  <Text type="secondary">预计完成日期</Text>
                  <Text strong>{progressPrediction.predictedCompletionDate}</Text>
                </div>
                <div className={styles.infoItem}>
                  <Text type="secondary">预测置信度</Text>
                  <Text strong>{Math.round(progressPrediction.confidence * 100)}%</Text>
                </div>
              </div>
              <div className={styles.factors}>
                <Text type="secondary">影响因素：</Text>
                <ul>
                  {progressPrediction.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 风险预警 */}
        {!loading && riskWarnings.length > 0 && activeFeature === 'risk' && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              <span>AI 风险预警</span>
              <Badge count={riskWarnings.length} style={{ marginLeft: 8 }} />
            </div>
            <Collapse 
              items={riskWarnings.map(risk => ({
                key: risk.id,
                label: (
                  <Space>
                    <Tag color={getSeverityColor(risk.severity)}>
                      {risk.severity === 'high' ? '高风险' : 
                       risk.severity === 'medium' ? '中风险' : '低风险'}
                    </Tag>
                    <Text strong>{risk.title}</Text>
                  </Space>
                ),
                children: (
                  <div className={styles.riskContent}>
                    <Paragraph>{risk.description}</Paragraph>
                    <div className={styles.riskSection}>
                      <Text type="secondary">受影响任务：</Text>
                      <Space wrap>
                        {risk.affectedTasks.map((task, index) => (
                          <Tag key={index}>{task}</Tag>
                        ))}
                      </Space>
                    </div>
                    <div className={styles.riskSection}>
                      <Text type="secondary">建议措施：</Text>
                      <ul>
                        {risk.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              }))}
            />
          </div>
        )}

        {/* 项目报告 */}
        {!loading && projectReport && activeFeature === 'report' && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <FileTextOutlined style={{ color: '#722ed1' }} />
              <span>AI 项目{projectReport.reportType === 'daily' ? '日报' : projectReport.reportType === 'weekly' ? '周报' : '月报'}</span>
            </div>
            <div className={styles.reportContent}>
              <div className={styles.reportSummary}>
                <Text strong>项目概述</Text>
                <Paragraph>{projectReport.summary}</Paragraph>
              </div>
              
              <div className={styles.reportStats}>
                <div className={styles.statItem}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <div className={styles.statValue}>{projectReport.statistics.completedTasks}</div>
                    <div className={styles.statLabel}>已完成</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <ClockCircleOutlined style={{ color: '#1677ff' }} />
                  <div>
                    <div className={styles.statValue}>{projectReport.statistics.inProgressTasks}</div>
                    <div className={styles.statLabel}>进行中</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  <div>
                    <div className={styles.statValue}>{projectReport.statistics.overdueTasks}</div>
                    <div className={styles.statLabel}>已逾期</div>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <div>
                    <div className={styles.statValue}>+{projectReport.statistics.progressChange}%</div>
                    <div className={styles.statLabel}>本周进度</div>
                  </div>
                </div>
              </div>

              <div className={styles.reportSection}>
                <Text strong>本周亮点</Text>
                <ul>
                  {projectReport.highlights.map((item, index) => (
                    <li key={index}><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.reportSection}>
                <Text strong>存在问题</Text>
                <ul>
                  {projectReport.issues.map((item, index) => (
                    <li key={index}><ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.reportSection}>
                <Text strong>下周计划</Text>
                <ul>
                  {projectReport.nextSteps.map((item, index) => (
                    <li key={index}><ThunderboltOutlined style={{ color: '#1677ff', marginRight: 8 }} />{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.reportActions}>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportReport}>导出报告</Button>
                <Button icon={<ReloadOutlined />} onClick={handleGenerateReport}>重新生成</Button>
              </div>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !taskSuggestions.length && !progressPrediction && !riskWarnings.length && !projectReport && (
          <Empty 
            description="点击上方按钮使用 AI 功能"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </Card>
  )
}

export default AIProjectAssistant