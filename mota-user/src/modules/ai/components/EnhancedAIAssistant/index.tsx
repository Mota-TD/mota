/**
 * 增强版AI助手
 * 深度集成Claude API，提供全面的AI辅助功能
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Button,
  Input,
  List,
  Avatar,
  Tag,
  Space,
  Tabs,
  Alert,
  Spin,
  Empty,
  Timeline,
  Progress,
  Tooltip,
  Modal,
  Select,
  Switch,
  Statistic,
  Row,
  Col,
  Badge,
  Popover,
  message,
} from 'antd'
import {
  RobotOutlined,
  BulbOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  SettingOutlined,
  SendOutlined,
  ReloadOutlined,
  StarOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { doubaoClient } from '@/services/doubao/doubaoClient'
import { useProjectStore } from '@/modules/project/store/projectStore'
import { useTaskStore } from '@/modules/task/store/taskStore'
import { useMilestoneStore } from '@/modules/milestone/store/milestoneStore'
import { useAIStore } from '../../store/aiStore'
import styles from './index.module.css'

interface EnhancedAIAssistantProps {
  projectId?: string
  className?: string
  style?: React.CSSProperties
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  loading?: boolean
}

interface AIInsight {
  id: string
  type: 'suggestion' | 'warning' | 'optimization' | 'knowledge'
  title: string
  content: string
  importance: 'high' | 'medium' | 'low'
  category: string
  actionable: boolean
  relatedItems: string[]
  timestamp: string
}

interface ProjectAnalysis {
  overallHealth: number
  riskLevel: 'low' | 'medium' | 'high'
  suggestions: Array<{
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string
  }>
  trends: Array<{
    metric: string
    trend: 'up' | 'down' | 'stable'
    value: number
    change: number
  }>
}

const { TextArea } = Input
const { TabPane } = Tabs

const EnhancedAIAssistant: React.FC<EnhancedAIAssistantProps> = ({
  projectId,
  className,
  style,
}) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('chat')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis | null>(null)
  const [autoInsights, setAutoInsights] = useState(true)
  const [insightCategories] = useState([
    '项目规划', '任务分配', '风险管理', '资源优化', '进度控制', '团队协作'
  ])

  // Store hooks
  const { currentProject, projects } = useProjectStore()
  const { tasks, departmentTasks } = useTaskStore()
  const { milestones } = useMilestoneStore()
  // 暂时注释掉未使用的AI配置
  // const { aiConfig, updateConfig } = useAIStore()

  // 初始化和自动洞察
  useEffect(() => {
    if (projectId || currentProject) {
      initializeAssistant()
      if (autoInsights) {
        generateAutoInsights()
      }
    }
  }, [projectId, currentProject, autoInsights])

  // 初始化助手
  const initializeAssistant = useCallback(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `你好！我是摩塔AI助手。我可以帮助你：\n\n• 📋 智能项目规划和任务分解\n• ⚡ 实时风险分析和预警\n• 🎯 个性化工作建议\n• 📊 数据洞察和趋势分析\n• 🔍 智能知识搜索\n\n请告诉我你需要什么帮助？`,
      timestamp: new Date().toISOString(),
    }
    setChatMessages([welcomeMessage])
  }, [])

  // 发送消息
  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString(),
    }

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      loading: true,
    }

    setChatMessages(prev => [...prev, userMessage, loadingMessage])
    setUserInput('')
    setLoading(true)

    try {
      // 构建上下文信息
      const contextInfo = buildContextInfo()
      
      // 调用Claude API
      const response = await doubaoClient.sendMessage([
        {
          role: 'user',
          content: `${contextInfo}\n\n用户问题: ${userInput.trim()}`
        }
      ], getSystemPrompt())

      // 更新消息
      setChatMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: response, loading: false }
          : msg
      ))

      // 分析是否需要生成洞察
      if (shouldGenerateInsight(userInput, response)) {
        await generateContextualInsight(userInput, response)
      }

    } catch (error) {
      console.error('AI对话失败:', error)
      setChatMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: '抱歉，我遇到了一些问题，请稍后再试。', loading: false }
          : msg
      ))
    } finally {
      setLoading(false)
    }
  }

  // 构建上下文信息
  const buildContextInfo = () => {
    const project = currentProject || projects.find(p => p.id === projectId)
    if (!project) return ''

    return `当前项目信息:
项目名称: ${project.name}
项目描述: ${project.description}
项目状态: ${project.status}
团队规模: ${departmentTasks?.length || 0}人
里程碑数量: ${milestones.length}个
部门任务数量: ${departmentTasks.length}个
执行任务数量: ${tasks.length}个
项目进度: ${project.progress || 0}%`
  }

  // 获取系统提示
  const getSystemPrompt = () => {
    return `你是一个专业的项目管理AI助手，名叫"摩塔AI"。你的职责是：

1. 帮助用户进行项目规划、任务管理和风险控制
2. 提供基于数据的洞察和建议
3. 解答项目管理相关问题
4. 协助优化工作流程和资源配置

请用友好、专业的语气回答用户问题，并尽可能提供具体、可执行的建议。回答要简洁明了，重点突出。`
  }

  // 生成自动洞察
  const generateAutoInsights = async () => {
    if (!currentProject) return

    try {
      setLoading(true)
      
      // 分析项目整体健康度
      const analysis = await analyzeProjectHealth()
      setProjectAnalysis(analysis)

      // 生成智能洞察
      const newInsights = await generateSmartInsights()
      setInsights(newInsights)

    } catch (error) {
      console.error('生成洞察失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 分析项目健康度
  const analyzeProjectHealth = async (): Promise<ProjectAnalysis> => {
    try {
      const result = await doubaoClient.generateRiskWarnings({
        projectId: currentProject!.id,
        projectName: currentProject!.name,
        departmentTasks: departmentTasks.map(t => ({
          name: t.name,
          status: t.status,
          progress: t.progress || 0,
          endDate: t.endDate,
        })),
        tasks: tasks.map(t => ({
          name: t.name,
          status: t.status,
          progress: t.progress || 0,
          endDate: t.endDate,
        })),
      })

      // 计算整体健康度
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(t => t.status === 'completed').length
      const overdueTasks = tasks.filter(t => 
        t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
      ).length

      const healthScore = totalTasks > 0 
        ? Math.max(0, 100 - (overdueTasks / totalTasks) * 50 - (result.length * 10))
        : 100

      const riskLevel = result.length > 3 ? 'high' : result.length > 1 ? 'medium' : 'low'

      return {
        overallHealth: Math.round(healthScore),
        riskLevel,
        suggestions: result.map(r => ({
          category: r.type || '一般',
          priority: r.severity as any || 'medium',
          title: r.title || '风险提醒',
          description: r.description || '',
          impact: `影响 ${r.affectedTasks?.length || 0} 个任务`,
        })),
        trends: [
          {
            metric: '完成率',
            trend: 'up',
            value: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            change: 5,
          },
          {
            metric: '逾期任务',
            trend: overdueTasks > 0 ? 'up' : 'stable',
            value: overdueTasks,
            change: overdueTasks,
          }
        ]
      }
    } catch (error) {
      console.error('项目健康度分析失败:', error)
      return {
        overallHealth: 75,
        riskLevel: 'medium',
        suggestions: [],
        trends: [],
      }
    }
  }

  // 生成智能洞察
  const generateSmartInsights = async (): Promise<AIInsight[]> => {
    const insights: AIInsight[] = []

    try {
      // 基于当前项目状态生成洞察
      if (currentProject) {
        // 进度分析洞察
        if (currentProject.progress && currentProject.progress < 30) {
          insights.push({
            id: `insight_${Date.now()}_1`,
            type: 'suggestion',
            title: '项目启动建议',
            content: '项目进度较慢，建议优先完成核心里程碑任务，确保关键路径不受影响。',
            importance: 'high',
            category: '进度控制',
            actionable: true,
            relatedItems: milestones.slice(0, 3).map(m => m.name),
            timestamp: new Date().toISOString(),
          })
        }

        // 任务分配洞察
        const unassignedTasks = tasks.filter(t => !t.assigneeId).length
        if (unassignedTasks > 0) {
          insights.push({
            id: `insight_${Date.now()}_2`,
            type: 'warning',
            title: '任务分配提醒',
            content: `发现 ${unassignedTasks} 个未分配的任务，建议尽快分配给合适的团队成员。`,
            importance: 'medium',
            category: '任务分配',
            actionable: true,
            relatedItems: [],
            timestamp: new Date().toISOString(),
          })
        }

        // 风险预警洞察
        const overdueTasks = tasks.filter(t => 
          t.endDate && new Date(t.endDate) < new Date() && t.status !== 'completed'
        )
        if (overdueTasks.length > 0) {
          insights.push({
            id: `insight_${Date.now()}_3`,
            type: 'warning',
            title: '逾期风险预警',
            content: `有 ${overdueTasks.length} 个任务已逾期，可能影响项目整体进度。`,
            importance: 'high',
            category: '风险管理',
            actionable: true,
            relatedItems: overdueTasks.slice(0, 3).map(t => t.name),
            timestamp: new Date().toISOString(),
          })
        }
      }

    } catch (error) {
      console.error('生成智能洞察失败:', error)
    }

    return insights
  }

  // 判断是否需要生成洞察
  const shouldGenerateInsight = (userInput: string, response: string): boolean => {
    const insightKeywords = ['建议', '优化', '改进', '风险', '问题', '分析']
    return insightKeywords.some(keyword => 
      userInput.includes(keyword) || response.includes(keyword)
    )
  }

  // 生成上下文洞察
  const generateContextualInsight = async (userInput: string, response: string) => {
    const newInsight: AIInsight = {
      id: `contextual_${Date.now()}`,
      type: 'optimization',
      title: '基于对话的建议',
      content: response.length > 200 ? response.substring(0, 200) + '...' : response,
      importance: 'medium',
      category: '智能建议',
      actionable: true,
      relatedItems: [],
      timestamp: new Date().toISOString(),
    }

    setInsights(prev => [newInsight, ...prev.slice(0, 9)]) // 保持最新的10个洞察
  }

  // 渲染聊天界面
  const renderChatTab = () => (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {chatMessages.map(message => (
          <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
            <Avatar 
              icon={message.type === 'user' ? undefined : <RobotOutlined />}
              style={{ 
                backgroundColor: message.type === 'user' ? '#1890ff' : '#52c41a' 
              }}
            >
              {message.type === 'user' ? 'U' : ''}
            </Avatar>
            <div className={styles.messageContent}>
              {message.loading ? (
                <div className={styles.typingIndicator}>
                  <Spin size="small" />
                  <span>AI正在思考...</span>
                </div>
              ) : (
                <div className={styles.messageText}>
                  {message.content.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              )}
              <div className={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.inputArea}>
        <TextArea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="请输入你的问题，我会尽力帮助你..."
          rows={2}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={loading}
          disabled={!userInput.trim()}
          onClick={handleSendMessage}
        >
          发送
        </Button>
      </div>
    </div>
  )

  // 渲染洞察界面
  const renderInsightsTab = () => (
    <div className={styles.insightsContainer}>
      <div className={styles.insightsHeader}>
        <Space>
          <span>智能洞察</span>
          <Badge count={insights.length} />
          <Switch
            size="small"
            checked={autoInsights}
            onChange={setAutoInsights}
            checkedChildren="自动"
            unCheckedChildren="手动"
          />
        </Space>
        <Button
          icon={<ReloadOutlined />}
          size="small"
          loading={loading}
          onClick={generateAutoInsights}
        >
          刷新洞察
        </Button>
      </div>

      {insights.length === 0 ? (
        <Empty description="暂无洞察建议" />
      ) : (
        <List
          dataSource={insights}
          renderItem={(insight) => (
            <List.Item className={styles.insightItem}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={getInsightIcon(insight.type)} 
                    style={{ backgroundColor: getInsightColor(insight.importance) }}
                  />
                }
                title={
                  <div className={styles.insightTitle}>
                    <span>{insight.title}</span>
                    <div className={styles.insightMeta}>
                      <Tag color={getInsightColor(insight.importance)}>
                        {insight.importance}
                      </Tag>
                      <Tag>{insight.category}</Tag>
                    </div>
                  </div>
                }
                description={
                  <div>
                    <p>{insight.content}</p>
                    {insight.relatedItems.length > 0 && (
                      <div className={styles.relatedItems}>
                        <span>相关项目：</span>
                        {insight.relatedItems.map((item, index) => (
                          <Tag key={index}>{item}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
              {insight.actionable && (
                <Button size="small" icon={<ThunderboltOutlined />}>
                  执行建议
                </Button>
              )}
            </List.Item>
          )}
        />
      )}
    </div>
  )

  // 渲染分析界面
  const renderAnalysisTab = () => {
    if (!projectAnalysis) {
      return (
        <div className={styles.analysisLoading}>
          <Spin size="large" />
          <p>正在分析项目数据...</p>
        </div>
      )
    }

    return (
      <div className={styles.analysisContainer}>
        {/* 项目健康度 */}
        <Card title="项目健康度" className={styles.healthCard}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="整体健康度"
                value={projectAnalysis.overallHealth}
                suffix="%"
                valueStyle={{ 
                  color: projectAnalysis.overallHealth > 70 ? '#52c41a' : 
                         projectAnalysis.overallHealth > 40 ? '#faad14' : '#ff4d4f' 
                }}
              />
              <Progress 
                percent={projectAnalysis.overallHealth} 
                status={projectAnalysis.overallHealth > 70 ? 'success' : 'exception'}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="风险等级"
                value={projectAnalysis.riskLevel.toUpperCase()}
                valueStyle={{ 
                  color: projectAnalysis.riskLevel === 'low' ? '#52c41a' : 
                         projectAnalysis.riskLevel === 'medium' ? '#faad14' : '#ff4d4f' 
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* 趋势分析 */}
        <Card title="关键指标趋势" className={styles.trendsCard}>
          <Row gutter={16}>
            {projectAnalysis.trends.map((trend, index) => (
              <Col span={12} key={index}>
                <Statistic
                  title={trend.metric}
                  value={trend.value}
                  suffix={trend.metric === '完成率' ? '%' : ''}
                  prefix={
                    trend.trend === 'up' ? '↑' : 
                    trend.trend === 'down' ? '↓' : '→'
                  }
                  valueStyle={{ 
                    color: trend.trend === 'up' ? '#52c41a' : 
                           trend.trend === 'down' ? '#ff4d4f' : '#666' 
                  }}
                />
              </Col>
            ))}
          </Row>
        </Card>

        {/* 改进建议 */}
        <Card title="AI改进建议">
          <List
            dataSource={projectAnalysis.suggestions}
            renderItem={(suggestion) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<BulbOutlined />} />}
                  title={
                    <div>
                      <span>{suggestion.title}</span>
                      <Tag 
                        color={suggestion.priority === 'high' ? 'red' : 
                               suggestion.priority === 'medium' ? 'orange' : 'blue'}
                        style={{ marginLeft: 8 }}
                      >
                        {suggestion.priority}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p>{suggestion.description}</p>
                      <small style={{ color: '#999' }}>{suggestion.impact}</small>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    )
  }

  // 工具函数
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion': return <BulbOutlined />
      case 'warning': return <ExclamationCircleOutlined />
      case 'optimization': return <ThunderboltOutlined />
      case 'knowledge': return <BookOutlined />
      default: return <QuestionCircleOutlined />
    }
  }

  const getInsightColor = (importance: AIInsight['importance']) => {
    switch (importance) {
      case 'high': return '#ff4d4f'
      case 'medium': return '#faad14'
      case 'low': return '#52c41a'
      default: return '#1890ff'
    }
  }

  return (
    <div className={`${styles.container} ${className || ''}`} style={style}>
      <Card 
        title={
          <div className={styles.header}>
            <Space>
              <RobotOutlined />
              <span>摩塔AI助手</span>
              <Badge dot status="success" />
            </Space>
          </div>
        }
        className={styles.assistantCard}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'chat',
              label: (
                <span>
                  <RobotOutlined />
                  智能对话
                </span>
              ),
              children: renderChatTab(),
            },
            {
              key: 'insights',
              label: (
                <span>
                  <BulbOutlined />
                  智能洞察
                  {insights.length > 0 && <Badge count={insights.length} size="small" />}
                </span>
              ),
              children: renderInsightsTab(),
            },
            {
              key: 'analysis',
              label: (
                <span>
                  <TrophyOutlined />
                  项目分析
                </span>
              ),
              children: renderAnalysisTab(),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default EnhancedAIAssistant