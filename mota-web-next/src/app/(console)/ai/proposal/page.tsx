'use client';

import React, { useState, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Input,
  Select,
  Steps,
  Form,
  Upload,
  Tag,
  Typography,
  Divider,
  List,
  Avatar,
  Progress,
  Tooltip,
  Modal,
  Drawer,
  Tabs,
  Empty,
  Spin,
  message,
  Alert,
} from 'antd';
import {
  FileTextOutlined,
  RobotOutlined,
  EditOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  HistoryOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileMarkdownOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SendOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 方案类型
interface Proposal {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  content: string;
  outline: ProposalSection[];
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  isFavorite: boolean;
  version: number;
}

// 方案章节
interface ProposalSection {
  id: string;
  title: string;
  content: string;
  level: number;
  order: number;
  suggestions?: string[];
}

// 方案模板
interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: string[];
  icon: string;
}

// 生成历史
interface GenerationHistory {
  id: string;
  title: string;
  type: string;
  status: 'completed' | 'failed';
  createdAt: string;
  wordCount: number;
}

// 方案模板配置
const proposalTemplates: ProposalTemplate[] = [
  {
    id: '1',
    name: '项目立项报告',
    description: '用于新项目立项申请的标准报告模板',
    category: '项目管理',
    sections: ['项目背景', '项目目标', '实施方案', '资源需求', '风险分析', '预期收益'],
    icon: '📋',
  },
  {
    id: '2',
    name: '技术方案',
    description: '技术实现方案的详细设计文档',
    category: '技术文档',
    sections: ['需求分析', '技术选型', '架构设计', '详细设计', '实施计划', '测试方案'],
    icon: '🔧',
  },
  {
    id: '3',
    name: '商业计划书',
    description: '创业或新业务的商业计划书模板',
    category: '商业文档',
    sections: ['执行摘要', '市场分析', '产品服务', '营销策略', '运营计划', '财务预测'],
    icon: '💼',
  },
  {
    id: '4',
    name: '工作总结报告',
    description: '周期性工作总结和汇报模板',
    category: '工作汇报',
    sections: ['工作概述', '主要成果', '问题分析', '经验教训', '下阶段计划'],
    icon: '📊',
  },
  {
    id: '5',
    name: '需求分析文档',
    description: '产品或项目需求分析文档模板',
    category: '产品文档',
    sections: ['背景介绍', '用户分析', '功能需求', '非功能需求', '优先级排序', '验收标准'],
    icon: '📝',
  },
  {
    id: '6',
    name: '培训方案',
    description: '员工培训计划和方案模板',
    category: '人力资源',
    sections: ['培训目标', '培训对象', '培训内容', '培训方式', '时间安排', '效果评估'],
    icon: '🎓',
  },
];

