'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Tabs,
  List,
  Avatar,
  Tag,
  Space,
  Dropdown,
  Empty,
  Spin,
  message,
  Modal,
  Select,
  Tooltip,
  Progress,
  Row,
  Col,
  Collapse,
  Switch,
  Slider,
  Divider,
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  PlusOutlined,
  HistoryOutlined,
  SettingOutlined,
  DeleteOutlined,
  CopyOutlined,
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  ExportOutlined,
  SoundOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ExpandOutlined,
  CompressOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  feedback?: 'like' | 'dislike';
  references?: Array<{
    type: 'document' | 'task' | 'project';
    id: string;
    title: string;
  }>;
}

// 会话类型
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
  starred: boolean;
}

// AI能力类型
interface AICapability {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
}

// AI能力配置
const aiCapabilities: AICapability[] = [
  {
    key: 'task',
    name: '任务助手',
    description: '帮助创建、分解、优化任务',
    icon: <ProjectOutlined />,
    examples: ['帮我创建一个用户登录功能的任务', '分解这个需求为子任务', '优化任务描述'],
  },
  {
    key: 'document',
    name: '文档助手',
    description: '帮助撰写、总结、翻译文档',
    icon: <FileTextOutlined />,
    examples: ['帮我写一份技术方案', '总结这篇文档的要点', '翻译成英文'],
  },
  {
    key: 'analysis',
    name: '数据分析',
    description: '分析项目数据，提供洞察',
    icon: <BulbOutlined />,
    examples: ['分析项目进度风险', '团队效率报告', '预测项目完成时间'],
  },
  {
    key: 'search',
    name: '智能搜索',
    description: '在知识库中搜索相关内容',
    icon: <SearchOutlined />,
    examples: ['搜索API文档', '查找相关的设计规范', '找到类似的解决方案'],
  },
  {
    key: 'schedule',
    name: '日程助手',
    description: '帮助安排和优化日程',
    icon: <CalendarOutlined />,
    examples: ['安排明天的会议', '优化本周日程', '找一个合适的会议时间'],
  },
  {
    key: 'team',
    name: '团队协作',
    description: '协助团队沟通和协作',
    icon: <TeamOutlined />,
    examples: ['生成周报', '总结会议纪要', '分配任务给团队成员'],
  },
];

