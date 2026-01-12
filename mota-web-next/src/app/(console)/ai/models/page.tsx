'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Typography,
  List,
  Avatar,
  Tabs,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Slider,
  InputNumber,
  Progress,
  Statistic,
  Table,
  Popconfirm,
  message,
  Drawer,
  Descriptions,
  Badge,
  Alert,
} from 'antd';
import {
  RobotOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ApiOutlined,
  CloudOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// AI模型接口
interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local' | 'custom';
  modelId: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  isDefault: boolean;
  config: {
    apiKey?: string;
    apiEndpoint?: string;
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  capabilities: string[];
  usage: {
    totalRequests: number;
    totalTokens: number;
    avgLatency: number;
    errorRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 模型提供商配置
const providerConfig: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  openai: { name: 'OpenAI', icon: <RobotOutlined />, color: '#10a37f' },
  anthropic: { name: 'Anthropic', icon: <RobotOutlined />, color: '#d97706' },
  google: { name: 'Google AI', icon: <CloudOutlined />, color: '#4285f4' },
  azure: { name: 'Azure OpenAI', icon: <CloudOutlined />, color: '#0078d4' },
  local: { name: '本地模型', icon: <DatabaseOutlined />, color: '#722ed1' },
  custom: { name: '自定义', icon: <ApiOutlined />, color: '#eb2f96' },
};

// 模型能力标签
const capabilityTags: Record<string, { label: string; color: string }> = {
  chat: { label: '对话', color: 'blue' },
  completion: { label: '补全', color: 'green' },
  embedding: { label: '向量化', color: 'purple' },
  vision: { label: '视觉', color: 'orange' },
  code: { label: '代码', color: 'cyan' },
  function: { label: '函数调用', color: 'magenta' },
};

export default function AIModelsPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // 获取模型列表
  const { data: models, isLoading } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async (): Promise<AIModel[]> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return [
        {
          id: '1',
          name: 'GPT-4 Turbo',
          provider: 'openai',
          modelId: 'gpt-4-turbo-preview',
          description: 'OpenAI最新的GPT-4 Turbo模型，支持128K上下文',
          status: 'active',
          isDefault: true,
          config: {
            apiKey: 'sk-xxxx...xxxx',
            apiEndpoint: 'https://api.openai.com/v1',
            maxTokens: 4096,
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          capabilities: ['chat', 'completion', 'vision', 'function'],
          usage: {
            totalRequests: 12580,
            totalTokens: 5678900,
            avgLatency: 1.2,
            errorRate: 0.02,
          },
          createdAt: dayjs().subtract(30, 'day').toISOString(),
          updatedAt: dayjs().subtract(1, 'hour').toISOString(),
        },
        {
          id: '2',
          name: 'Claude 3 Opus',
          provider: 'anthropic',
          modelId: 'claude-3-opus-20240229',
          description: 'Anthropic的Claude 3 Opus模型，擅长复杂推理',
          status: 'active',
          isDefault: false,
          config: {
            apiKey: 'sk-ant-xxxx...xxxx',
            apiEndpoint: 'https://api.anthropic.com/v1',
            maxTokens: 4096,
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          capabilities: ['chat', 'completion', 'vision'],
          usage: {
            totalRequests: 8920,
            totalTokens: 3456780,
            avgLatency: 1.5,
            errorRate: 0.01,
          },
          createdAt: dayjs().subtract(20, 'day').toISOString(),
          updatedAt: dayjs().subtract(2, 'hour').toISOString(),
        },
        {
          id: '3',
          name: 'Gemini Pro',
          provider: 'google',
          modelId: 'gemini-pro',
          description: 'Google的Gemini Pro模型，多模态能力强',
          status: 'inactive',
          isDefault: false,
          config: {
            apiKey: 'AIza...xxxx',
            apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
            maxTokens: 2048,
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          capabilities: ['chat', 'completion', 'vision', 'embedding'],
          usage: {
            totalRequests: 3450,
            totalTokens: 1234560,
            avgLatency: 0.8,
            errorRate: 0.03,
          },
          createdAt: dayjs().subtract(15, 'day').toISOString(),
          updatedAt: dayjs().subtract(5, 'day').toISOString(),
        },
        {
          id: '4',
          name: 'Azure GPT-4',
          provider: 'azure',
          modelId: 'gpt-4',
          description: 'Azure托管的GPT-4模型，企业级安全',
          status: 'error',
          isDefault: false,
          config: {
            apiKey: 'xxxx...xxxx',
            apiEndpoint: 'https://your-resource.openai.azure.com',
            maxTokens: 4096,
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          capabilities: ['chat', 'completion', 'function'],
          usage: {
            totalRequests: 1200,
            totalTokens: 456780,
            avgLatency: 2.1,
            errorRate: 0.15,
          },
          createdAt: dayjs().subtract(10, 'day').toISOString(),
          updatedAt: dayjs().subtract(1, 'day').toISOString(),
        },
        {
          id: '5',
          name: 'Llama 3 70B',
          provider: 'local',
          modelId: 'llama-3-70b',
          description: '本地部署的Llama 3 70B模型',
          status: 'active',
          isDefault: false,
          config: {
            apiEndpoint: 'http://localhost:8080/v1',
            maxTokens: 2048,
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          capabilities: ['chat', 'completion', 'code'],
          usage: {
            totalRequests: 5670,
            totalTokens: 2345670,
            avgLatency: 0.5,
            errorRate: 0.01,
          },
          createdAt: dayjs().subtract(7, 'day').toISOString(),
          updatedAt: dayjs().subtract(3, 'hour').toISOString(),
        },
      ];
    },
  });

  // 创建/更新模型
  const saveMutation = useMutation({
    mutationFn: async (values: Partial<AIModel>) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...values, id: editingModel?.id || Date.now().toString() };
    },
    onSuccess: () => {
      message.success(editingModel ? '模型更新成功' : '模型创建成功');
      setModalVisible(false);
      setEditingModel(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });

  // 删除模型
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return id;
    },
    onSuccess: () => {
      message.success('模型删除成功');
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });

  // 切换模型状态
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, status };
    },
    onSuccess: (data) => {
      message.success(`模型已${data.status === 'active' ? '启用' : '禁用'}`);
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });

  // 设为默认模型
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return id;
    },
    onSuccess: () => {
      message.success('已设为默认模型');
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
    },
  });

  // 测试模型
  const handleTestModel = async () => {
    if (!testInput.trim()) {
      message.warning('请输入测试内容');
      return;
    }
    
    setTesting(true);
    setTestOutput('');
    
    // 模拟流式输出
    const response = `这是对"${testInput}"的测试响应。\n\n模型 ${selectedModel?.name} 正常工作中。\n\n响应时间: ${Math.random() * 2 + 0.5}s\n令牌数: ${Math.floor(Math.random() * 100 + 50)}`;
    
    for (let i = 0; i < response.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setTestOutput((prev) => prev + response[i]);
    }
    
    setTesting(false);
  };

  // 打开编辑弹窗
  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    form.setFieldsValue({
      ...model,
      ...model.config,
    });
    setModalVisible(true);
  };

  // 打开详情抽屉
  const handleViewDetail = (model: AIModel) => {
    setSelectedModel(model);
    setDetailDrawerVisible(true);
  };

  // 打开测试弹窗
  const handleOpenTest = (model: AIModel) => {
    setSelectedModel(model);
    setTestInput('');
    setTestOutput('');
    setTestModalVisible(true);
  };

  // 统计数据
  const stats = {
    total: models?.length || 0,
    active: models?.filter((m) => m.status === 'active').length || 0,
    totalRequests: models?.reduce((sum, m) => sum + m.usage.totalRequests, 0) || 0,
    totalTokens: models?.reduce((sum, m) => sum + m.usage.totalTokens, 0) || 0,
  };

  // 表格列定义
  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: AIModel) => (
        <Space>
          <Avatar
            style={{ backgroundColor: providerConfig[record.provider]?.color }}
            icon={providerConfig[record.provider]?.icon}
          />
          <div>
            <div>
              <Text strong>{name}</Text>
              {record.isDefault && (
                <Tag color="gold" style={{ marginLeft: 8 }}>默认</Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.modelId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider: string) => (
        <Tag color={providerConfig[provider]?.color}>
          {providerConfig[provider]?.name}
        </Tag>
      ),
    },
    {
      title: '能力',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities: string[]) => (
        <Space wrap>
          {capabilities.map((cap) => (
            <Tag key={cap} color={capabilityTags[cap]?.color}>
              {capabilityTags[cap]?.label}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          active: { color: 'success', icon: <CheckCircleOutlined />, text: '运行中' },
          inactive: { color: 'default', icon: <PauseCircleOutlined />, text: '已禁用' },
          error: { color: 'error', icon: <CloseCircleOutlined />, text: '异常' },
        };
        const config = statusConfig[status];
        return (
          <Badge status={config.color as 'success' | 'default' | 'error'} text={config.text} />
        );
      },
    },
    {
      title: '调用次数',
      dataIndex: ['usage', 'totalRequests'],
      key: 'totalRequests',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '平均延迟',
      dataIndex: ['usage', 'avgLatency'],
      key: 'avgLatency',
      render: (value: number) => `${value.toFixed(2)}s`,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: AIModel) => (
        <Space>
          <Tooltip title="测试">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => handleOpenTest(record)}
            />
          </Tooltip>
          <Tooltip title="详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? '禁用' : '启用'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => toggleStatusMutation.mutate({
                id: record.id,
                status: record.status === 'active' ? 'inactive' : 'active',
              })}
            />
          </Tooltip>
          {!record.isDefault && (
            <Tooltip title="设为默认">
              <Button
                type="text"
                icon={<ThunderboltOutlined />}
                onClick={() => setDefaultMutation.mutate(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定删除此模型？"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="ai-models-page">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="模型总数"
              value={stats.total}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="运行中"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总调用次数"
              value={stats.totalRequests}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总Token消耗"
              value={stats.totalTokens}
              prefix={<ThunderboltOutlined />}
              formatter={(value) => `${(Number(value) / 1000000).toFixed(2)}M`}
            />
          </Card>
        </Col>
      </Row>

      {/* 模型列表 */}
      <Card
        title={
          <Space>
            <RobotOutlined />
            AI模型管理
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingModel(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加模型
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={models}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 添加/编辑模型弹窗 */}
      <Modal
        title={editingModel ? '编辑模型' : '添加模型'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingModel(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        confirmLoading={saveMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => saveMutation.mutate(values)}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="模型名称"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="如：GPT-4 Turbo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="provider"
                label="提供商"
                rules={[{ required: true, message: '请选择提供商' }]}
              >
                <Select placeholder="选择提供商">
                  {Object.entries(providerConfig).map(([key, config]) => (
                    <Select.Option key={key} value={key}>
                      <Space>
                        {config.icon}
                        {config.name}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="modelId"
                label="模型ID"
                rules={[{ required: true, message: '请输入模型ID' }]}
              >
                <Input placeholder="如：gpt-4-turbo-preview" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capabilities"
                label="模型能力"
              >
                <Select mode="multiple" placeholder="选择模型能力">
                  {Object.entries(capabilityTags).map(([key, config]) => (
                    <Select.Option key={key} value={key}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={2} placeholder="模型描述" />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API Key"
          >
            <Input.Password placeholder="API密钥" />
          </Form.Item>

          <Form.Item
            name="apiEndpoint"
            label="API端点"
          >
            <Input placeholder="如：https://api.openai.com/v1" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="maxTokens"
                label="最大Token数"
                initialValue={4096}
              >
                <InputNumber min={1} max={128000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="temperature"
                label="Temperature"
                initialValue={0.7}
              >
                <Slider min={0} max={2} step={0.1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="topP"
                label="Top P"
                initialValue={1}
              >
                <Slider min={0} max={1} step={0.1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 模型详情抽屉 */}
      <Drawer
        title="模型详情"
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
      >
        {selectedModel && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={64}
                style={{ backgroundColor: providerConfig[selectedModel.provider]?.color }}
                icon={providerConfig[selectedModel.provider]?.icon}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                {selectedModel.name}
              </Title>
              <Text type="secondary">{selectedModel.modelId}</Text>
              {selectedModel.isDefault && (
                <Tag color="gold" style={{ marginLeft: 8 }}>默认模型</Tag>
              )}
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="提供商">
                <Tag color={providerConfig[selectedModel.provider]?.color}>
                  {providerConfig[selectedModel.provider]?.name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge
                  status={selectedModel.status === 'active' ? 'success' : selectedModel.status === 'error' ? 'error' : 'default'}
                  text={selectedModel.status === 'active' ? '运行中' : selectedModel.status === 'error' ? '异常' : '已禁用'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedModel.description}
              </Descriptions.Item>
              <Descriptions.Item label="能力">
                <Space wrap>
                  {selectedModel.capabilities.map((cap) => (
                    <Tag key={cap} color={capabilityTags[cap]?.color}>
                      {capabilityTags[cap]?.label}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="API端点">
                <Space>
                  <Text copyable>{selectedModel.config.apiEndpoint}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="API Key">
                <Space>
                  <Text>
                    {showApiKey ? selectedModel.config.apiKey : '••••••••••••'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={showApiKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={() => setShowApiKey(!showApiKey)}
                  />
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>参数配置</Title>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="最大Token">
                {selectedModel.config.maxTokens}
              </Descriptions.Item>
              <Descriptions.Item label="Temperature">
                {selectedModel.config.temperature}
              </Descriptions.Item>
              <Descriptions.Item label="Top P">
                {selectedModel.config.topP}
              </Descriptions.Item>
              <Descriptions.Item label="频率惩罚">
                {selectedModel.config.frequencyPenalty}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24 }}>使用统计</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="总调用次数"
                  value={selectedModel.usage.totalRequests}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总Token消耗"
                  value={selectedModel.usage.totalTokens}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="平均延迟"
                  value={selectedModel.usage.avgLatency}
                  suffix="s"
                  precision={2}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="错误率"
                  value={selectedModel.usage.errorRate * 100}
                  suffix="%"
                  precision={2}
                  valueStyle={{ color: selectedModel.usage.errorRate > 0.1 ? '#ff4d4f' : '#52c41a' }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Drawer>

      {/* 测试模型弹窗 */}
      <Modal
        title={`测试模型 - ${selectedModel?.name}`}
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <TextArea
            rows={4}
            placeholder="输入测试内容..."
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleTestModel}
            loading={testing}
          >
            发送测试
          </Button>
        </div>
        {testOutput && (
          <Card size="small" title="响应结果">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {testOutput}
            </pre>
          </Card>
        )}
      </Modal>
    </div>
  );
}