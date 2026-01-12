'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Modal,
  Form,
  Select,
  message,
  Spin,
  Empty,
  Drawer,
  Switch,
  InputNumber,
  Slider,
  Divider,
  Timeline,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  PlusOutlined,
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  aiService,
  type ChatSession,
  type ChatMessage,
  type ChatResponse,
  type AIWorkSuggestion,
  type AITranslation,
  type DocumentSummaryResult,
  type AIScheduleSuggestion,
  type AIWorkReport,
  type AIAssistantConfig,
} from '@/services';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

const AIAssistantPage: React.FC = () => {
  // 状态管理
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [config, setConfig] = useState<AIAssistantConfig | null>(null);

  // 工作建议
  const [suggestions, setSuggestions] = useState<AIWorkSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // 翻译
  const [translateText, setTranslateText] = useState('');
  const [translateResult, setTranslateResult] = useState<AITranslation | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);

  // 文档摘要
  const [summaryText, setSummaryText] = useState('');
  const [summaryResult, setSummaryResult] = useState<DocumentSummaryResult | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  // 日程建议
  const [scheduleSuggestions, setScheduleSuggestions] = useState<AIScheduleSuggestion[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // 工作报告
  const [reports, setReports] = useState<AIWorkReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportForm] = Form.useForm();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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
      const data = await aiService.getUserSessions(50);
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
      const data = await aiService.getAssistantConfig();
      setConfig(data);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  // 创建新会话
  const createNewSession = async () => {
    try {
      const session = await aiService.createAssistantSession('general', '新对话');
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setMessages([]);
    } catch (error) {
      message.error('创建会话失败');
    }
  };

  // 选择会话
  const selectSession = async (session: ChatSession) => {
    setCurrentSession(session);
    try {
      const msgs = await aiService.getSessionMessages(session.id, 100);
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
      let response: ChatResponse;

      if (currentSession) {
        response = await aiService.sendAssistantMessage(currentSession.id, messageText);
      } else {
        response = await aiService.quickChat(messageText);
        // 如果是快速对话，创建新会话
        await loadSessions();
      }

      if (response.userMessage && response.assistantMessage) {
        setMessages((prev) => [...prev, response.userMessage!, response.assistantMessage!]);
      } else if (response.message) {
        // 兼容旧格式
        const userMsg: ChatMessage = {
          id: `msg_${Date.now()}_user`,
          role: 'user',
          content: messageText,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg, response.message]);
      }

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
      task_create: '创建任务',
      task_query: '查询任务',
      task_update: '更新任务',
      schedule_query: '查询日程',
      schedule_create: '创建日程',
      report_generate: '生成报告',
      data_analysis: '数据分析',
      document_summary: '文档摘要',
      translation: '翻译',
      general_chat: '闲聊',
    };
    return labels[intentType] || intentType;
  };

  // 加载工作建议
  const loadSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const data = await aiService.getWorkSuggestions();
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
      await aiService.feedbackSuggestion(id, accepted);
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
      const result = await aiService.translateText(translateText, sourceLanguage, targetLanguage);
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
      const result = await aiService.generateTextSummary(summaryText, 'brief');
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
      const data = await aiService.getScheduleSuggestions();
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
      await aiService.applyScheduleSuggestion(id);
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
      const data = await aiService.getWorkReports(undefined, 20);
      setReports(data);
    } catch (error) {
      console.error('加载报告失败:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  // 生成报告
  const handleGenerateReport = async (values: { reportType: string; reportScope: string; scopeId?: number }) => {
    try {
      const report = await aiService.generateWorkReport(values.reportType, values.reportScope, values.scopeId);
      message.success('报告生成成功');
      setReportModalVisible(false);
      reportForm.resetFields();
      setReports([report, ...reports]);
    } catch (error) {
      message.error('生成报告失败');
    }
  };

  // 保存配置
  const handleSaveConfig = async (values: Partial<AIAssistantConfig>) => {
    try {
      await aiService.saveAssistantConfig(values);
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
  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          style={{
            backgroundColor: isUser ? '#3B82F6' : THEME_COLOR,
            flexShrink: 0,
          }}
        />
        <div style={{ maxWidth: '70%' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: isUser ? '#3B82F6' : '#F1F5F9',
              color: isUser ? '#fff' : '#1E293B',
            }}
          >
            <Paragraph style={{ margin: 0, color: 'inherit' }}>{msg.content}</Paragraph>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(msg.timestamp || msg.createdAt || '').toLocaleTimeString()}
            </Text>
            {!isUser && (
              <Space size={4}>
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={createNewSession} block style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
          新对话
        </Button>
      </div>
      <List
        loading={loading}
        dataSource={sessions}
        style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}
        renderItem={(session) => (
          <List.Item
            style={{
              cursor: 'pointer',
              padding: '12px',
              borderRadius: 8,
              marginBottom: 4,
              backgroundColor: currentSession?.id === session.id ? `${THEME_COLOR}15` : 'transparent',
              border: currentSession?.id === session.id ? `1px solid ${THEME_COLOR}` : '1px solid transparent',
            }}
            onClick={() => selectSession(session)}
          >
            <div style={{ width: '100%' }}>
              <Text ellipsis style={{ fontWeight: currentSession?.id === session.id ? 600 : 400 }}>
                {session.title || '新对话'}
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {session.messageCount || 0} 条消息
                </Text>
              </div>
            </div>
            {session.isPinned && <PushpinOutlined style={{ color: THEME_COLOR }} />}
          </List.Item>
        )}
      />
    </div>
  );

  // 渲染聊天区域
  const renderChatArea = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <RobotOutlined style={{ fontSize: 64, color: THEME_COLOR, marginBottom: 24 }} />
            <Title level={3}>你好，我是AI助手</Title>
            <Paragraph type="secondary">我可以帮你完成任务管理、日程安排、数据分析、文档摘要等工作</Paragraph>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
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

      <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: 12 }}>
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
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={sendingMessage}
            disabled={!inputValue.trim()}
            style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );

  // 渲染工作建议
  const renderSuggestions = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <BulbOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> 工作建议
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
              <Card style={{ marginBottom: 16, borderRadius: 12 }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Tag
                    color={item.priorityLevel >= 4 ? 'red' : item.priorityLevel >= 3 ? 'orange' : item.priorityLevel >= 2 ? 'blue' : 'default'}
                  >
                    {item.suggestionType}
                  </Tag>
                  <Text type="secondary">{new Date(item.createdAt).toLocaleDateString()}</Text>
                </div>
                <Title level={5}>{item.suggestionTitle}</Title>
                <Paragraph ellipsis={{ rows: 2 }}>{item.suggestionContent}</Paragraph>
                {item.suggestionReason && (
                  <Paragraph type="secondary" style={{ fontSize: 12 }}>
                    原因: {item.suggestionReason}
                  </Paragraph>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleSuggestionFeedback(item.id, true)}
                    style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
                  >
                    采纳
                  </Button>
                  <Button size="small" onClick={() => handleSuggestionFeedback(item.id, false)}>
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
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <TranslationOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> 翻译
      </Title>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Select value={sourceLanguage} onChange={setSourceLanguage} style={{ width: 120 }}>
          <Select.Option value="auto">自动检测</Select.Option>
          <Select.Option value="zh">中文</Select.Option>
          <Select.Option value="en">英语</Select.Option>
          <Select.Option value="ja">日语</Select.Option>
          <Select.Option value="ko">韩语</Select.Option>
          <Select.Option value="fr">法语</Select.Option>
          <Select.Option value="de">德语</Select.Option>
        </Select>
        <span style={{ color: '#94A3B8' }}>→</span>
        <Select value={targetLanguage} onChange={setTargetLanguage} style={{ width: 120 }}>
          <Select.Option value="zh">中文</Select.Option>
          <Select.Option value="en">英语</Select.Option>
          <Select.Option value="ja">日语</Select.Option>
          <Select.Option value="ko">韩语</Select.Option>
          <Select.Option value="fr">法语</Select.Option>
          <Select.Option value="de">德语</Select.Option>
        </Select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <TextArea value={translateText} onChange={(e) => setTranslateText(e.target.value)} placeholder="输入要翻译的文本..." rows={6} />
        <TextArea value={translateResult?.translatedText || ''} placeholder="翻译结果..." rows={6} readOnly />
      </div>

      <Button
        type="primary"
        icon={<TranslationOutlined />}
        onClick={handleTranslate}
        loading={translating}
        disabled={!translateText.trim()}
        style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
      >
        翻译
      </Button>

      {translateResult && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            字数: {translateResult.wordCount} | 耗时: {translateResult.translationTimeMs}ms | 引擎: {translateResult.translationEngine}
          </Text>
        </div>
      )}
    </div>
  );

  // 渲染文档摘要
  const renderSummary = () => (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        <FileTextOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> 文档摘要
      </Title>

      <TextArea
        value={summaryText}
        onChange={(e) => setSummaryText(e.target.value)}
        placeholder="粘贴要生成摘要的文本..."
        rows={8}
        style={{ marginBottom: 16 }}
      />

      <Button
        type="primary"
        icon={<FileTextOutlined />}
        onClick={handleSummarize}
        loading={summarizing}
        disabled={!summaryText.trim()}
        style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
      >
        生成摘要
      </Button>

      {summaryResult && (
        <Card style={{ marginTop: 16, borderRadius: 12 }}>
          <Title level={5}>摘要</Title>
          <Paragraph>{summaryResult.summary}</Paragraph>

          <Title level={5}>关键点</Title>
          <ul>
            {summaryResult.keyPoints?.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>

          <Divider />
          <Text type="secondary">
            原文字数: {summaryResult.wordCount} | 摘要字数: {summaryResult.summaryWordCount}
          </Text>
        </Card>
      )}
    </div>
  );

  // 渲染日程建议
  const renderSchedule = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <CalendarOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> 日程建议
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
              <Timeline.Item key={item.id} color={item.priorityLevel >= 4 ? 'red' : item.priorityLevel >= 3 ? 'orange' : 'blue'}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Tag>{item.suggestionType}</Tag>
                    <Text type="secondary">{item.suggestionDate}</Text>
                  </div>
                  <Title level={5}>{item.suggestionTitle}</Title>
                  <Paragraph ellipsis={{ rows: 2 }}>{item.suggestionContent}</Paragraph>
                  {item.timeSavedMinutes && <Text type="success">预计节省 {item.timeSavedMinutes} 分钟</Text>}
                  <div style={{ marginTop: 12 }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => applyScheduleSuggestion(item.id)}
                      style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}
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
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <FileWordOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> 工作报告
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadReports}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setReportModalVisible(true)} style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
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
              <Card style={{ marginBottom: 16, borderRadius: 12 }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <Tag color="blue">{item.reportType}</Tag>
                    <Tag>{item.reportScope}</Tag>
                    {item.isDraft && <Tag color="orange">草稿</Tag>}
                    {item.isSent && <Tag color="green">已发送</Tag>}
                  </Space>
                </div>
                <Title level={5}>{item.reportTitle}</Title>
                <Paragraph ellipsis={{ rows: 3 }}>{item.summary || item.reportContent}</Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Text>
                  <Space>
                    <Button size="small">查看详情</Button>
                    <Button size="small" type="primary" style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
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
      <Modal title="生成工作报告" open={reportModalVisible} onCancel={() => setReportModalVisible(false)} footer={null}>
        <Form form={reportForm} onFinish={handleGenerateReport} layout="vertical">
          <Form.Item name="reportType" label="报告类型" rules={[{ required: true, message: '请选择报告类型' }]}>
            <Select placeholder="选择报告类型">
              <Select.Option value="daily">日报</Select.Option>
              <Select.Option value="weekly">周报</Select.Option>
              <Select.Option value="monthly">月报</Select.Option>
              <Select.Option value="project">项目报告</Select.Option>
              <Select.Option value="custom">自定义报告</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="reportScope" label="报告范围" rules={[{ required: true, message: '请选择报告范围' }]}>
            <Select placeholder="选择报告范围">
              <Select.Option value="personal">个人</Select.Option>
              <Select.Option value="team">团队</Select.Option>
              <Select.Option value="project">项目</Select.Option>
              <Select.Option value="department">部门</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
                生成报告
              </Button>
              <Button onClick={() => setReportModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // Tab 配置
  const tabItems = [
    {
      key: 'chat',
      label: (
        <span>
          <RobotOutlined /> 智能对话
        </span>
      ),
      children: renderChatArea(),
    },
    {
      key: 'suggestions',
      label: (
        <span>
          <BulbOutlined /> 工作建议
        </span>
      ),
      children: renderSuggestions(),
    },
    {
      key: 'translation',
      label: (
        <span>
          <TranslationOutlined /> 翻译
        </span>
      ),
      children: renderTranslation(),
    },
    {
      key: 'summary',
      label: (
        <span>
          <FileTextOutlined /> 文档摘要
        </span>
      ),
      children: renderSummary(),
    },
    {
      key: 'schedule',
      label: (
        <span>
          <CalendarOutlined /> 日程建议
        </span>
      ),
      children: renderSchedule(),
    },
    {
      key: 'reports',
      label: (
        <span>
          <FileWordOutlined /> 工作报告
        </span>
      ),
      children: renderReports(),
    },
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 16 }}>
      {/* 侧边栏 */}
      <div
        style={{
          width: sidebarCollapsed ? 48 : 280,
          backgroundColor: '#fff',
          borderRadius: 12,
          transition: 'width 0.2s',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '12px 8px', borderBottom: '1px solid #E2E8F0' }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        {!sidebarCollapsed && renderSessionList()}
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8, color: THEME_COLOR }} /> AI助手
          </Title>
          <Button icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)}>
            设置
          </Button>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} style={{ height: '100%' }} tabBarStyle={{ padding: '0 24px', margin: 0 }} />
        </div>
      </div>

      {/* 设置抽屉 */}
      <Drawer title="AI助手设置" open={settingsVisible} onClose={() => setSettingsVisible(false)} width={400}>
        <Form layout="vertical" initialValues={config || {}} onFinish={handleSaveConfig}>
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
            <Button type="primary" htmlType="submit" block style={{ background: THEME_COLOR, borderColor: THEME_COLOR }}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AIAssistantPage;