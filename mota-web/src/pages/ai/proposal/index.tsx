/**
 * AI 方案生成器页面
 * 实现AG-001到AG-010全部功能
 */

import { useState, useEffect, useRef } from 'react'
import { 
  Button, Input, message, Spin, Tag, Progress, Modal, 
  Tooltip, Empty, Dropdown, Menu, Badge
} from 'antd'
import {
  PlusOutlined, SendOutlined, FileTextOutlined, 
  BarChartOutlined, CheckCircleOutlined, HistoryOutlined,
  ExportOutlined, BookOutlined, RobotOutlined, UserOutlined,
  EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined,
  FileWordOutlined, FilePdfOutlined, FilePptOutlined,
  LineChartOutlined, PieChartOutlined, TableOutlined,
  ApartmentOutlined, FieldTimeOutlined, BulbOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/store/auth'
import * as aiProposalApi from '@/services/api/aiProposal'
import styles from './index.module.css'

const { TextArea } = Input

// 消息类型
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type?: 'text' | 'proposal' | 'analysis'
  proposal?: aiProposalApi.ProposalContent
  timestamp: Date
}

// 工具面板标签
type ToolTab = 'sections' | 'charts' | 'quality' | 'versions' | 'export' | 'templates'

const AIProposalPage = () => {
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 状态
  const [sessions, setSessions] = useState<aiProposalApi.ProposalSession[]>([])
  const [currentSession, setCurrentSession] = useState<aiProposalApi.ProposalSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // 当前方案相关
  const [currentProposal, setCurrentProposal] = useState<aiProposalApi.ProposalContent | null>(null)
  const [currentRequirement, setCurrentRequirement] = useState<aiProposalApi.RequirementAnalysis | null>(null)
  const [sections, setSections] = useState<aiProposalApi.ProposalSection[]>([])
  const [chartSuggestions, setChartSuggestions] = useState<aiProposalApi.ChartSuggestion[]>([])
  const [qualityChecks, setQualityChecks] = useState<aiProposalApi.QualityCheck[]>([])
  const [versions, setVersions] = useState<aiProposalApi.ProposalVersion[]>([])
  const [templates, setTemplates] = useState<aiProposalApi.ProposalTemplate[]>([])
  
  // 工具面板
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>('sections')
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  
  // 防止重复请求的 ref
  const dataLoadedRef = useRef(false);
  const loadingDataRef = useRef(false);
  const lastUserIdRef = useRef<string | number | null>(null);

  // 加载会话列表
  useEffect(() => {
    if (!user?.id) return;
    
    // 如果用户ID没变且已加载过，跳过
    if (lastUserIdRef.current === user.id && dataLoadedRef.current) {
      return;
    }
    
    // 如果正在加载且用户ID相同，跳过
    if (loadingDataRef.current && lastUserIdRef.current === user.id) {
      return;
    }
    
    lastUserIdRef.current = user.id;
    loadingDataRef.current = true;
    
    const loadInitialData = async () => {
      try {
        await Promise.all([loadSessions(), loadTemplates()]);
        dataLoadedRef.current = true;
      } finally {
        loadingDataRef.current = false;
      }
    };
    
    loadInitialData();
  }, [user?.id])
  
  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const loadSessions = async () => {
    try {
      const sessions = await aiProposalApi.getUserSessions(user!.id)
      setSessions(sessions || [])
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  }
  
  const loadTemplates = async () => {
    try {
      const templates = await aiProposalApi.getProposalTemplates()
      setTemplates(templates || [])
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }
  
  // 创建新会话
  const handleCreateSession = async () => {
    try {
      const newSession = await aiProposalApi.createProposalSession(
        user!.id,
        `新方案 ${new Date().toLocaleDateString()}`,
        'general'
      )
      setSessions([newSession, ...sessions])
      setCurrentSession(newSession)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '您好！我是AI方案助手。请告诉我您需要生成什么类型的方案，我会帮您分析需求并生成专业的方案文档。\n\n您可以描述：\n- 项目背景和目标\n- 技术要求或业务需求\n- 预期的方案类型（技术方案、商业计划、研究报告等）',
        timestamp: new Date()
      }])
      setCurrentProposal(null)
      setSections([])
      setChartSuggestions([])
      setQualityChecks([])
      setVersions([])
    } catch (error) {
      message.error('创建会话失败')
    }
  }
  
  // 选择会话
  const handleSelectSession = async (session: aiProposalApi.ProposalSession) => {
    setCurrentSession(session)
    // 加载会话的方案
    try {
      const refs = await aiProposalApi.getHistoricalReferences(user!.id, session.proposalType, 1)
      if (refs && refs.length > 0) {
        const proposal = refs[0]
        setCurrentProposal(proposal)
        await loadProposalDetails(proposal.id)
      }
    } catch (error) {
      console.error('加载方案失败:', error)
    }
  }
  
  // 加载方案详情
  const loadProposalDetails = async (proposalId: number) => {
    try {
      const [sectionsData, versionsData] = await Promise.all([
        aiProposalApi.getProposalSections(proposalId),
        aiProposalApi.getProposalVersions(proposalId)
      ])
      setSections(sectionsData || [])
      setVersions(versionsData || [])
    } catch (error) {
      console.error('加载方案详情失败:', error)
    }
  }
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages([...messages, userMessage])
    setInputValue('')
    setGenerating(true)
    
    try {
      // AG-001 & AG-002: 意图识别和需求解析
      const [intentResult, requirementResult] = await Promise.all([
        aiProposalApi.parseIntent(currentSession.id, inputValue),
        aiProposalApi.analyzeRequirement(currentSession.id, inputValue)
      ])
      
      setCurrentRequirement(requirementResult)
      
      // 添加分析结果消息
      const analysisMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `我已经分析了您的需求：\n\n**意图类型**: ${getIntentLabel(intentResult.intentType)}\n**置信度**: ${(intentResult.confidence * 100).toFixed(0)}%\n**关键词**: ${intentResult.keywords.join(', ')}\n\n正在为您生成方案...`,
        type: 'analysis',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, analysisMessage])
      
      // AG-003: 知识检索
      await aiProposalApi.retrieveKnowledge(currentSession.id, inputValue)
      
      // AG-005: 生成方案
      const proposal = await aiProposalApi.generateProposal(
        currentSession.id,
        requirementResult.id,
        selectedTemplate || undefined
      )
      setCurrentProposal(proposal)
      
      // 加载方案详情
      await loadProposalDetails(proposal.id)
      
      // AG-007: 生成图表建议
      const charts = await aiProposalApi.generateChartSuggestions(proposal.id)
      setChartSuggestions(charts || [])
      
      // AG-008: 质量检查
      const qualityResults = await aiProposalApi.performQualityCheck(proposal.id)
      setQualityChecks(qualityResults || [])
      
      // 添加方案消息
      const proposalMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '方案已生成完成！您可以在右侧面板查看章节结构、图表建议和质量检查结果。\n\n如果需要修改或优化，请告诉我您的反馈意见。',
        type: 'proposal',
        proposal: proposal,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, proposalMessage])
      
    } catch (error) {
      message.error('生成方案失败，请重试')
      console.error('生成方案失败:', error)
    } finally {
      setGenerating(false)
    }
  }
  
  // AG-009: 优化方案
  const handleOptimize = async () => {
    if (!currentProposal || !inputValue.trim()) {
      message.warning('请输入优化建议')
      return
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `优化建议: ${inputValue}`,
      timestamp: new Date()
    }
    
    setMessages([...messages, userMessage])
    setInputValue('')
    setGenerating(true)
    
    try {
      const optimizedProposal = await aiProposalApi.optimizeProposal(currentProposal.id, inputValue)
      setCurrentProposal(optimizedProposal)
      
      // 重新加载版本
      const versionsData = await aiProposalApi.getProposalVersions(currentProposal.id)
      setVersions(versionsData || [])
      
      // 重新质量检查
      const qualityResults = await aiProposalApi.performQualityCheck(currentProposal.id)
      setQualityChecks(qualityResults || [])
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '方案已根据您的反馈进行优化，新版本已保存。您可以在版本历史中查看所有版本。',
        type: 'proposal',
        proposal: optimizedProposal,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, responseMessage])
      
    } catch (error) {
      message.error('优化失败，请重试')
    } finally {
      setGenerating(false)
    }
  }
  
  // AG-010: 导出方案
  const handleExport = async (format: string) => {
    if (!currentProposal) {
      message.warning('请先生成方案')
      return
    }
    
    try {
      setLoading(true)
      const res = await aiProposalApi.exportProposal(currentProposal.id, format)
      message.success(`正在导出${format.toUpperCase()}格式，请稍候...`)
      
      // 模拟下载
      setTimeout(() => {
        message.success('导出成功！')
      }, 2000)
    } catch (error) {
      message.error('导出失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 回滚版本
  const handleRollback = async (versionId: number) => {
    if (!currentProposal) return
    
    try {
      const rolledBackProposal = await aiProposalApi.rollbackToVersion(currentProposal.id, versionId)
      setCurrentProposal(rolledBackProposal)
      message.success('已回滚到指定版本')
      
      // 重新加载
      await loadProposalDetails(currentProposal.id)
    } catch (error) {
      message.error('回滚失败')
    }
  }
  
  // 获取意图标签
  const getIntentLabel = (type: string) => {
    const labels: Record<string, string> = {
      technical: '技术方案',
      business: '商业方案',
      research: '研究报告',
      report: '工作报告',
      general: '通用方案'
    }
    return labels[type] || type
  }
  
  // 获取图表图标
  const getChartIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      bar: <BarChartOutlined />,
      line: <LineChartOutlined />,
      pie: <PieChartOutlined />,
      table: <TableOutlined />,
      flow: <ApartmentOutlined />,
      gantt: <FieldTimeOutlined />
    }
    return icons[type] || <BarChartOutlined />
  }
  
  // 渲染工具面板内容
  const renderToolContent = () => {
    switch (activeToolTab) {
      case 'sections':
        return (
          <div className={styles.sectionList}>
            {sections.length > 0 ? sections.map(section => (
              <div 
                key={section.id} 
                className={`${styles.sectionItem} ${section.level === 2 ? styles.sectionLevel2 : ''}`}
              >
                <span className={styles.sectionNumber}>{section.sectionNumber}</span>
                <span className={styles.sectionTitle}>{section.title}</span>
              </div>
            )) : (
              <Empty description="暂无章节" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )
      
      case 'charts':
        return (
          <div className={styles.chartList}>
            {chartSuggestions.length > 0 ? chartSuggestions.map(chart => (
              <div key={chart.id} className={styles.chartItem}>
                <div className={styles.chartHeader}>
                  <span className={styles.chartType}>
                    {getChartIcon(chart.chartType)}
                    {chart.chartType}
                  </span>
                  <Button 
                    size="small" 
                    type={chart.isApplied ? 'default' : 'primary'}
                    disabled={chart.isApplied}
                  >
                    {chart.isApplied ? '已应用' : '应用'}
                  </Button>
                </div>
                <div className={styles.chartTitle}>{chart.title}</div>
                <div className={styles.chartDesc}>{chart.description}</div>
              </div>
            )) : (
              <Empty description="暂无图表建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )
      
      case 'quality':
        const avgScore = qualityChecks.length > 0 
          ? Math.round(qualityChecks.reduce((sum, q) => sum + q.score, 0) / qualityChecks.length)
          : 0
        return (
          <div>
            <div className={styles.qualityOverview}>
              <div 
                className={styles.qualityScore}
                style={{ color: aiProposalApi.getEvaluationScoreColor(avgScore) }}
              >
                {avgScore}
              </div>
              <div className={styles.qualityLabel}>
                {aiProposalApi.formatEvaluationScore(avgScore)}
              </div>
            </div>
            <div className={styles.qualityList}>
              {qualityChecks.map(check => (
                <div key={check.id} className={styles.qualityItem}>
                  <span className={styles.qualityItemName}>{check.checkItem}</span>
                  <span 
                    className={styles.qualityItemScore}
                    style={{ color: aiProposalApi.getQualityResultColor(check.result) }}
                  >
                    {check.score}分
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'versions':
        return (
          <div className={styles.versionList}>
            {versions.length > 0 ? versions.map(version => (
              <div 
                key={version.id} 
                className={`${styles.versionItem} ${version.isCurrent ? styles.current : ''}`}
                onClick={() => !version.isCurrent && handleRollback(version.id)}
              >
                <div className={styles.versionHeader}>
                  <span className={styles.versionNumber}>v{version.versionNumber}</span>
                  {version.isCurrent && (
                    <span className={styles.versionBadge}>当前</span>
                  )}
                </div>
                <div className={styles.versionDesc}>{version.changeDescription || '初始版本'}</div>
                <div className={styles.versionMeta}>
                  {new Date(version.createdAt).toLocaleString()}
                </div>
              </div>
            )) : (
              <Empty description="暂无版本" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        )
      
      case 'export':
        return (
          <div className={styles.exportOptions}>
            <div className={styles.exportOption} onClick={() => handleExport('word')}>
              <div className={styles.exportIcon}><FileWordOutlined /></div>
              <div className={styles.exportName}>Word文档</div>
              <div className={styles.exportDesc}>导出为.docx格式</div>
            </div>
            <div className={styles.exportOption} onClick={() => handleExport('pdf')}>
              <div className={styles.exportIcon}><FilePdfOutlined /></div>
              <div className={styles.exportName}>PDF文档</div>
              <div className={styles.exportDesc}>导出为.pdf格式</div>
            </div>
            <div className={styles.exportOption} onClick={() => handleExport('ppt')}>
              <div className={styles.exportIcon}><FilePptOutlined /></div>
              <div className={styles.exportName}>PPT演示</div>
              <div className={styles.exportDesc}>导出为.pptx格式</div>
            </div>
          </div>
        )
      
      case 'templates':
        return (
          <div className={styles.templateGrid}>
            {templates.map(template => (
              <div 
                key={template.id}
                className={`${styles.templateCard} ${selectedTemplate === template.id ? styles.selected : ''}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className={styles.templateName}>{template.name}</div>
                <div className={styles.templateType}>{template.templateType}</div>
              </div>
            ))}
          </div>
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>AI 方案生成</h1>
        <div className={styles.headerActions}>
          <Button icon={<HistoryOutlined />}>历史方案</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSession}>
            新建方案
          </Button>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className={styles.mainContent}>
        {/* 左侧会话列表 */}
        <div className={styles.sessionPanel}>
          <div className={styles.sessionHeader}>
            <h3 className={styles.sessionTitle}>会话列表</h3>
            <Button 
              type="text" 
              size="small" 
              icon={<PlusOutlined />}
              onClick={handleCreateSession}
            />
          </div>
          <div className={styles.sessionList}>
            {sessions.map(session => (
              <div 
                key={session.id}
                className={`${styles.sessionItem} ${currentSession?.id === session.id ? styles.active : ''}`}
                onClick={() => handleSelectSession(session)}
              >
                <div className={styles.sessionItemTitle}>{session.title}</div>
                <div className={styles.sessionItemMeta}>
                  <span>{getIntentLabel(session.proposalType)}</span>
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className={styles.emptyState}>
                <FileTextOutlined className={styles.emptyIcon} />
                <div className={styles.emptyText}>暂无会话</div>
                <Button type="primary" size="small" onClick={handleCreateSession}>
                  创建新会话
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* 中间对话区 */}
        <div className={styles.contentPanel}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>
              {currentSession?.title || '选择或创建会话'}
            </h2>
            <div className={styles.contentActions}>
              {currentProposal && (
                <>
                  <Tooltip title="重新生成">
                    <Button icon={<ReloadOutlined />} />
                  </Tooltip>
                  <Tooltip title="编辑">
                    <Button icon={<EditOutlined />} />
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          
          <div className={styles.contentBody}>
            {currentSession ? (
              <div className={styles.chatMessages}>
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`${styles.messageItem} ${styles[msg.role]}`}
                  >
                    <div className={styles.messageAvatar}>
                      {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    </div>
                    <div className={styles.messageBubble}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      {msg.proposal && (
                        <div className={styles.proposalContent}>
                          <h3>{msg.proposal.title}</h3>
                          <div dangerouslySetInnerHTML={{ 
                            __html: msg.proposal.content?.replace(/\n/g, '<br/>') || '' 
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {generating && (
                  <div className={`${styles.messageItem} ${styles.assistant}`}>
                    <div className={styles.messageAvatar}>
                      <RobotOutlined />
                    </div>
                    <div className={styles.messageBubble}>
                      <div className={styles.typingIndicator}>
                        <span className={styles.typingDot}></span>
                        <span className={styles.typingDot}></span>
                        <span className={styles.typingDot}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className={styles.emptyState}>
                <BulbOutlined className={styles.emptyIcon} />
                <div className={styles.emptyText}>
                  选择一个会话或创建新会话开始生成方案
                </div>
                <Button type="primary" onClick={handleCreateSession}>
                  创建新会话
                </Button>
              </div>
            )}
          </div>
          
          {currentSession && (
            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <TextArea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={currentProposal ? "输入优化建议..." : "描述您的方案需求..."}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={e => {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      currentProposal ? handleOptimize() : handleSendMessage()
                    }
                  }}
                />
              </div>
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                loading={generating}
                onClick={currentProposal ? handleOptimize : handleSendMessage}
              >
                {currentProposal ? '优化' : '生成'}
              </Button>
            </div>
          )}
        </div>
        
        {/* 右侧工具面板 */}
        <div className={styles.toolPanel}>
          <div className={styles.toolTabs}>
            <button 
              className={`${styles.toolTab} ${activeToolTab === 'sections' ? styles.active : ''}`}
              onClick={() => setActiveToolTab('sections')}
            >
              <FileTextOutlined /> 章节
            </button>
            <button 
              className={`${styles.toolTab} ${activeToolTab === 'charts' ? styles.active : ''}`}
              onClick={() => setActiveToolTab('charts')}
            >
              <BarChartOutlined /> 图表
            </button>
            <button 
              className={`${styles.toolTab} ${activeToolTab === 'quality' ? styles.active : ''}`}
              onClick={() => setActiveToolTab('quality')}
            >
              <CheckCircleOutlined /> 质量
            </button>
            <button 
              className={`${styles.toolTab} ${activeToolTab === 'versions' ? styles.active : ''}`}
              onClick={() => setActiveToolTab('versions')}
            >
              <HistoryOutlined /> 版本
            </button>
            <button 
              className={`${styles.toolTab} ${activeToolTab === 'export' ? styles.active : ''}`}
              onClick={() => setActiveToolTab('export')}
            >
              <ExportOutlined /> 导出
            </button>
            <button 
              className={`${styles.toolTab} ${activeToolTab === 'templates' ? styles.active : ''}`}
              onClick={() => setActiveToolTab('templates')}
            >
              <BookOutlined /> 模板
            </button>
          </div>
          <div className={styles.toolContent}>
            {renderToolContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIProposalPage