'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Upload, 
  Progress,
  Row,
  Col,
  Tabs,
  message,
  Tag,
  List,
  Avatar,
  Statistic,
  Modal,
  Alert,
  Tooltip,
  Badge,
  Spin
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { 
  RobotOutlined, 
  UploadOutlined, 
  FileTextOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileMarkdownOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import { aiService } from '@/services';
import type { 
  TrainingStats, 
  TrainingHistory, 
  TrainingDocument 
} from '@/services';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// 文件类型图标映射
const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
  docx: <FileWordOutlined style={{ color: '#1890ff' }} />,
  doc: <FileWordOutlined style={{ color: '#1890ff' }} />,
  md: <FileMarkdownOutlined style={{ color: '#52c41a' }} />,
  txt: <FileTextOutlined style={{ color: '#faad14' }} />,
  json: <FileTextOutlined style={{ color: '#722ed1' }} />,
};

/**
 * AI模型训练页面
 */
export default function AITrainingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed'>('idle');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<TrainingDocument[]>([]);

  // 防止重复请求的 ref
  const dataLoadedRef = useRef(false);
  const loadingDataRef = useRef(false);

  // 表单
  const [settingsForm] = Form.useForm();
  const [businessForm] = Form.useForm();

  // 加载数据
  useEffect(() => {
    if (dataLoadedRef.current || loadingDataRef.current) {
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    loadingDataRef.current = true;
    setLoading(true);
    try {
      const [statsRes, historyRes, docsRes] = await Promise.all([
        aiService.getTrainingStats().catch(() => null),
        aiService.getTrainingHistory().catch(() => []),
        aiService.getTrainingDocuments().catch(() => [])
      ]);

      if (statsRes) {
        setTrainingStats(statsRes);
        if (statsRes.lastTraining) {
          setTrainingStatus('completed');
        }
      } else {
        // 默认值
        setTrainingStats({
          totalDocuments: 0,
          totalTokens: '0',
          lastTraining: '',
          modelVersion: 'v1.0.0',
          accuracy: 0,
        });
      }

      setTrainingHistory(historyRes || []);
      setKnowledgeDocuments(docsRes || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      loadingDataRef.current = false;
      dataLoadedRef.current = true;
    }
  };

  // 开始训练
  const handleStartTraining = () => {
    Modal.confirm({
      title: '开始训练',
      content: '确定要开始训练AI模型吗？训练过程可能需要几分钟到几小时，取决于数据量。',
      okText: '开始训练',
      cancelText: '取消',
      okButtonProps: { style: { backgroundColor: '#10B981', borderColor: '#10B981' } },
      onOk: async () => {
        try {
          await aiService.startTraining();
          setTrainingStatus('training');
          setTrainingProgress(0);
          
          // 模拟训练进度
          const interval = setInterval(() => {
            setTrainingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTrainingStatus('completed');
                message.success('模型训练完成！');
                loadData(); // 重新加载数据
                return 100;
              }
              return prev + Math.random() * 10;
            });
          }, 500);
        } catch {
          message.error('启动训练失败');
        }
      }
    });
  };

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    accept: '.pdf,.doc,.docx,.txt,.md,.json',
    onChange: (info) => {
      setFileList(info.fileList);
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        loadData(); // 重新加载文档列表
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    beforeUpload: () => false, // 阻止自动上传
  };

  // 确认上传文件
  const handleConfirmUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择要上传的文件');
      return;
    }

    setLoading(true);
    try {
      for (const file of fileList) {
        if (file.originFileObj) {
          await aiService.uploadTrainingDocument(file.originFileObj);
        }
      }
      message.success(`成功上传 ${fileList.length} 个文件`);
      setFileList([]);
      loadData();
    } catch {
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除文档
  const handleDeleteDocument = (id: number) => {
    Modal.confirm({
      title: '删除文档',
      content: '确定要删除这个文档吗？删除后需要重新训练模型。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await aiService.deleteTrainingDocument(id);
          message.success('文档已删除');
          loadData();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 保存训练设置
  const handleSaveTrainingSettings = async (values: { epochs: number; learningRate: string; batchSize: number }) => {
    try {
      await aiService.saveTrainingSettings(values);
      message.success('设置已保存');
    } catch {
      message.error('保存失败');
    }
  };

  // 保存业务配置
  const handleSaveBusinessConfig = async (values: { companyName: string; industry: string; businessDesc: string }) => {
    try {
      await aiService.saveBusinessConfig(values);
      message.success('配置已保存');
    } catch {
      message.error('保存失败');
    }
  };

  // 获取文件图标
  const getFileIcon = (type?: string) => {
    if (!type) return <FileUnknownOutlined />;
    return FILE_ICONS[type.toLowerCase()] || <FileUnknownOutlined />;
  };

  // 概览标签页
  const OverviewTab = () => (
    <div className="space-y-6">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="知识文档" 
                value={trainingStats?.totalDocuments || 0} 
                prefix={<FileTextOutlined style={{ color: '#10B981' }} />}
                suffix="份"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="训练Token" 
                value={trainingStats?.totalTokens || '0'} 
                prefix={<DatabaseOutlined style={{ color: '#3B82F6' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="模型准确率" 
                value={trainingStats?.accuracy || 0} 
                prefix={<ThunderboltOutlined style={{ color: '#F59E0B' }} />}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <Statistic 
                title="当前版本" 
                value={trainingStats?.modelVersion || 'v1.0.0'} 
                prefix={<RobotOutlined style={{ color: '#8B5CF6' }} />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="模型状态" className="shadow-sm">
          {trainingStatus === 'training' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Space>
                  <SyncOutlined spin style={{ color: '#10B981' }} />
                  <Text strong>正在训练中...</Text>
                </Space>
                <Button size="small" icon={<PauseCircleOutlined />}>暂停</Button>
              </div>
              <Progress 
                percent={Math.round(trainingProgress)} 
                status="active"
                strokeColor={{ from: '#10B981', to: '#3B82F6' }}
              />
              <Text type="secondary">预计剩余时间: 约 {Math.round((100 - trainingProgress) / 10)} 分钟</Text>
            </div>
          ) : trainingStatus === 'completed' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircleOutlined style={{ fontSize: 48, color: '#10B981' }} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>模型已就绪</Title>
                  <Text type="secondary">上次训练: {trainingStats?.lastTraining || '未知'}</Text>
                </div>
              </div>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={handleStartTraining}
                style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
              >
                重新训练
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert
                message="模型未训练"
                description="请上传知识文档并开始训练，让AI学习您的业务知识。"
                type="info"
                showIcon
              />
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={handleStartTraining}
                style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
              >
                开始训练
              </Button>
            </div>
          )}
        </Card>

        <Card title="训练历史" className="shadow-sm">
          <List
            dataSource={trainingHistory}
            locale={{ emptyText: '暂无训练历史' }}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button key="detail" type="link" size="small">查看详情</Button>,
                  <Button key="rollback" type="link" size="small">回滚</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<RobotOutlined />} 
                      style={{ background: item.status === 'completed' ? '#10B981' : '#3B82F6' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{item.version}</Text>
                      <Tag color="green">准确率 {item.accuracy}%</Tag>
                    </Space>
                  }
                  description={
                    <Space>
                      <ClockCircleOutlined /> {item.date}
                      <span>|</span>
                      <FileTextOutlined /> {item.documents} 份文档
                      {item.duration && (
                        <>
                          <span>|</span>
                          <span>耗时 {Math.round(item.duration / 60)} 分钟</span>
                        </>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Spin>
    </div>
  );

  // 知识库标签页
  const KnowledgeTab = () => (
    <div className="space-y-6">
      <Card title="上传知识文档" className="shadow-sm">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#10B981' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 PDF、Word、TXT、Markdown 等格式，单个文件不超过 50MB
          </p>
        </Dragger>
        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={handleConfirmUpload}
              loading={loading}
              style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
            >
              确认上传 ({fileList.length} 个文件)
            </Button>
          </div>
        )}
      </Card>

      <Card 
        title="知识库文档" 
        className="shadow-sm"
        extra={<Text type="secondary">共 {knowledgeDocuments.length} 份文档</Text>}
      >
        <Spin spinning={loading}>
          <List
            dataSource={knowledgeDocuments}
            locale={{ emptyText: '暂无文档' }}
            renderItem={item => (
              <List.Item
                actions={[
                  <Tooltip key="view" title="查看">
                    <Button type="text" size="small" icon={<FileTextOutlined />} />
                  </Tooltip>,
                  <Tooltip key="delete" title="删除">
                    <Button 
                      type="text" 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteDocument(item.id)}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getFileIcon(item.type)} 
                      style={{ background: item.status === 'indexed' ? '#10B981' : '#faad14' }}
                    />
                  }
                  title={item.name}
                  description={
                    <Space>
                      <Text type="secondary">{item.size}</Text>
                      <span>|</span>
                      <Text type="secondary">{item.uploadTime}</Text>
                      <span>|</span>
                      <Badge 
                        status={item.status === 'indexed' ? 'success' : item.status === 'processing' ? 'processing' : 'warning'} 
                        text={item.status === 'indexed' ? '已索引' : item.status === 'processing' ? '处理中' : '待索引'} 
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Card>
    </div>
  );

  // 设置标签页
  const SettingsTab = () => (
    <div className="space-y-6">
      <Card title="训练参数设置" className="shadow-sm">
        <Form 
          form={settingsForm}
          layout="vertical" 
          onFinish={handleSaveTrainingSettings}
          initialValues={{
            epochs: 3,
            learningRate: '0.0001',
            batchSize: 32
          }}
        >
          <Form.Item 
            label={
              <Space>
                <span>模型基座</span>
                <Tooltip title="选择用于微调的基础模型">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Input value="GPT-4 Turbo" disabled />
          </Form.Item>
          <Form.Item 
            name="epochs"
            label="训练轮次 (Epochs)"
            extra="更多轮次可能提高准确率，但也可能导致过拟合"
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item 
            name="learningRate"
            label="学习率 (Learning Rate)"
            extra="较小的学习率训练更稳定，但速度较慢"
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="batchSize"
            label="批次大小 (Batch Size)"
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="业务配置" className="shadow-sm">
        <Form 
          form={businessForm}
          layout="vertical" 
          onFinish={handleSaveBusinessConfig}
          initialValues={{
            companyName: '摩塔科技',
            industry: '企业服务/SaaS',
            businessDesc: '摩塔科技是一家专注于AI驱动的智能商业平台提供商，为企业提供一站式AI解决方案生成服务。'
          }}
        >
          <Form.Item 
            name="companyName"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>
          <Form.Item 
            name="industry"
            label="行业领域"
          >
            <Input placeholder="请输入行业领域" />
          </Form.Item>
          <Form.Item 
            name="businessDesc"
            label="业务描述"
            extra="详细的业务描述有助于AI更好地理解您的业务"
          >
            <TextArea 
              rows={4} 
              placeholder="请描述您的核心业务..."
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
            >
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const tabItems = [
    { key: 'overview', label: '概览', children: <OverviewTab /> },
    { key: 'knowledge', label: '知识库', children: <KnowledgeTab /> },
    { key: 'settings', label: <span><SettingOutlined /> 设置</span>, children: <SettingsTab /> },
  ];

  return (
    <div className="p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <RobotOutlined style={{ fontSize: 32, color: '#10B981' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>AI模型训练</Title>
            <Text type="secondary">训练专属于您企业的AI模型，让AI更懂您的业务</Text>
          </div>
        </div>
        <Space>
          <Button 
            icon={<PlayCircleOutlined />} 
            type="primary" 
            onClick={handleStartTraining}
            style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
          >
            开始训练
          </Button>
        </Space>
      </div>

      {/* 标签页内容 */}
      <Card className="shadow-sm">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
}