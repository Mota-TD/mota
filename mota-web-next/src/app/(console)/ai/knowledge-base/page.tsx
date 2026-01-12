'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Empty,
  Tag,
  Avatar,
  List,
  Progress,
  Tabs,
  Upload,
  message,
  Modal,
  Form,
  Select,
  Spin,
} from 'antd';
import {
  BookOutlined,
  RobotOutlined,
  UploadOutlined,
  FileTextOutlined,
  FolderOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { aiService, type KnowledgeBase, type KnowledgeDocument } from '@/services';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

// 知识库颜色配置
const KB_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function AIKnowledgeBasePage() {
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<KnowledgeDocument[]>([]);

  // 获取知识库列表
  const fetchKnowledgeBases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiService.getKnowledgeBases();
      // 为每个知识库分配颜色
      const coloredData = data.map((kb, index) => ({
        ...kb,
        color: kb.color || KB_COLORS[index % KB_COLORS.length],
      }));
      setKnowledgeBases(coloredData);
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error);
      setKnowledgeBases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取最近文档
  const fetchRecentDocuments = useCallback(async () => {
    try {
      const data = await aiService.getKnowledgeDocuments();
      setRecentDocuments(data);
    } catch (error) {
      console.error('Failed to fetch recent documents:', error);
      setRecentDocuments([]);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBases();
    fetchRecentDocuments();
  }, [fetchKnowledgeBases, fetchRecentDocuments]);

  const handleCreateKnowledgeBase = async () => {
    try {
      const values = await form.validateFields();
      await aiService.createKnowledgeBase(values);
      message.success('知识库创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchKnowledgeBases();
    } catch (error) {
      console.error('Failed to create knowledge base:', error);
      message.error('知识库创建失败');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/v1/knowledge/upload',
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        fetchRecentDocuments();
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  const getStatusTag = (status: string) => {
    if (status === 'active') {
      return <Tag color="success" icon={<CheckCircleOutlined />}>已就绪</Tag>;
    }
    if (status === 'syncing') {
      return <Tag color="processing" icon={<SyncOutlined spin />}>同步中</Tag>;
    }
    return <Tag color="default">未知</Tag>;
  };

  const getFileIcon = (type: string) => {
    const colors: Record<string, string> = {
      pdf: '#EF4444',
      docx: '#3B82F6',
      md: '#10B981',
      xlsx: '#22C55E',
    };
    return (
      <Avatar style={{ backgroundColor: colors[type] || '#64748B' }} size={40}>
        <FileTextOutlined />
      </Avatar>
    );
  };

  // 计算统计数据
  const totalDocuments = knowledgeBases.reduce((sum, kb) => sum + (kb.documentCount || 0), 0);
  const activeCount = knowledgeBases.filter(kb => kb.status === 'active').length;
  const syncingCount = knowledgeBases.filter(kb => kb.status === 'syncing').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)`,
        borderRadius: 16,
        padding: '24px 32px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
            <div>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>AI 知识库</Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                构建企业专属知识库，让 AI 更懂您的业务
              </Text>
            </div>
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}
          >
            新建知识库
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <DatabaseOutlined style={{ fontSize: 24, color: '#8B5CF6' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{knowledgeBases.length}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>知识库</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileTextOutlined style={{ fontSize: 24, color: '#3B82F6' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {totalDocuments}
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>文档总数</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircleOutlined style={{ fontSize: 24, color: THEME_COLOR }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {activeCount}
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>已就绪</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SyncOutlined style={{ fontSize: 24, color: '#F59E0B' }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {syncingCount}
                </div>
                <div style={{ fontSize: 13, color: '#64748B' }}>同步中</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="bases"
        items={[
          {
            key: 'bases',
            label: (
              <span>
                <FolderOutlined /> 知识库
              </span>
            ),
            children: (
              knowledgeBases.length === 0 ? (
                <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Row gutter={[16, 16]}>
                  {knowledgeBases.map((kb) => (
                    <Col key={kb.id} xs={24} sm={12} lg={8}>
                      <Card
                        hoverable
                        style={{ borderRadius: 12 }}
                        actions={[
                          <Tooltip key="view" title="查看">
                            <EyeOutlined />
                          </Tooltip>,
                          <Tooltip key="edit" title="编辑">
                            <EditOutlined />
                          </Tooltip>,
                          <Tooltip key="delete" title="删除">
                            <DeleteOutlined />
                          </Tooltip>,
                        ]}
                      >
                        <div style={{ display: 'flex', gap: 16 }}>
                          <Avatar
                            size={48}
                            style={{ backgroundColor: kb.color || THEME_COLOR, borderRadius: 12 }}
                            icon={<BookOutlined />}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <Text strong style={{ fontSize: 16 }}>{kb.name}</Text>
                              {getStatusTag(kb.status)}
                            </div>
                            <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                              {kb.description || '暂无描述'}
                            </Paragraph>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <FileTextOutlined /> {kb.documentCount || 0} 文档
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                更新于 {kb.lastUpdated || '-'}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )
            ),
          },
          {
            key: 'documents',
            label: (
              <span>
                <FileTextOutlined /> 最近文档
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="搜索文档"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                  />
                </div>
                {recentDocuments.length === 0 ? (
                  <Empty description="暂无文档" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={recentDocuments}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button key="view" type="link" icon={<EyeOutlined />}>查看</Button>,
                          <Button key="delete" type="link" danger icon={<DeleteOutlined />}>删除</Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getFileIcon(item.type)}
                          title={item.name}
                          description={
                            <Space>
                              <Tag>{item.type.toUpperCase()}</Tag>
                              <Text type="secondary">{item.size}</Text>
                              <Text type="secondary">上传于 {item.uploadedAt}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'upload',
            label: (
              <span>
                <CloudUploadOutlined /> 上传文档
              </span>
            ),
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Dragger {...uploadProps} style={{ padding: 24 }}>
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined style={{ fontSize: 48, color: THEME_COLOR }} />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持 PDF、Word、Markdown、Excel 等格式，单个文件不超过 50MB
                  </p>
                </Dragger>
              </Card>
            ),
          },
        ]}
      />

      {/* 创建知识库弹窗 */}
      <Modal
        title="新建知识库"
        open={createModalVisible}
        onOk={handleCreateKnowledgeBase}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="知识库名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入知识库描述" />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="general">
            <Select
              options={[
                { value: 'general', label: '通用知识库' },
                { value: 'product', label: '产品文档' },
                { value: 'technical', label: '技术规范' },
                { value: 'training', label: '培训资料' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// Tooltip 组件需要单独导入
import { Tooltip } from 'antd';