import {
  EyeInvisibleOutlined,
  EyeOutlined,
  KeyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

// AI模型类型定义
interface AIModel {
  id: number;
  name: string;
  provider: string;
  modelId: string;
  apiKey: string;
  apiEndpoint: string;
  maxTokens: number;
  temperature: number;
  status: 'enabled' | 'disabled';
  usageCount: number;
  totalTokens: number;
  costPerToken: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const AIModelList: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<number, boolean>>({});
  const actionRef = useRef<ActionType>(null);

  // 模拟数据
  const mockData: AIModel[] = [
    {
      id: 1,
      name: 'GPT-4',
      provider: 'OpenAI',
      modelId: 'gpt-4',
      apiKey: 'sk-xxxxxxxxxxxxxxxxxxxx',
      apiEndpoint: 'https://api.openai.com/v1',
      maxTokens: 8192,
      temperature: 0.7,
      status: 'enabled',
      usageCount: 15234,
      totalTokens: 45678900,
      costPerToken: 0.00003,
      description: 'OpenAI GPT-4 模型，最强大的语言模型',
      createdAt: '2024-01-15 10:00:00',
      updatedAt: '2024-02-01 15:30:00',
    },
    {
      id: 2,
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      modelId: 'gpt-3.5-turbo',
      apiKey: 'sk-yyyyyyyyyyyyyyyyyyyy',
      apiEndpoint: 'https://api.openai.com/v1',
      maxTokens: 4096,
      temperature: 0.8,
      status: 'enabled',
      usageCount: 89567,
      totalTokens: 234567890,
      costPerToken: 0.000002,
      description: 'OpenAI GPT-3.5 Turbo 模型，性价比高',
      createdAt: '2024-01-10 09:00:00',
      updatedAt: '2024-02-01 14:20:00',
    },
    {
      id: 3,
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      modelId: 'claude-3-opus-20240229',
      apiKey: 'sk-ant-zzzzzzzzzzzzzzzzzzz',
      apiEndpoint: 'https://api.anthropic.com/v1',
      maxTokens: 200000,
      temperature: 0.7,
      status: 'enabled',
      usageCount: 8234,
      totalTokens: 98765432,
      costPerToken: 0.000015,
      description: 'Anthropic Claude 3 Opus，超长上下文',
      createdAt: '2024-01-20 11:00:00',
      updatedAt: '2024-02-01 16:45:00',
    },
    {
      id: 4,
      name: 'Gemini Pro',
      provider: 'Google',
      modelId: 'gemini-pro',
      apiKey: 'AIzaSyDxxxxxxxxxxxxxx',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
      maxTokens: 30720,
      temperature: 0.9,
      status: 'disabled',
      usageCount: 1234,
      totalTokens: 12345678,
      costPerToken: 0.0000025,
      description: 'Google Gemini Pro 模型，多模态支持',
      createdAt: '2024-01-25 13:00:00',
      updatedAt: '2024-01-30 10:00:00',
    },
  ];

  // 获取数据
  const fetchData = async (params: any) => {
    console.log('params:', params);
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...mockData];

    if (params.name) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(params.name.toLowerCase()),
      );
    }
    if (params.provider) {
      filteredData = filteredData.filter(
        (item) => item.provider === params.provider,
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(
        (item) => item.status === params.status,
      );
    }

    const total = filteredData.length;
    const startIndex = ((params.current || 1) - 1) * (params.pageSize || 10);
    const endIndex = startIndex + (params.pageSize || 10);
    const data = filteredData.slice(startIndex, endIndex);

    return {
      data,
      total,
      success: true,
    };
  };

  // 切换模型状态
  const handleToggleStatus = async (record: AIModel) => {
    const newStatus = record.status === 'enabled' ? 'disabled' : 'enabled';
    message.success(
      `模型 ${record.name} 已${newStatus === 'enabled' ? '启用' : '停用'}`,
    );
    actionRef.current?.reload();
  };

  // 删除模型
  const handleDelete = async (_id: number) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  // 批量启用
  const handleBatchEnable = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要启用的模型');
      return;
    }
    message.success(`已启用 ${selectedRowKeys.length} 个模型`);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  // 批量停用
  const handleBatchDisable = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要停用的模型');
      return;
    }
    message.success(`已停用 ${selectedRowKeys.length} 个模型`);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的模型');
      return;
    }
    message.success(`已删除 ${selectedRowKeys.length} 个模型`);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  // 查看详情
  const handleViewDetail = (record: AIModel) => {
    setCurrentModel(record);
    setDetailVisible(true);
  };

  // 编辑模型
  const handleEdit = (record: AIModel) => {
    setCurrentModel(record);
    setEditModalVisible(true);
  };

  // 切换API密钥显示
  const toggleApiKey = (id: number) => {
    setShowApiKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 表格列定义
  const columns: ProColumns<AIModel>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '模型名称',
      dataIndex: 'name',
      width: 150,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleViewDetail(record)}>{record.name}</a>
          {record.status === 'enabled' && <Badge status="success" />}
        </Space>
      ),
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      width: 120,
      valueType: 'select',
      valueEnum: {
        OpenAI: { text: 'OpenAI' },
        Anthropic: { text: 'Anthropic' },
        Google: { text: 'Google' },
        Azure: { text: 'Azure' },
      },
      render: (_, record) => (
        <Tag
          color={
            record.provider === 'OpenAI'
              ? 'blue'
              : record.provider === 'Anthropic'
                ? 'purple'
                : record.provider === 'Google'
                  ? 'orange'
                  : 'cyan'
          }
        >
          {record.provider}
        </Tag>
      ),
    },
    {
      title: '模型ID',
      dataIndex: 'modelId',
      width: 180,
      search: false,
      ellipsis: true,
    },
    {
      title: 'API密钥',
      dataIndex: 'apiKey',
      width: 200,
      search: false,
      render: (_, record) => (
        <Space>
          <span style={{ fontFamily: 'monospace' }}>
            {showApiKey[record.id]
              ? record.apiKey
              : `${record.apiKey.substring(0, 10)}...`}
          </span>
          <Button
            type="link"
            size="small"
            icon={
              showApiKey[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />
            }
            onClick={() => toggleApiKey(record.id)}
          />
        </Space>
      ),
    },
    {
      title: '最大Token',
      dataIndex: 'maxTokens',
      width: 100,
      search: false,
      render: (text) => text?.toLocaleString(),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 100,
      search: false,
      sorter: true,
      render: (text) => text?.toLocaleString(),
    },
    {
      title: '总Token数',
      dataIndex: 'totalTokens',
      width: 120,
      search: false,
      sorter: true,
      render: (text) => (text as number)?.toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        enabled: { text: '已启用', status: 'Success' },
        disabled: { text: '已停用', status: 'Default' },
      },
      render: (_, record) => (
        <Switch
          checked={record.status === 'enabled'}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 160,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      fixed: 'right',
      render: (_, record) => [
        <a key="view" onClick={() => handleViewDetail(record)}>
          查看
        </a>,
        <a key="edit" onClick={() => handleEdit(record)}>
          编辑
        </a>,
        <a key="apikey">
          <KeyOutlined /> 密钥
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这个模型吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="模型总数" value={mockData.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="启用模型"
              value={mockData.filter((m) => m.status === 'enabled').length}
              suffix="个"
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总调用次数"
              value={mockData.reduce((sum, m) => sum + m.usageCount, 0)}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总Token消耗"
              value={mockData.reduce((sum, m) => sum + m.totalTokens, 0)}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      {/* 表格 */}
      <ProTable<AIModel>
        columns={columns}
        actionRef={actionRef}
        request={fetchData}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <Space size={24}>
            <span>已选择 {selectedRowKeys.length} 项</span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <a onClick={handleBatchEnable}>批量启用</a>
            <a onClick={handleBatchDisable}>批量停用</a>
            <Popconfirm
              title="确定要删除选中的模型吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ color: 'red' }}>批量删除</a>
            </Popconfirm>
          </Space>
        )}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 1500 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建模型
          </Button>,
        ]}
      />

      {/* 新建模型对话框 */}
      <ModalForm
        title="新建AI模型"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          console.log('新建模型:', values);
          message.success('创建成功');
          setCreateModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="模型名称"
          placeholder="请输入模型名称"
          rules={[{ required: true, message: '请输入模型名称' }]}
        />
        <ProFormSelect
          name="provider"
          label="提供商"
          placeholder="请选择提供商"
          options={[
            { label: 'OpenAI', value: 'OpenAI' },
            { label: 'Anthropic', value: 'Anthropic' },
            { label: 'Google', value: 'Google' },
            { label: 'Azure', value: 'Azure' },
          ]}
          rules={[{ required: true, message: '请选择提供商' }]}
        />
        <ProFormText
          name="modelId"
          label="模型ID"
          placeholder="请输入模型ID，如：gpt-4"
          rules={[{ required: true, message: '请输入模型ID' }]}
        />
        <ProFormText
          name="apiKey"
          label="API密钥"
          placeholder="请输入API密钥"
          rules={[{ required: true, message: '请输入API密钥' }]}
        />
        <ProFormText
          name="apiEndpoint"
          label="API端点"
          placeholder="请输入API端点URL"
          rules={[{ required: true, message: '请输入API端点' }]}
        />
        <ProFormDigit
          name="maxTokens"
          label="最大Token数"
          placeholder="请输入最大Token数"
          min={1}
          max={200000}
          rules={[{ required: true, message: '请输入最大Token数' }]}
        />
        <ProFormDigit
          name="temperature"
          label="Temperature"
          placeholder="请输入Temperature"
          min={0}
          max={2}
          fieldProps={{ step: 0.1, precision: 1 }}
          rules={[{ required: true, message: '请输入Temperature' }]}
        />
        <ProFormDigit
          name="costPerToken"
          label="每Token成本($)"
          placeholder="请输入每Token成本"
          min={0}
          fieldProps={{ step: 0.000001, precision: 6 }}
          rules={[{ required: true, message: '请输入每Token成本' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模型描述"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 编辑模型对话框 */}
      <ModalForm
        title="编辑AI模型"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={currentModel || {}}
        onFinish={async (values) => {
          console.log('编辑模型:', values);
          message.success('更新成功');
          setEditModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="模型名称"
          placeholder="请输入模型名称"
          rules={[{ required: true, message: '请输入模型名称' }]}
        />
        <ProFormSelect
          name="provider"
          label="提供商"
          placeholder="请选择提供商"
          options={[
            { label: 'OpenAI', value: 'OpenAI' },
            { label: 'Anthropic', value: 'Anthropic' },
            { label: 'Google', value: 'Google' },
            { label: 'Azure', value: 'Azure' },
          ]}
          rules={[{ required: true, message: '请选择提供商' }]}
        />
        <ProFormText
          name="modelId"
          label="模型ID"
          placeholder="请输入模型ID"
          rules={[{ required: true, message: '请输入模型ID' }]}
        />
        <ProFormText
          name="apiKey"
          label="API密钥"
          placeholder="请输入API密钥"
          rules={[{ required: true, message: '请输入API密钥' }]}
        />
        <ProFormText
          name="apiEndpoint"
          label="API端点"
          placeholder="请输入API端点URL"
          rules={[{ required: true, message: '请输入API端点' }]}
        />
        <ProFormDigit
          name="maxTokens"
          label="最大Token数"
          placeholder="请输入最大Token数"
          min={1}
          max={200000}
          rules={[{ required: true, message: '请输入最大Token数' }]}
        />
        <ProFormDigit
          name="temperature"
          label="Temperature"
          placeholder="请输入Temperature"
          min={0}
          max={2}
          fieldProps={{ step: 0.1, precision: 1 }}
          rules={[{ required: true, message: '请输入Temperature' }]}
        />
        <ProFormDigit
          name="costPerToken"
          label="每Token成本($)"
          placeholder="请输入每Token成本"
          min={0}
          fieldProps={{ step: 0.000001, precision: 6 }}
          rules={[{ required: true, message: '请输入每Token成本' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模型描述"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 详情抽屉 */}
      <Drawer
        title="模型详情"
        width={720}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentModel && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="模型名称" span={2}>
              {currentModel.name}
            </Descriptions.Item>
            <Descriptions.Item label="提供商">
              <Tag
                color={
                  currentModel.provider === 'OpenAI'
                    ? 'blue'
                    : currentModel.provider === 'Anthropic'
                      ? 'purple'
                      : currentModel.provider === 'Google'
                        ? 'orange'
                        : 'cyan'
                }
              >
                {currentModel.provider}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge
                status={
                  currentModel.status === 'enabled' ? 'success' : 'default'
                }
                text={currentModel.status === 'enabled' ? '已启用' : '已停用'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="模型ID" span={2}>
              <span style={{ fontFamily: 'monospace' }}>
                {currentModel.modelId}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="API端点" span={2}>
              {currentModel.apiEndpoint}
            </Descriptions.Item>
            <Descriptions.Item label="API密钥" span={2}>
              <Space>
                <span style={{ fontFamily: 'monospace' }}>
                  {showApiKey[currentModel.id]
                    ? currentModel.apiKey
                    : `${currentModel.apiKey.substring(0, 10)}...`}
                </span>
                <Button
                  type="link"
                  size="small"
                  icon={
                    showApiKey[currentModel.id] ? (
                      <EyeInvisibleOutlined />
                    ) : (
                      <EyeOutlined />
                    )
                  }
                  onClick={() => toggleApiKey(currentModel.id)}
                />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="最大Token数">
              {currentModel.maxTokens.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Temperature">
              {currentModel.temperature}
            </Descriptions.Item>
            <Descriptions.Item label="每Token成本">
              ${currentModel.costPerToken}
            </Descriptions.Item>
            <Descriptions.Item label="使用次数">
              {currentModel.usageCount.toLocaleString()} 次
            </Descriptions.Item>
            <Descriptions.Item label="总Token消耗" span={2}>
              {currentModel.totalTokens.toLocaleString()} 个
            </Descriptions.Item>
            <Descriptions.Item label="总成本">
              $
              {(currentModel.totalTokens * currentModel.costPerToken).toFixed(
                2,
              )}
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {currentModel.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {currentModel.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {currentModel.updatedAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default AIModelList;
