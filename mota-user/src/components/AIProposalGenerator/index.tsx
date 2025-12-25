import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Select,
  Input,
  Button,
  Space,
  Typography,
  Spin,
  message,
  Tabs,
  List,
  Tag,
  Progress,
  Divider,
  Modal,
  Rate,
  Empty
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  FileTextOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  StarOutlined,
  CopyOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import * as aiProposalApi from '../../services/api/aiProposal';
import styles from './index.module.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIProposalGeneratorProps {
  projectId?: number;
  userId: number;
  onProposalGenerated?: (proposal: string) => void;
}

const AIProposalGenerator: React.FC<AIProposalGeneratorProps> = ({
  projectId,
  userId,
  onProposalGenerated
}) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [proposalType, setProposalType] = useState<string>('project');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentProposal, setCurrentProposal] = useState<string>('');
  const [evaluation, setEvaluation] = useState<aiProposalApi.ProposalEvaluation | null>(null);
  const [templates, setTemplates] = useState<aiProposalApi.ProposalTemplate[]>([]);
  const [taskSuggestions, setTaskSuggestions] = useState<aiProposalApi.TaskSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const proposalTypes = aiProposalApi.proposalTypes;

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTemplates = async () => {
    try {
      const response = await aiProposalApi.getProposalTemplates();
      setTemplates(response || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      message.warning('请输入需求描述');
      return;
    }

    setLoading(true);
    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      let proposal: string;
      switch (proposalType) {
        case 'project':
          proposal = await aiProposalApi.generateProjectProposal(inputText, 'general');
          break;
        case 'technical':
          proposal = await aiProposalApi.generateTechnicalProposal(inputText, ['general']);
          break;
        case 'marketing':
          proposal = await aiProposalApi.generateMarketingProposal(inputText, 'general');
          break;
        case 'business':
          proposal = await aiProposalApi.generateBusinessPlan(inputText, 'general', 'medium');
          break;
        case 'report':
          proposal = await aiProposalApi.generateWorkReport(projectId || 0, 'weekly', 'current');
          break;
        default:
          proposal = await aiProposalApi.generateProjectProposal(inputText, 'general');
      }

      setCurrentProposal(proposal);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: proposal,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // 创建会话用于后续优化
      const newSessionId = await aiProposalApi.startProposalSession(userId, proposalType);
      setSessionId(newSessionId);

      // 获取方案评估
      const evalResult = await aiProposalApi.evaluateProposal(proposal);
      setEvaluation(evalResult);

      if (onProposalGenerated) {
        onProposalGenerated(proposal);
      }
    } catch (error) {
      message.error('生成方案失败，请重试');
      console.error('Generate proposal error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (direction: string) => {
    if (!currentProposal) {
      message.warning('请先生成方案');
      return;
    }

    setLoading(true);
    try {
      const optimizedProposal = await aiProposalApi.optimizeProposal(currentProposal, direction);
      setCurrentProposal(optimizedProposal);

      const userMessage: Message = {
        role: 'user',
        content: `请按照"${direction}"方向优化方案`,
        timestamp: new Date()
      };
      const assistantMessage: Message = {
        role: 'assistant',
        content: optimizedProposal,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage, assistantMessage]);

      // 重新评估
      const evalResult = await aiProposalApi.evaluateProposal(optimizedProposal);
      setEvaluation(evalResult);
    } catch (error) {
      message.error('优化方案失败');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueDialogue = async () => {
    if (!sessionId || !inputText.trim()) {
      message.warning('请输入您的问题或建议');
      return;
    }

    setLoading(true);
    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const reply = await aiProposalApi.continueProposalSession(sessionId, inputText);

      const assistantMessage: Message = {
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // 如果回复看起来像是完整方案，更新当前方案
      if (reply.length > 500) {
        setCurrentProposal(reply);
      }
    } catch (error) {
      message.error('对话失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTaskSuggestions = async () => {
    if (!projectId) {
      message.warning('请先选择项目');
      return;
    }

    setLoading(true);
    try {
      const suggestions = await aiProposalApi.suggestTasks(projectId);
      setTaskSuggestions(suggestions || []);
      setActiveTab('suggestions');
    } catch (error) {
      message.error('获取任务建议失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProposal = () => {
    if (currentProposal) {
      navigator.clipboard.writeText(currentProposal);
      message.success('已复制到剪贴板');
    }
  };

  const handleExportProposal = () => {
    if (currentProposal) {
      const blob = new Blob([currentProposal], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal_${proposalType}_${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('导出成功');
    }
  };

  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要清空当前对话和方案吗？',
      onOk: () => {
        setMessages([]);
        setCurrentProposal('');
        setEvaluation(null);
        setSessionId(null);
        setInputText('');
      }
    });
  };

  const getProposalTypeLabel = (type: string): string => {
    const found = proposalTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const renderMessages = () => (
    <div className={styles.messagesContainer}>
      {messages.length === 0 ? (
        <Empty
          image={<RobotOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
          description="开始与AI助手对话，生成您需要的方案"
        />
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
          >
            <div className={styles.messageHeader}>
              {msg.role === 'user' ? (
                <Tag color="blue">您</Tag>
              ) : (
                <Tag color="green" icon={<RobotOutlined />}>AI助手</Tag>
              )}
              <Text type="secondary" className={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString()}
              </Text>
            </div>
            <div className={styles.messageContent}>
              {msg.role === 'assistant' ? (
                <Paragraph
                  ellipsis={{ rows: 10, expandable: true, symbol: '展开' }}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </Paragraph>
              ) : (
                <Text>{msg.content}</Text>
              )}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const renderEvaluation = () => {
    if (!evaluation) return null;

    return (
      <Card size="small" className={styles.evaluationCard}>
        <Title level={5}>
          <StarOutlined /> 方案评估
        </Title>
        <div className={styles.evaluationScores}>
          <div className={styles.scoreItem}>
            <Text>完整性</Text>
            <Progress
              percent={evaluation.completeness}
              size="small"
              status={evaluation.completeness >= 80 ? 'success' : 'normal'}
            />
          </div>
          <div className={styles.scoreItem}>
            <Text>可行性</Text>
            <Progress
              percent={evaluation.feasibility}
              size="small"
              status={evaluation.feasibility >= 80 ? 'success' : 'normal'}
            />
          </div>
          <div className={styles.scoreItem}>
            <Text>清晰度</Text>
            <Progress
              percent={evaluation.clarity}
              size="small"
              status={evaluation.clarity >= 80 ? 'success' : 'normal'}
            />
          </div>
          <div className={styles.scoreItem}>
            <Text>综合评分</Text>
            <Rate disabled value={evaluation.score / 20} allowHalf />
            <Text strong style={{ marginLeft: 8 }}>
              {aiProposalApi.formatEvaluationScore(evaluation.score)}
            </Text>
          </div>
        </div>
        {evaluation.suggestions && evaluation.suggestions.length > 0 && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong>改进建议：</Text>
            <ul className={styles.suggestionList}>
              {evaluation.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </>
        )}
      </Card>
    );
  };

  const renderOptimizeButtons = () => {
    if (!currentProposal) return null;

    return (
      <div className={styles.optimizeButtons}>
        <Text type="secondary">快速优化：</Text>
        <Space wrap>
          <Button size="small" onClick={() => handleOptimize('更详细')}>
            更详细
          </Button>
          <Button size="small" onClick={() => handleOptimize('更简洁')}>
            更简洁
          </Button>
          <Button size="small" onClick={() => handleOptimize('更专业')}>
            更专业
          </Button>
          <Button size="small" onClick={() => handleOptimize('更创新')}>
            更创新
          </Button>
          <Button size="small" onClick={() => handleOptimize('增加数据支撑')}>
            增加数据
          </Button>
        </Space>
      </div>
    );
  };

  const renderTemplates = () => (
    <List
      dataSource={templates}
      renderItem={template => (
        <List.Item
          actions={[
            <Button
              key="use"
              type="link"
              onClick={() => {
                setProposalType(template.type);
                setInputText(template.description);
                setActiveTab('generate');
              }}
            >
              使用模板
            </Button>
          ]}
        >
          <List.Item.Meta
            avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
            title={template.name}
            description={
              <>
                <Text type="secondary">{template.description}</Text>
                <br />
                <Tag color="blue">{getProposalTypeLabel(template.type)}</Tag>
              </>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderTaskSuggestions = () => (
    <List
      dataSource={taskSuggestions}
      locale={{ emptyText: '暂无任务建议' }}
      renderItem={suggestion => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Tag color={
                suggestion.priority === 'high' ? 'red' :
                suggestion.priority === 'medium' ? 'orange' : 'green'
              }>
                {suggestion.priority === 'high' ? '高' :
                 suggestion.priority === 'medium' ? '中' : '低'}
              </Tag>
            }
            title={suggestion.title}
            description={
              <>
                <Text>{suggestion.description}</Text>
                <br />
                <Text type="secondary">
                  原因: {suggestion.reason}
                </Text>
              </>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <Title level={4}>
          <RobotOutlined /> AI方案生成器
        </Title>
        <Space>
          {projectId && (
            <Button
              icon={<BulbOutlined />}
              onClick={handleGetTaskSuggestions}
              loading={loading}
            >
              获取任务建议
            </Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={<span><ThunderboltOutlined />生成方案</span>}
          key="generate"
        >
          <div className={styles.generatePanel}>
            <div className={styles.inputSection}>
              <Space style={{ marginBottom: 16 }}>
                <Text>方案类型：</Text>
                <Select
                  value={proposalType}
                  onChange={setProposalType}
                  style={{ width: 150 }}
                  options={proposalTypes}
                />
              </Space>

              {renderMessages()}

              {renderOptimizeButtons()}

              <div className={styles.inputArea}>
                <TextArea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={
                    sessionId
                      ? "继续对话，提出您的问题或修改建议..."
                      : "请描述您的需求，AI将为您生成专业方案..."
                  }
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  onPressEnter={e => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      sessionId ? handleContinueDialogue() : handleGenerate();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sessionId ? handleContinueDialogue : handleGenerate}
                  loading={loading}
                  className={styles.sendButton}
                >
                  {sessionId ? '发送' : '生成方案'}
                </Button>
              </div>
            </div>

            <div className={styles.sidePanel}>
              {renderEvaluation()}
              
              {currentProposal && (
                <Card size="small" className={styles.actionsCard}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      block
                      icon={<CopyOutlined />}
                      onClick={handleCopyProposal}
                    >
                      复制方案
                    </Button>
                    <Button
                      block
                      icon={<DownloadOutlined />}
                      onClick={handleExportProposal}
                    >
                      导出为Markdown
                    </Button>
                  </Space>
                </Card>
              )}
            </div>
          </div>
        </TabPane>

        <TabPane
          tab={<span><FileTextOutlined />方案模板</span>}
          key="templates"
        >
          {renderTemplates()}
        </TabPane>

        <TabPane
          tab={<span><BulbOutlined />任务建议</span>}
          key="suggestions"
        >
          {renderTaskSuggestions()}
        </TabPane>

        <TabPane
          tab={<span><HistoryOutlined />历史记录</span>}
          key="history"
        >
          <Empty description="历史记录功能开发中" />
        </TabPane>
      </Tabs>

      {loading && (
        <div className={styles.loadingOverlay}>
          <Spin size="large" tip="AI正在思考中..." />
        </div>
      )}
    </Card>
  );
};

export default AIProposalGenerator;