export default function AIProposalPage() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null);
  const [generatingProposal, setGeneratingProposal] = useState<Proposal | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSection, setEditingSection] = useState<ProposalSection | null>(null);
  const [form] = Form.useForm();
  const contentRef = useRef<HTMLDivElement>(null);

  // 获取生成历史
  const { data: historyData } = useQuery({
    queryKey: ['proposal-history'],
    queryFn: async (): Promise<GenerationHistory[]> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          title: '2024年Q1项目立项报告',
          type: '项目立项报告',
          status: 'completed',
          createdAt: dayjs().subtract(1, 'day').toISOString(),
          wordCount: 3500,
        },
        {
          id: '2',
          title: '微服务架构技术方案',
          type: '技术方案',
          status: 'completed',
          createdAt: dayjs().subtract(3, 'day').toISOString(),
          wordCount: 5200,
        },
        {
          id: '3',
          title: '新产品商业计划书',
          type: '商业计划书',
          status: 'completed',
          createdAt: dayjs().subtract(5, 'day').toISOString(),
          wordCount: 8000,
        },
      ];
    },
  });

  // 生成方案
  const generateMutation = useMutation({
    mutationFn: async (values: {
      template: ProposalTemplate;
      title: string;
      requirements: string;
      keywords: string[];
      references: string[];
    }) => {
      // 模拟生成过程
      setCurrentStep(2);
      
      const proposal: Proposal = {
        id: Date.now().toString(),
        title: values.title,
        type: values.template.name,
        status: 'generating',
        content: '',
        outline: values.template.sections.map((section, index) => ({
          id: `section-${index}`,
          title: section,
          content: '',
          level: 1,
          order: index,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: 0,
        isFavorite: false,
        version: 1,
      };

      setGeneratingProposal(proposal);

      // 模拟逐章节生成
      for (let i = 0; i < proposal.outline.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const sectionContent = `这是"${proposal.outline[i].title}"章节的内容。

根据您提供的需求和关键词，AI已为您生成了相关内容。

## 主要内容

1. 第一个要点：详细描述相关内容...
2. 第二个要点：进一步阐述...
3. 第三个要点：补充说明...

## 分析与建议

基于当前情况的分析，建议采取以下措施：

- 措施一：具体实施方案
- 措施二：配套支持措施
- 措施三：风险防控措施

## 预期效果

通过以上措施的实施，预计可以达到以下效果：

1. 效果一
2. 效果二
3. 效果三`;

        proposal.outline[i].content = sectionContent;
        proposal.outline[i].suggestions = [
          '可以添加更多数据支撑',
          '建议补充案例分析',
          '可以增加图表说明',
        ];
        proposal.wordCount += sectionContent.length;
        
        setGeneratingProposal({ ...proposal });
      }

      proposal.status = 'completed';
      proposal.content = proposal.outline.map((s) => `# ${s.title}\n\n${s.content}`).join('\n\n');
      
      return proposal;
    },
    onSuccess: (proposal) => {
      setGeneratingProposal(proposal);
      setCurrentStep(3);
      message.success('方案生成完成！');
    },
    onError: () => {
      message.error('生成失败，请重试');
    },
  });

  // 导出方案
  const handleExport = (format: 'word' | 'pdf' | 'markdown') => {
    message.success(`正在导出${format.toUpperCase()}格式...`);
    // 实际实现中调用导出API
  };

  // 复制内容
  const handleCopy = () => {
    if (generatingProposal) {
      navigator.clipboard.writeText(generatingProposal.content);
      message.success('已复制到剪贴板');
    }
  };

  // 重新生成章节
  const handleRegenerateSection = (section: ProposalSection) => {
    message.info(`正在重新生成"${section.title}"...`);
    // 实际实现中调用重新生成API
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              选择方案模板
            </Title>
            <Row gutter={[16, 16]}>
              {proposalTemplates.map((template) => (
                <Col xs={24} sm={12} md={8} key={template.id}>
                  <Card
                    hoverable
                    className={selectedTemplate?.id === template.id ? 'selected-template' : ''}
                    onClick={() => setSelectedTemplate(template)}
                    style={{
                      border: selectedTemplate?.id === template.id ? '2px solid #1890ff' : undefined,
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 48 }}>{template.icon}</span>
                    </div>
                    <Title level={5} style={{ textAlign: 'center', marginBottom: 8 }}>
                      {template.name}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}>
                      {template.description}
                    </Text>
                    <div style={{ textAlign: 'center' }}>
                      <Tag color="blue">{template.category}</Tag>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>包含章节：</Text>
                      <div style={{ marginTop: 8 }}>
                        {template.sections.map((section, index) => (
                          <Tag key={index} style={{ marginBottom: 4 }}>
                            {section}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                disabled={!selectedTemplate}
                onClick={() => setCurrentStep(1)}
              >
                下一步：填写需求
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              填写方案需求
            </Title>
            <Card>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  title: '',
                  requirements: '',
                  keywords: [],
                  references: [],
                }}
              >
                <Form.Item
                  name="title"
                  label="方案标题"
                  rules={[{ required: true, message: '请输入方案标题' }]}
                >
                  <Input placeholder="请输入方案标题" size="large" />
                </Form.Item>

                <Form.Item
                  name="requirements"
                  label="需求描述"
                  rules={[{ required: true, message: '请描述您的需求' }]}
                  extra="详细描述您的需求，AI将根据描述生成更精准的内容"
                >
                  <TextArea
                    rows={6}
                    placeholder="请详细描述您的需求，包括背景、目标、约束条件等..."
                  />
                </Form.Item>

                <Form.Item
                  name="keywords"
                  label="关键词"
                  extra="添加关键词帮助AI更好地理解您的需求"
                >
                  <Select
                    mode="tags"
                    placeholder="输入关键词后按回车添加"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="references"
                  label="参考资料"
                  extra="上传相关文档作为参考"
                >
                  <Upload.Dragger
                    multiple
                    beforeUpload={() => false}
                  >
                    <p className="ant-upload-drag-icon">
                      <PlusOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
                    <p className="ant-upload-hint">支持 Word、PDF、Markdown 等格式</p>
                  </Upload.Dragger>
                </Form.Item>

                <Alert
                  message="AI生成提示"
                  description="AI将根据您选择的模板和填写的需求，自动生成方案内容。生成后您可以对各章节进行编辑和优化。"
                  type="info"
                  showIcon
                  icon={<BulbOutlined />}
                  style={{ marginBottom: 24 }}
                />

                <div style={{ textAlign: 'center' }}>
                  <Space size="large">
                    <Button size="large" onClick={() => setCurrentStep(0)}>
                      上一步
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ThunderboltOutlined />}
                      onClick={() => {
                        form.validateFields().then((values) => {
                          generateMutation.mutate({
                            template: selectedTemplate!,
                            ...values,
                          });
                        });
                      }}
                      loading={generateMutation.isPending}
                    >
                      开始生成
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>
          </div>
        );

      case 2:
        return (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              <RobotOutlined /> AI正在生成方案...
            </Title>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>正在生成"{generatingProposal?.title}"</Text>
                </div>
              </div>

              <List
                dataSource={generatingProposal?.outline || []}
                renderItem={(section, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        section.content ? (
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        ) : index === generatingProposal?.outline.findIndex((s) => !s.content) ? (
                          <Spin size="small" />
                        ) : (
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #d9d9d9' }} />
                        )
                      }
                      title={section.title}
                      description={
                        section.content ? (
                          <Text type="secondary">{section.content.substring(0, 100)}...</Text>
                        ) : (
                          <Text type="secondary">等待生成...</Text>
                        )
                      }
                    />
                  </List.Item>
                )}
              />

              <div style={{ marginTop: 24 }}>
                <Progress
                  percent={Math.round(
                    ((generatingProposal?.outline.filter((s) => s.content).length || 0) /
                      (generatingProposal?.outline.length || 1)) *
                      100
                  )}
                  status="active"
                />
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div>
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <Space>
                      <FileTextOutlined />
                      {generatingProposal?.title}
                      <Tag color="green">已完成</Tag>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Tooltip title="预览">
                        <Button icon={<EyeOutlined />} onClick={() => setShowPreview(true)} />
                      </Tooltip>
                      <Tooltip title="复制">
                        <Button icon={<CopyOutlined />} onClick={handleCopy} />
                      </Tooltip>
                      <Tooltip title="收藏">
                        <Button
                          icon={generatingProposal?.isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <div ref={contentRef}>
                    {generatingProposal?.outline.map((section) => (
                      <div key={section.id} style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Title level={4} style={{ margin: 0 }}>
                            {section.title}
                          </Title>
                          <Space>
                            <Tooltip title="编辑">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => setEditingSection(section)}
                              />
                            </Tooltip>
                            <Tooltip title="重新生成">
                              <Button
                                type="text"
                                size="small"
                                icon={<ReloadOutlined />}
                                onClick={() => handleRegenerateSection(section)}
                              />
                            </Tooltip>
                          </Space>
                        </div>
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                          {section.content}
                        </Paragraph>
                        {section.suggestions && section.suggestions.length > 0 && (
                          <Alert
                            message="AI建议"
                            description={
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {section.suggestions.map((suggestion, index) => (
                                  <li key={index}>{suggestion}</li>
                                ))}
                              </ul>
                            }
                            type="info"
                            showIcon
                            icon={<BulbOutlined />}
                            style={{ marginTop: 8 }}
                          />
                        )}
                        <Divider />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="方案信息" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">类型</Text>
                      <Text>{generatingProposal?.type}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">字数</Text>
                      <Text>{generatingProposal?.wordCount} 字</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">章节数</Text>
                      <Text>{generatingProposal?.outline.length} 章</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">版本</Text>
                      <Text>v{generatingProposal?.version}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">创建时间</Text>
                      <Text>{dayjs(generatingProposal?.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
                    </div>
                  </Space>
                </Card>

                <Card title="导出方案">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      block
                      icon={<FileWordOutlined />}
                      onClick={() => handleExport('word')}
                    >
                      导出 Word
                    </Button>
                    <Button
                      block
                      icon={<FilePdfOutlined />}
                      onClick={() => handleExport('pdf')}
                    >
                      导出 PDF
                    </Button>
                    <Button
                      block
                      icon={<FileMarkdownOutlined />}
                      onClick={() => handleExport('markdown')}
                    >
                      导出 Markdown
                    </Button>
                  </Space>
                </Card>

                <Card title="快捷操作" style={{ marginTop: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block icon={<ReloadOutlined />}>
                      重新生成全文
                    </Button>
                    <Button block icon={<PlusOutlined />} onClick={() => setCurrentStep(0)}>
                      创建新方案
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ai-proposal-page">
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ marginBottom: 8 }}>
              <RobotOutlined /> AI方案生成
            </Title>
            <Text type="secondary">
              基于AI智能生成各类方案文档，支持多种模板和自定义需求
            </Text>
          </Col>
          <Col>
            <Button icon={<HistoryOutlined />} onClick={() => setShowHistory(true)}>
              生成历史
            </Button>
          </Col>
        </Row>
      </div>

      {/* 步骤条 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          items={[
            { title: '选择模板', icon: <FileTextOutlined /> },
            { title: '填写需求', icon: <EditOutlined /> },
            { title: 'AI生成', icon: <RobotOutlined /> },
            { title: '编辑导出', icon: <CheckCircleOutlined /> },
          ]}
        />
      </Card>

      {/* 步骤内容 */}
      {renderStepContent()}

      {/* 生成历史抽屉 */}
      <Drawer
        title="生成历史"
        open={showHistory}
        onClose={() => setShowHistory(false)}
        width={480}
      >
        <List
          dataSource={historyData}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="view" type="link" size="small">
                  查看
                </Button>,
                <Button key="delete" type="link" size="small" danger>
                  删除
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} />}
                title={item.title}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{item.type}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')} · {item.wordCount} 字
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* 预览模态框 */}
      <Modal
        title="方案预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowPreview(false)}>
            关闭
          </Button>,
          <Button key="export" type="primary" icon={<DownloadOutlined />}>
            导出
          </Button>,
        ]}
      >
        <div style={{ maxHeight: 600, overflow: 'auto', padding: 16 }}>
          <Title level={3} style={{ textAlign: 'center' }}>
            {generatingProposal?.title}
          </Title>
          <Divider />
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {generatingProposal?.content}
          </div>
        </div>
      </Modal>

      {/* 编辑章节模态框 */}
      <Modal
        title={`编辑章节：${editingSection?.title}`}
        open={!!editingSection}
        onCancel={() => setEditingSection(null)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setEditingSection(null)}>
            取消
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            message.success('保存成功');
            setEditingSection(null);
          }}>
            保存
          </Button>,
        ]}
      >
        <TextArea
          rows={15}
          defaultValue={editingSection?.content}
        />
      </Modal>
    </div>
  );
}