export default function AIPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('chat');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取会话列表
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      try {
        const { aiService } = await import('@/services');
        return await aiService.getConversations();
      } catch {
        return [];
      }
    },
  });

  // 获取当前会话消息
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['ai-messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      try {
        const { aiService } = await import('@/services');
        return await aiService.getConversationMessages(currentConversationId);
      } catch {
        return [];
      }
    },
    enabled: !!currentConversationId,
  });

  // 获取AI建议
  const { data: suggestions } = useQuery({
    queryKey: ['ai-suggestions'],
    queryFn: async () => {
      try {
        const { aiService } = await import('@/services');
        return await aiService.getSuggestions();
      } catch {
        return [];
      }
    },
  });

  // 发送消息
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsTyping(true);
      try {
        const { aiService } = await import('@/services');
        const response = await aiService.sendMessage(currentConversationId, content);
        setIsTyping(false);
        return response;
      } catch (error) {
        setIsTyping(false);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages'] });
      setInputValue('');
    },
    onError: () => {
      message.error('发送失败，请重试');
    },
  });

  // 创建新会话
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const { aiService } = await import('@/services');
      return await aiService.createConversation();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setCurrentConversationId(data.id);
    },
    onError: () => {
      message.error('创建会话失败');
    },
  });

  // 删除会话
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { aiService } = await import('@/services');
      await aiService.deleteConversation(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (currentConversationId) {
        setCurrentConversationId(null);
      }
      message.success('会话已删除');
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  // 反馈
  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, feedback }: { messageId: string; feedback: 'like' | 'dislike' }) => {
      const { aiService } = await import('@/services');
      await aiService.feedbackMessage(messageId, feedback);
      return { messageId, feedback };
    },
    onSuccess: () => {
      message.success('感谢您的反馈');
    },
    onError: () => {
      message.error('反馈提交失败');
    },
  });

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 处理发送
  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (!currentConversationId) {
      createConversationMutation.mutate();
    }
    sendMessageMutation.mutate(inputValue);
  };

  // 处理快捷提问
  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    if (!currentConversationId) {
      createConversationMutation.mutate();
    }
  };

  // 渲染消息
  const renderMessage = (msg: Message) => (
    <div
      key={msg.id}
      className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {msg.role === 'assistant' && (
        <Avatar
          icon={<RobotOutlined />}
          className="mr-3 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500"
        />
      )}
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          msg.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <div className="whitespace-pre-wrap">{msg.content}</div>
        {msg.references && msg.references.length > 0 && (
          <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
            <Text type="secondary" className="text-xs">
              参考来源：
            </Text>
            <div className="mt-1 flex flex-wrap gap-1">
              {msg.references.map((ref) => (
                <Tag key={ref.id} className="cursor-pointer text-xs">
                  {ref.type === 'document' && <FileTextOutlined className="mr-1" />}
                  {ref.type === 'task' && <ProjectOutlined className="mr-1" />}
                  {ref.type === 'project' && <TeamOutlined className="mr-1" />}
                  {ref.title}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {msg.role === 'assistant' && (
          <div className="mt-2 flex items-center gap-2">
            <Tooltip title="有帮助">
              <Button
                type="text"
                size="small"
                icon={<LikeOutlined />}
                onClick={() => feedbackMutation.mutate({ messageId: msg.id, feedback: 'like' })}
              />
            </Tooltip>
            <Tooltip title="没帮助">
              <Button
                type="text"
                size="small"
                icon={<DislikeOutlined />}
                onClick={() => feedbackMutation.mutate({ messageId: msg.id, feedback: 'dislike' })}
              />
            </Tooltip>
            <Tooltip title="复制">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(msg.content);
                  message.success('已复制到剪贴板');
                }}
              />
            </Tooltip>
            <Tooltip title="重新生成">
              <Button type="text" size="small" icon={<ReloadOutlined />} />
            </Tooltip>
          </div>
        )}
        <div className="mt-1 text-right text-xs opacity-60">
          {dayjs(msg.timestamp).format('HH:mm')}
        </div>
      </div>
      {msg.role === 'user' && (
        <Avatar className="ml-3 flex-shrink-0 bg-blue-500">我</Avatar>
      )}
    </div>
  );

  return (
    <div className={`ai-page ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* 页面标题 */}
      {!isFullscreen && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Title level={3} className="mb-1">
              <RobotOutlined className="mr-2" />
              AI 助手
            </Title>
            <Text type="secondary">智能助手，提升工作效率</Text>
          </div>
          <Space>
            <Button icon={<HistoryOutlined />}>历史记录</Button>
            <Button icon={<SettingOutlined />} onClick={() => setIsSettingsOpen(true)}>
              设置
            </Button>
          </Space>
        </div>
      )}

      <div className={`flex gap-6 ${isFullscreen ? 'h-full p-4' : ''}`}>
        {/* 左侧会话列表 */}
        <Card className={`w-72 flex-shrink-0 ${isFullscreen ? 'h-full' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <Text strong>对话列表</Text>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => createConversationMutation.mutate()}
            >
              新对话
            </Button>
          </div>
          <List
            dataSource={conversations}
            renderItem={(conv) => (
              <List.Item
                className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setCurrentConversationId(conv.id)}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <Text strong ellipsis className="flex-1">
                      {conv.starred && <StarFilled className="mr-1 text-yellow-500" />}
                      {conv.title}
                    </Text>
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'star', label: conv.starred ? '取消收藏' : '收藏', icon: <StarOutlined /> },
                          { key: 'rename', label: '重命名', icon: <EditOutlined /> },
                          { key: 'export', label: '导出', icon: <ExportOutlined /> },
                          { type: 'divider' },
                          { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
                        ],
                        onClick: ({ key }) => {
                          if (key === 'delete') {
                            deleteConversationMutation.mutate(conv.id);
                          }
                        },
                      }}
                      trigger={['click']}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                  <Text type="secondary" ellipsis className="text-xs">
                    {conv.lastMessage}
                  </Text>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <span>{conv.messageCount} 条消息</span>
                    <span>{dayjs(conv.updatedAt).fromNow()}</span>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* 右侧聊天区域 */}
        <div className="flex flex-1 flex-col">
          {/* 聊天头部 */}
          <Card className="mb-4" size="small">
            <div className="flex items-center justify-between">
              <Space>
                <RobotOutlined className="text-xl text-purple-500" />
                <Text strong>
                  {currentConversationId
                    ? conversations?.find((c) => c.id === currentConversationId)?.title
                    : '新对话'}
                </Text>
              </Space>
              <Space>
                <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
                  <Button
                    type="text"
                    icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  />
                </Tooltip>
              </Space>
            </div>
          </Card>

          {/* 消息区域 */}
          <Card
            className="mb-4 flex-1 overflow-hidden"
            bodyStyle={{ height: '100%', overflow: 'auto', padding: 16 }}
          >
            {!currentConversationId ? (
              // 欢迎界面
              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-8 text-center">
                  <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <RobotOutlined className="text-4xl text-white" />
                  </div>
                  <Title level={4}>你好，我是摩塔AI助手</Title>
                  <Text type="secondary">我可以帮助你完成各种工作任务</Text>
                </div>

                {/* AI能力卡片 */}
                <div className="grid w-full max-w-3xl grid-cols-3 gap-4">
                  {aiCapabilities.map((cap) => (
                    <Card
                      key={cap.key}
                      hoverable
                      size="small"
                      className="cursor-pointer"
                      onClick={() => handleQuickQuestion(cap.examples[0])}
                    >
                      <div className="text-center">
                        <div className="mb-2 text-2xl text-purple-500">{cap.icon}</div>
                        <Text strong>{cap.name}</Text>
                        <div className="mt-1 text-xs text-gray-500">{cap.description}</div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* AI建议 */}
                {suggestions && suggestions.length > 0 && (
                  <div className="mt-8 w-full max-w-3xl">
                    <Text strong className="mb-2 block">
                      <BulbOutlined className="mr-1" />
                      智能建议
                    </Text>
                    <div className="space-y-2">
                      {suggestions.map((sug) => (
                        <Card
                          key={sug.id}
                          size="small"
                          hoverable
                          className="cursor-pointer"
                          onClick={() => handleQuickQuestion(`关于"${sug.title}"，请详细说明`)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <Tag
                                color={
                                  sug.priority === 'high'
                                    ? 'red'
                                    : sug.priority === 'medium'
                                    ? 'orange'
                                    : 'blue'
                                }
                              >
                                {sug.title}
                              </Tag>
                              <Text className="ml-2">{sug.content}</Text>
                            </div>
                            <Button type="link" size="small">
                              查看详情
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : isLoadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <Spin />
              </div>
            ) : (
              <div>
                {messages?.map(renderMessage)}
                {isTyping && (
                  <div className="mb-4 flex justify-start">
                    <Avatar
                      icon={<RobotOutlined />}
                      className="mr-3 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Card>

          {/* 输入区域 */}
          <Card size="small">
            <div className="flex gap-2">
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入你的问题..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={sendMessageMutation.isPending}
                disabled={!inputValue.trim()}
              >
                发送
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>按 Enter 发送，Shift + Enter 换行</span>
              <Space>
                <Tooltip title="语音输入">
                  <Button type="text" size="small" icon={<SoundOutlined />} />
                </Tooltip>
                <Tooltip title="上传文件">
                  <Button type="text" size="small" icon={<FileTextOutlined />} />
                </Tooltip>
              </Space>
            </div>
          </Card>
        </div>
      </div>

      {/* 设置弹窗 */}
      <Modal
        title="AI 设置"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsSettingsOpen(false)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => setIsSettingsOpen(false)}>
            保存
          </Button>,
        ]}
        width={500}
      >
        <div className="space-y-6">
          <div>
            <Text strong>AI 模型</Text>
            <Select defaultValue="gpt-4" className="mt-2 w-full">
              <Select.Option value="gpt-4">GPT-4 (推荐)</Select.Option>
              <Select.Option value="gpt-3.5">GPT-3.5 Turbo</Select.Option>
              <Select.Option value="claude">Claude 3</Select.Option>
            </Select>
          </div>

          <div>
            <Text strong>回复风格</Text>
            <Select defaultValue="balanced" className="mt-2 w-full">
              <Select.Option value="concise">简洁</Select.Option>
              <Select.Option value="balanced">平衡</Select.Option>
              <Select.Option value="detailed">详细</Select.Option>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Text strong>创造性</Text>
              <Text type="secondary">0.7</Text>
            </div>
            <Slider defaultValue={70} className="mt-2" />
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <Text strong>自动保存对话</Text>
              <div className="text-xs text-gray-500">自动保存所有对话记录</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Text strong>显示参考来源</Text>
              <div className="text-xs text-gray-500">在回复中显示引用的文档和任务</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Text strong>智能建议</Text>
              <div className="text-xs text-gray-500">根据工作内容提供智能建议</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Modal>
    </div>
  );
}