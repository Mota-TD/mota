import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Dropdown,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Empty,
  Badge,
  Drawer,
  Switch,
  InputNumber,
  Slider,
  Divider,
  Progress,
  Timeline,
  Collapse,
  Rate,
  Popconfirm
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  PlusOutlined,
  HistoryOutlined,
  BulbOutlined,
  FileTextOutlined,
  TranslationOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileWordOutlined,
  SettingOutlined,
  DeleteOutlined,
  PushpinOutlined,
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import styles from './index.module.css';
import * as aiAssistantApi from '../../../services/api/aiAssistant';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const AIAssistantPage: React.FC = () => {
  // 状态管理
  const [sessions, setSessions] = useState<aiAssistantApi.AIChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<aiAssistantApi.AIChatSession | null>(null);
  const [messages, setMessages] = useState<aiAssistantApi.AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [config, setConfig] = useState<aiAssistantApi.AIAssistantConfig | null>(null);
  
  // 工作建议
  const [suggestions, setSuggestions] = useState<aiAssistantApi.AIWorkSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // 翻译
  const [translateText, setTranslateText] = useState('');
  const [translateResult, setTranslateResult] = useState<aiAssistantApi.AITranslation | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);
  
  // 文档摘要
  const [summaryText, setSummaryText] = useState('');
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);
  
  // 数据分析
  const [analyses, setAnalyses] = useState<aiAssistantApi.AIDataAnalysis[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // 日程建议
  const [scheduleSuggestions, setScheduleSuggestions] = useState<aiAssistantApi.AIScheduleSuggestion[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // 工作报告
  const [reports, setReports] = useState<aiAssistantApi.AIWorkReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportForm] = Form.useForm();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化加载
  useEffect(() => {
    loadSessions();
    loadConfig();
  }, []);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载会话列表
  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await aiAssistantApi.getUserSessions(50);
      setSessions(data);
    } catch (error) {
      console.error('加载会话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载配置
  const loadConfig = async () => {
    try {
      const data = await aiAssistantApi.getAssistantConfig();
      setConfig(data);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  // 创建新会话
  const createNewSession = async () => {
    try {
      const session = await aiAssistantApi.createSession('general', '新对话');
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setMessages([]);
    } catch (error) {
      message.error('创建会话失败');
    }
  };

  // 选择会话
  const selectSession = async (session: aiAssistantApi.AIChatSession) => {
    setCurrentSession(session);
    try {
      const msgs = await aiAssistantApi.getSessionMessages(session.id, 100);
      setMessages(msgs);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const messageText = inputValue.trim();
    setInputValue('');
    setSendingMessage(true);
    
    try {
      let response: aiAssistantApi.ChatResponse;
      
      if (currentSession) {
        response = await aiAssistantApi.sendMessage(currentSession.id, messageText);
      } else {
        response = await aiAssistantApi.quickChat(messageText);
        // 如果是快速对话，创建新会话
        await loadSessions();
      }
      
      setMessages(prev => [...prev, response.userMessage, response.assistantMessage]);
      
      // 如果识别到特定意图，显示提示
      if (response.intent && response.intent.intentType !== 'general_chat') {
        message.info(`识别到意图: ${getIntentLabel(response.intent.intentType)}`);
      }
    } catch (error) {
      message.error('发送消息失败');
    } finally {
      setSendingMessage(false);
    }
  };

  // 获取意图标签
  const getIntentLabel = (intentType: string): string => {
    const labels: Record<string, string> = {
      'task_create': '创建任务',
      'task_query': '查询任务',
      'task_update': '更新任务',
      'schedule_query': '查询日程',
      'schedule_create': '创建日程',
      'report_generate': '生成报告',
      'data_analysis': '数据分析',
      'document_summary': '文档摘要',
      'translation': '翻译',
      'general_chat': '闲聊'
    };
    return labels[intentType] || intentType;
  };

  // 加载工作建议
  const loadSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const data = await aiAssistantApi.getWorkSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('加载建议失败:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // 处理建议反馈
  const handleSuggestionFeedback = async (id: number, accepted: boolean) => {
    try {
      await aiAssistantApi.feedbackSuggestion(id, accepted);
      message.success(accepted ? '已采纳建议' : '已忽略建议');
      loadSuggestions();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 翻译文本
  const handleTranslate = async () => {
    if (!translateText.trim()) return;
    
    try {
      setTranslating(true);
      const result = await aiAssistantApi.translateText(
        translateText,
        sourceLanguage,
        targetLanguage
      );
      setTranslateResult(result);
    } catch (error) {
      message.error('翻译失败');
    } finally {
      setTranslating(false);
    }
  };

  // 生成摘要
  const handleSummarize = async () => {
    if (!summaryText.trim()) return;
    
    try {
      setSummarizing(true);
      const result = await aiAssistantApi.generateTextSummary(summaryText, 'brief');
      setSummaryResult(result);
    } catch (error) {
      message.error('生成摘要失败');
    } finally {
      setSummarizing(false);
    }
  };

  // 加载日程建议
  const loadScheduleSuggestions = async () => {
    try {
      setScheduleLoading(true);
      const data = await aiAssistantApi.getScheduleSuggestions();
      setScheduleSuggestions(data);
    } catch (error) {
      console.error('加载日程建议失败:', error);
    } finally {
      setScheduleLoading(false);
    }
  };

  // 应用日程建议
  const applyScheduleSuggestion = async (id: number) => {
    try {
      await aiAssistantApi.applyScheduleSuggestion(id);
      message.success('已应用日程建议');
      loadScheduleSuggestions();
    } catch (error) {
      message.error('应用失败');
    }
  };

  // 加载工作报告
  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const data = await aiAssistantApi.getWorkReports(undefined, 20);
      setReports(data);
    } catch (error) {
      console.error('加载报告失败:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  // 生成报告
  const handleGenerateReport = async (values: any) => {
    try {
      const report = await aiAssistantApi.generateWorkReport(
        values.reportType,
        values.reportScope,
        values.scopeId
      );
      message.success('报告生成成功');
      setReportModalVisible(false);
      reportForm.resetFields();
      setReports([report, ...reports]);
    } catch (error) {
      message.error('生成报告失败');
    }
  };

  // 保存配置
  const handleSaveConfig = async (values: any) => {
    try {
      await aiAssistantApi.saveAssistantConfig(values);
      message.success('配置保存成功');
      setSettingsVisible(false);
      loadConfig();
    } catch (error) {
      message.error('保存配置失败');
    }
  };

  // Tab切换时加载数据
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    switch (key) {
      case 'suggestions':
        loadSuggestions();
        break;
      case 'schedule':
        loadScheduleSuggestions();
        break;
      case 'reports':
        loadReports();
        break;
    }
  };

  // 渲染消息
  const renderMessage = (msg: aiAssistantApi.AIChatMessage) => {
    const isUser = msg.role === 'user';
    
    return (
      <div
        key={msg.id}
        className={`${styles.messageItem} ${isUser ? styles.userMessage : styles.assistantMessage}`}
      >
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          className={isUser ? styles.userAvatar : styles.assistantAvatar}
        />
        <div className={styles.messageContent}>
          <div className={styles.messageBubble}>
            <Paragraph className={styles.messageText}>{msg.content}</Paragraph>
          </div>
          <div className={styles.messageFooter}>
            <Text type="secondary" className={styles.messageTime}>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </Text>
            {!isUser && (
              <Space className={styles.messageActions}>
                <Tooltip title="复制">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      message.success('已复制');
                    }}
                  />
                </Tooltip>
                <Tooltip title="有帮助">
                  <Button type="text" size="small" icon={<LikeOutlined />} />
                </Tooltip>
                <Tooltip title="没帮助">
                  <Button type="text" size="small" icon={<DislikeOutlined />} />
                </Tooltip>
              </Space>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染会话列表
  const renderSessionList = () => (
    <div className={styles.sessionList}>
      <div className={styles.sessionHeader}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={createNewSession}
          block
        >
          新对话
        </Button>
      </div>
      <List
        loading={loading}
        dataSource={sessions}
        renderItem={(session) => (
          <List.Item
            className={`${styles.sessionItem} ${
              currentSession?.id === session.id ? styles.activeSession : ''
            }`}
            onClick={() => selectSession(session)}
          >
            <div className={styles.sessionInfo}>
              <Text ellipsis className={styles.sessionTitle}>
                {session.title || '新对话'}
              </Text>
              <Text type="secondary" className={styles.sessionTime}>
                {session.messageCount} 条消息
              </Text>
            </div>
            {session.isPinned && (
              <PushpinOutlined className={styles.pinnedIcon} />
            )}
          </List.Item>
        )}
      />
    </div>
  );

  // 渲染聊天区域
  const renderChatArea = () => (
    <div className={styles.chatArea}>
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.welcomeContainer}>
            <RobotOutlined className={styles.welcomeIcon} />
            <Title level={3}>你好，我是AI助手</Title>
            <Paragraph type="secondary">
              我可以帮你完成任务管理、日程安排、数据分析、文档摘要等工作
            </Paragraph>
            <div className={styles.quickActions}>
              <Button onClick={() => setInputValue('帮我创建一个任务')}>
                <ThunderboltOutlined /> 创建任务
              </Button>
              <Button onClick={() => setInputValue('查看我今天的日程')}>
                <CalendarOutlined /> 查看日程
              </Button>
              <Button onClick={() => setInputValue('生成本周工作报告')}>
                <FileWordOutlined /> 生成报告
              </Button>
              <Button onClick={() => setInputValue('分析项目进度')}>
                <BarChartOutlined /> 数据分析
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className={styles.inputContainer}>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入消息，按Enter发送..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={sendingMessage}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          loading={sendingMessage}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  );

  // 渲染工作建议
  const renderSuggestions = () => (
    <div className={styles.suggestionsContainer}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <BulbOutlined /> 工作建议
        </Title>
        <Button icon={<ReloadOutlined />} onClick={loadSuggestions}>
          刷新
        </Button>
      </div>
      
      <Spin spinning={suggestionsLoading}>
        {suggestions.length === 0 ? (
          <Empty description="暂无建议" />
        ) : (
          <List
            dataSource={suggestions}
            renderItem={(item) => (
              <Card className={styles.suggestionCard} size="small">
                <div className={styles.suggestionHeader}>
                  <Tag color={
                    item.priorityLevel >= 4 ? 'red' :
                    item.priorityLevel >= 3 ? 'orange' :
                    item.priorityLevel >= 2 ? 'blue' : 'default'
                  }>
                    {item.suggestionType}
                  </Tag>
                  <Text type="secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <Title level={5}>{item.suggestionTitle}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>
                  {item.suggestionContent}
                </Paragraph>
                {item.suggestionReason && (
                  <Paragraph type="secondary" className={styles.suggestionReason}>
                    原因: {item.suggestionReason}
                  </Paragraph>
                )}
                <div className={styles.suggestionActions}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleSuggestionFeedback(item.id, true)}
                  >
                    采纳
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleSuggestionFeedback(item.id, false)}
                  >
                    忽略
                  </Button>
                </div>
              </Card>
            )}
          />
        )}
      </Spin>
    </div>
  );

  // 渲染翻译功能
  const renderTranslation = () => (
    <div className={styles.translationContainer}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <TranslationOutlined /> 翻译
        </Title>
      </div>
      
      <div className={styles.languageSelector}>
        <Select
          value={sourceLanguage}
          onChange={setSourceLanguage}
          style={{ width: 120 }}
        >
          <Select.Option value="auto">自动检测</Select.Option>
          <Select.Option value="zh">中文</Select.Option>
          <Select.Option value="en">英语</Select.Option>
          <Select.Option value="ja">日语</Select.Option>
          <Select.Option value="ko">韩语</Select.Option>
          <Select.Option value="fr">法语</Select.Option>
          <Select.Option value="de">德语</Select.Option>
        </Select>
        <span className={styles.languageArrow}>→</span>
        <Select
          value={targetLanguage}
          onChange={setTargetLanguage}
          style={{ width: 120 }}
        >
          <Select.Option value="zh">中文</Select.Option>
          <Select.Option value="en">英语</Select.Option>
          <Select.Option value="ja">日语</Select.Option>
          <Select.Option value="ko">韩语</Select.Option>
          <Select.Option value="fr">法语</Select.Option>
          <Select.Option value="de">德语</Select.Option>
        </Select>
      </div>
      
      <div className={styles.translationPanels}>
        <div className={styles.translationPanel}>
          <TextArea
            value={translateText}
            onChange={(e) => setTranslateText(e.target.value)}
            placeholder="输入要翻译的文本..."
            rows={6}
          />
        </div>
        <div className={styles.translationPanel}>
          <TextArea
            value={translateResult?.translatedText || ''}
            placeholder="翻译结果..."
            rows={6}
            readOnly
          />
        </div>
      </div>
      
      <Button
        type="primary"
        icon={<TranslationOutlined />}
        onClick={handleTranslate}
        loading={translating}
        disabled={!translateText.trim()}
      >
        翻译
      </Button>
      
      {translateResult && (
        <div className={styles.translationInfo}>
          <Text type="secondary">
            字数: {translateResult.wordCount} | 
            耗时: {translateResult.translationTimeMs}ms |
            引擎: {translateResult.translationEngine}
          </Text>
        </div>
      )}
    </div>
  );

  // 渲染文档摘要
  const renderSummary = () => (
    <div className={styles.summaryContainer}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <FileTextOutlined /> 文档摘要
        </Title>
      </div>
      
      <TextArea
        value={summaryText}
        onChange={(e) => setSummaryText(e.target.value)}
        placeholder="粘贴要生成摘要的文本..."
        rows={8}
      />
      
      <Button
        type="primary"
        icon={<FileTextOutlined />}
        onClick={handleSummarize}
        loading={summarizing}
        disabled={!summaryText.trim()}
        style={{ marginTop: 16 }}
      >
        生成摘要
      </Button>
      
      {summaryResult && (
        <Card className={styles.summaryResult} style={{ marginTop: 16 }}>
          <Title level={5}>摘要</Title>
          <Paragraph>{summaryResult.summary}</Paragraph>
          
          <Title level={5}>关键点</Title>
          <ul>
            {summaryResult.keyPoints?.map((point: string, index: number) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          
          <Divider />
          <Text type="secondary">
            原文字数: {summaryResult.wordCount} | 
            摘要字数: {summaryResult.summaryWordCount}
          </Text>
        </Card>
      )}
    </div>
  );

  // 渲染日程建议
  const renderSchedule = () => (
    <div className={styles.scheduleContainer}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <CalendarOutlined /> 日程建议
        </Title>
        <Button icon={<ReloadOutlined />} onClick={loadScheduleSuggestions}>
          刷新
        </Button>
      </div>
      
      <Spin spinning={scheduleLoading}>
        {scheduleSuggestions.length === 0 ? (
          <Empty description="暂无日程建议" />
        ) : (
          <Timeline>
            {scheduleSuggestions.map((item) => (
              <Timeline.Item
                key={item.id}
                color={
                  item.priorityLevel >= 4 ? 'red' :
                  item.priorityLevel >= 3 ? 'orange' : 'blue'
                }
              >
                <Card size="small" className={styles.scheduleCard}>
                  <div className={styles.scheduleHeader}>
                    <Tag>{item.suggestionType}</Tag>
                    <Text type="secondary">{item.suggestionDate}</Text>
                  </div>
                  <Title level={5}>{item.suggestionTitle}</Title>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {item.suggestionContent}
                  </Paragraph>
                  {item.timeSavedMinutes && (
                    <Text type="success">
                      预计节省 {item.timeSavedMinutes} 分钟
                    </Text>
                  )}
                  <div className={styles.scheduleActions}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => applyScheduleSuggestion(item.id)}
                    >
                      应用建议
                    </Button>
                  </div>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Spin>
    </div>
  );

  // 渲染工作报告
  const renderReports = () => (
    <div className={styles.reportsContainer}>
      <div className={styles.sectionHeader}>
        <Title level={4}>
          <FileWordOutlined /> 工作报告
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadReports}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setReportModalVisible(true)}
          >
            生成报告
          </Button>
        </Space>
      </div>
      
      <Spin spinning={reportsLoading}>
        {reports.length === 0 ? (
          <Empty description="暂无报告" />
        ) : (
          <List
            dataSource={reports}
            renderItem={(item) => (
              <Card className={styles.reportCard} size="small">
                <div className={styles.reportHeader}>
                  <Tag color="blue">{item.reportType}</Tag>
                  <Tag>{item.reportScope}</Tag>
                  {item.isDraft && <Tag color="orange">草稿</Tag>}
                  {item.isSent && <Tag color="green">已发送</Tag>}
                </div>
                <Title level={5}>{item.reportTitle}</Title>
                <Paragraph ellipsis={{ rows: 3 }}>
                  {item.summary || item.reportContent}
                </Paragraph>
                <div className={styles.reportFooter}>
                  <Text type="secondary">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Space>
                    <Button size="small">查看详情</Button>
                    <Button size="small" type="primary">
                      发送
                    </Button>
                  </Space>
                </div>
              </Card>
            )}
          />
        )}
      </Spin>
      
      {/* 生成报告弹窗 */}
      <Modal
        title="生成工作报告"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
      >
        <Form form={reportForm} onFinish={handleGenerateReport} layout="vertical">
          <Form.Item
            name="reportType"
            label="报告类型"
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select placeholder="选择报告类型">
              <Select.Option value="daily">日报</Select.Option>
              <Select.Option value="weekly">周报</Select.Option>
              <Select.Option value="monthly">月报</Select.Option>
              <Select.Option value="project">项目报告</Select.Option>
              <Select.Option value="custom">自定义报告</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="reportScope"
            label="报告范围"
            rules={[{ required: true, message: '请选择报告范围' }]}
          >
            <Select placeholder="选择报告范围">
              <Select.Option value="personal">个人</Select.Option>
              <Select.Option value="team">团队</Select.Option>
              <Select.Option value="project">项目</Select.Option>
              <Select.Option value="department">部门</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                生成报告
              </Button>
              <Button onClick={() => setReportModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 侧边栏 */}
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarToggle}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        {!sidebarCollapsed && renderSessionList()}
      </div>
      
      {/* 主内容区 */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <Title level={4} className={styles.pageTitle}>
            <RobotOutlined /> AI助手
          </Title>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSettingsVisible(true)}
          >
            设置
          </Button>
        </div>
        
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={<span><RobotOutlined /> 智能对话</span>}
            key="chat"
          >
            {renderChatArea()}
          </TabPane>
          
          <TabPane
            tab={<span><BulbOutlined /> 工作建议</span>}
            key="suggestions"
          >
            {renderSuggestions()}
          </TabPane>
          
          <TabPane
            tab={<span><TranslationOutlined /> 翻译</span>}
            key="translation"
          >
            {renderTranslation()}
          </TabPane>
          
          <TabPane
            tab={<span><FileTextOutlined /> 文档摘要</span>}
            key="summary"
          >
            {renderSummary()}
          </TabPane>
          
          <TabPane
            tab={<span><CalendarOutlined /> 日程建议</span>}
            key="schedule"
          >
            {renderSchedule()}
          </TabPane>
          
          <TabPane
            tab={<span><FileWordOutlined /> 工作报告</span>}
            key="reports"
          >
            {renderReports()}
          </TabPane>
        </Tabs>
      </div>
      
      {/* 设置抽屉 */}
      <Drawer
        title="AI助手设置"
        open={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        width={400}
      >
        <Form
          layout="vertical"
          initialValues={config || {}}
          onFinish={handleSaveConfig}
        >
          <Form.Item name="assistantName" label="助手名称">
            <Input placeholder="AI助手" />
          </Form.Item>
          
          <Form.Item name="defaultModel" label="默认模型">
            <Select>
              <Select.OptGroup label="豆包 (推荐)">
                <Select.Option value="doubao-pro-32k">豆包Pro 32K</Select.Option>
                <Select.Option value="doubao-pro-128k">豆包Pro 128K</Select.Option>
                <Select.Option value="doubao-lite-32k">豆包Lite 32K</Select.Option>
                <Select.Option value="doubao-lite-128k">豆包Lite 128K</Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label="Claude">
                <Select.Option value="claude-3-sonnet">Claude 3 Sonnet</Select.Option>
                <Select.Option value="claude-3-opus">Claude 3 Opus</Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label="OpenAI">
                <Select.Option value="gpt-4">GPT-4</Select.Option>
                <Select.Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Select.Option>
              </Select.OptGroup>
            </Select>
          </Form.Item>
          
          <Form.Item name="temperature" label="创造性 (Temperature)">
            <Slider min={0} max={1} step={0.1} />
          </Form.Item>
          
          <Form.Item name="maxTokens" label="最大Token数">
            <InputNumber min={100} max={8000} style={{ width: '100%' }} />
          </Form.Item>
          
          <Divider />
          
          <Form.Item name="enableContext" label="启用上下文" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item name="contextWindow" label="上下文窗口">
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="enableSuggestions" label="启用建议" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item name="enableAutoSummary" label="自动摘要" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item name="preferredLanguage" label="首选语言">
            <Select>
              <Select.Option value="zh">中文</Select.Option>
              <Select.Option value="en">英语</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AIAssistantPage;