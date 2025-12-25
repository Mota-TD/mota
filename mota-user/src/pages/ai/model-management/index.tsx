import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Progress,
  Statistic,
  Row,
  Col,
  Badge,
  Tooltip,
  message,
  Popconfirm,
  Alert,
  Divider
} from 'antd';
import {
  ApiOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  SafetyOutlined,
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import {
  getMockProviders,
  getMockModels,
  getMockRoutingRules,
  getMockFallbackStrategies,
  getMockCostStatistics
} from '@/services/api/multiModel';
import styles from './index.module.css';

const { TabPane } = Tabs;
const { Option } = Select;

const ModelManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('providers');
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [routingModalVisible, setRoutingModalVisible] = useState(false);
  const [fallbackModalVisible, setFallbackModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // Mock数据
  const providers = getMockProviders();
  const models = getMockModels();
  const routingRules = getMockRoutingRules();
  const fallbackStrategies = getMockFallbackStrategies();
  const costStats = getMockCostStatistics();

  // 提供商表格列
  const providerColumns = [
    {
      title: '提供商',
      dataIndex: 'providerName',
      key: 'providerName',
      render: (text: string, record: any) => (
        <Space>
          <ApiOutlined style={{ color: record.providerType === 'international' ? '#1890ff' : '#52c41a' }} />
          <span>{text}</span>
          <Tag color={record.providerType === 'international' ? 'blue' : 'green'}>
            {record.providerType === 'international' ? '国际' : '国内'}
          </Tag>
        </Space>
      )
    },
    {
      title: 'API地址',
      dataIndex: 'apiBaseUrl',
      key: 'apiBaseUrl',
      ellipsis: true
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a: any, b: any) => b.priority - a.priority,
      render: (priority: number) => (
        <Tag color={priority >= 90 ? 'gold' : priority >= 70 ? 'blue' : 'default'}>
          {priority}
        </Tag>
      )
    },
    {
      title: '健康状态',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          healthy: { color: 'success', icon: <CheckCircleOutlined />, text: '健康' },
          degraded: { color: 'warning', icon: <ExclamationCircleOutlined />, text: '降级' },
          unhealthy: { color: 'error', icon: <CloseCircleOutlined />, text: '异常' }
        };
        const config = statusConfig[status] || statusConfig.healthy;
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '启用状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: any) => (
        <Switch
          checked={enabled}
          onChange={(checked) => {
            message.success(`${record.providerName} 已${checked ? '启用' : '禁用'}`);
          }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue(record);
                setProviderModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="健康检查">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => message.info('正在检查健康状态...')}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 模型表格列
  const modelColumns = [
    {
      title: '模型',
      dataIndex: 'modelName',
      key: 'modelName',
      render: (text: string, record: any) => (
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
          {record.isDefault && <Tag color="gold">默认</Tag>}
        </Space>
      )
    },
    {
      title: '提供商',
      dataIndex: 'providerName',
      key: 'providerName'
    },
    {
      title: '模型代码',
      dataIndex: 'modelCode',
      key: 'modelCode',
      render: (code: string) => <code>{code}</code>
    },
    {
      title: '上下文窗口',
      dataIndex: 'contextWindow',
      key: 'contextWindow',
      render: (tokens: number) => `${(tokens / 1000).toFixed(0)}K`
    },
    {
      title: '价格 ($/1K tokens)',
      key: 'price',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>输入: ${record.inputPrice}</span>
          <span style={{ fontSize: 12 }}>输出: ${record.outputPrice}</span>
        </Space>
      )
    },
    {
      title: '功能支持',
      key: 'features',
      render: (_: any, record: any) => (
        <Space>
          {record.supportsStreaming && <Tag color="blue">流式</Tag>}
          {record.supportsFunctionCall && <Tag color="purple">函数调用</Tag>}
          {record.supportsVision && <Tag color="cyan">视觉</Tag>}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: any) => (
        <Switch
          checked={enabled}
          onChange={(checked) => {
            message.success(`${record.modelName} 已${checked ? '启用' : '禁用'}`);
          }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="设为默认">
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              disabled={record.isDefault}
              onClick={() => message.success(`已将 ${record.modelName} 设为默认模型`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue(record);
                setModelModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 路由规则表格列
  const routingColumns = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      render: (text: string) => (
        <Space>
          <NodeIndexOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '规则类型',
      dataIndex: 'ruleType',
      key: 'ruleType',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          default: { color: 'default', text: '默认' },
          user_level: { color: 'gold', text: '用户等级' },
          cost: { color: 'green', text: '成本优先' },
          load_balance: { color: 'blue', text: '负载均衡' },
          task_type: { color: 'purple', text: '任务类型' }
        };
        const config = typeMap[type] || typeMap.default;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a: any, b: any) => b.priority - a.priority
    },
    {
      title: '目标模型',
      dataIndex: 'targetModelName',
      key: 'targetModelName'
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => <Progress percent={weight} size="small" />
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: any) => (
        <Switch
          checked={enabled}
          onChange={(checked) => {
            message.success(`规则 ${record.ruleName} 已${checked ? '启用' : '禁用'}`);
          }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue(record);
                setRoutingModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此规则吗？"
            onConfirm={() => message.success('规则已删除')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 降级策略表格列
  const fallbackColumns = [
    {
      title: '策略名称',
      dataIndex: 'strategyName',
      key: 'strategyName',
      render: (text: string) => (
        <Space>
          <SafetyOutlined style={{ color: '#52c41a' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '主模型',
      dataIndex: 'primaryModelName',
      key: 'primaryModelName'
    },
    {
      title: '降级模型',
      dataIndex: 'fallbackModelNames',
      key: 'fallbackModelNames',
      render: (names: string[]) => (
        <Space>
          {names.map((name, index) => (
            <Tag key={index} color={index === 0 ? 'blue' : 'default'}>
              {index + 1}. {name}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '重试配置',
      key: 'retry',
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: 12 }}>最大重试: {record.maxRetries}次</span>
          <span style={{ fontSize: 12 }}>重试延迟: {record.retryDelayMs}ms</span>
        </Space>
      )
    },
    {
      title: '熔断器',
      key: 'circuitBreaker',
      render: (_: any, record: any) => (
        <Space>
          <Switch checked={record.circuitBreakerEnabled} size="small" disabled />
          <span style={{ fontSize: 12 }}>阈值: {record.circuitBreakerThreshold}</span>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: any) => (
        <Switch
          checked={enabled}
          onChange={(checked) => {
            message.success(`策略 ${record.strategyName} 已${checked ? '启用' : '禁用'}`);
          }}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue(record);
                setFallbackModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 熔断器状态
  const circuitBreakerStatus = [
    { modelId: 1, modelName: 'GPT-4', state: 'closed', failureCount: 0 },
    { modelId: 4, modelName: 'Claude 3 Opus', state: 'closed', failureCount: 2 },
    { modelId: 6, modelName: '通义千问-Turbo', state: 'half_open', failureCount: 3 },
    { modelId: 8, modelName: '文心一言4.0', state: 'open', failureCount: 5 }
  ];

  // 渲染提供商管理
  const renderProviders = () => (
    <div>
      <div className={styles.tableHeader}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setProviderModalVisible(true);
            }}
          >
            添加提供商
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => message.info('正在刷新...')}>
            刷新状态
          </Button>
        </Space>
      </div>
      <Table
        columns={providerColumns}
        dataSource={providers}
        rowKey="id"
        pagination={false}
      />
    </div>
  );

  // 渲染模型管理
  const renderModels = () => (
    <div>
      <div className={styles.tableHeader}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setModelModalVisible(true);
            }}
          >
            添加模型
          </Button>
          <Select defaultValue="all" style={{ width: 150 }}>
            <Option value="all">全部提供商</Option>
            {providers.map(p => (
              <Option key={p.id} value={p.id}>{p.providerName}</Option>
            ))}
          </Select>
        </Space>
      </div>
      <Table
        columns={modelColumns}
        dataSource={models}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );

  // 渲染路由规则
  const renderRouting = () => (
    <div>
      <Alert
        message="模型路由说明"
        description="路由规则按优先级从高到低匹配，第一个匹配的规则将被使用。默认规则优先级最低，作为兜底策略。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div className={styles.tableHeader}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setRoutingModalVisible(true);
          }}
        >
          添加路由规则
        </Button>
      </div>
      <Table
        columns={routingColumns}
        dataSource={routingRules}
        rowKey="id"
        pagination={false}
      />
    </div>
  );

  // 渲染降级策略
  const renderFallback = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="降级策略配置" size="small">
            <div className={styles.tableHeader}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingItem(null);
                  form.resetFields();
                  setFallbackModalVisible(true);
                }}
              >
                添加降级策略
              </Button>
            </div>
            <Table
              columns={fallbackColumns}
              dataSource={fallbackStrategies}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card title="熔断器状态" size="small">
            <Row gutter={[16, 16]}>
              {circuitBreakerStatus.map(item => (
                <Col key={item.modelId} xs={24} sm={12} md={6}>
                  <Card
                    size="small"
                    className={styles.circuitBreakerCard}
                    style={{
                      borderColor: item.state === 'closed' ? '#52c41a' :
                        item.state === 'half_open' ? '#faad14' : '#ff4d4f'
                    }}
                  >
                    <div className={styles.circuitBreakerHeader}>
                      <span>{item.modelName}</span>
                      <Tag color={
                        item.state === 'closed' ? 'success' :
                          item.state === 'half_open' ? 'warning' : 'error'
                      }>
                        {item.state === 'closed' ? '关闭' :
                          item.state === 'half_open' ? '半开' : '打开'}
                      </Tag>
                    </div>
                    <div className={styles.circuitBreakerBody}>
                      <span>失败次数: {item.failureCount}</span>
                      {item.state !== 'closed' && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => message.success('熔断器已重置')}
                        >
                          重置
                        </Button>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // 渲染成本控制
  const renderCostControl = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月总调用"
              value={costStats.totalCalls}
              prefix={<ThunderboltOutlined />}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="本月总成本"
              value={costStats.totalCost}
              prefix={<DollarOutlined />}
              suffix="元"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={costStats.avgResponseTime}
              suffix="ms"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="成功率"
              value={costStats.successRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="成本分布" size="small">
            {costStats.byProvider.map(item => (
              <div key={item.providerId} className={styles.costItem}>
                <div className={styles.costItemHeader}>
                  <span>{item.providerName}</span>
                  <span>¥{item.cost.toFixed(2)} ({item.percent}%)</span>
                </div>
                <Progress
                  percent={item.percent}
                  showInfo={false}
                  strokeColor={
                    item.providerId === 1 ? '#1890ff' :
                      item.providerId === 2 ? '#722ed1' : '#52c41a'
                  }
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="预算管理"
            size="small"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setBudgetModalVisible(true)}
              >
                设置预算
              </Button>
            }
          >
            <div className={styles.budgetCard}>
              <div className={styles.budgetHeader}>
                <span>全局月度预算</span>
                <Tag color="blue">¥10,000.00</Tag>
              </div>
              <Progress
                percent={35}
                status="active"
                format={() => `¥${costStats.totalCost.toFixed(2)} / ¥10,000.00`}
              />
              <div className={styles.budgetFooter}>
                <span>预警阈值: 80%</span>
                <span>剩余: ¥{(10000 - costStats.totalCost).toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="调用趋势" size="small" style={{ marginTop: 16 }}>
        <div className={styles.trendChart}>
          <div className={styles.trendPlaceholder}>
            <LineChartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <p>调用趋势图表</p>
            <p style={{ fontSize: 12, color: '#999' }}>
              显示最近30天的调用量和成本趋势
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <SettingOutlined /> 多模型管理
        </h2>
        <p>管理AI模型提供商、配置路由规则、设置降级策略和成本控制</p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={<span><ApiOutlined />提供商管理</span>}
          key="providers"
        >
          {renderProviders()}
        </TabPane>
        <TabPane
          tab={<span><RobotOutlined />模型配置</span>}
          key="models"
        >
          {renderModels()}
        </TabPane>
        <TabPane
          tab={<span><NodeIndexOutlined />路由规则</span>}
          key="routing"
        >
          {renderRouting()}
        </TabPane>
        <TabPane
          tab={<span><SafetyOutlined />降级策略</span>}
          key="fallback"
        >
          {renderFallback()}
        </TabPane>
        <TabPane
          tab={<span><DollarOutlined />成本控制</span>}
          key="cost"
        >
          {renderCostControl()}
        </TabPane>
      </Tabs>

      {/* 提供商编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑提供商' : '添加提供商'}
        open={providerModalVisible}
        onCancel={() => setProviderModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success('保存成功');
            setProviderModalVisible(false);
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="providerName" label="提供商名称" rules={[{ required: true }]}>
            <Input placeholder="请输入提供商名称" />
          </Form.Item>
          <Form.Item name="providerCode" label="提供商代码" rules={[{ required: true }]}>
            <Input placeholder="请输入提供商代码" />
          </Form.Item>
          <Form.Item name="providerType" label="类型" rules={[{ required: true }]}>
            <Select placeholder="请选择类型">
              <Option value="international">国际</Option>
              <Option value="domestic">国内</Option>
            </Select>
          </Form.Item>
          <Form.Item name="apiBaseUrl" label="API地址" rules={[{ required: true }]}>
            <Input placeholder="请输入API基础地址" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 模型编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑模型' : '添加模型'}
        open={modelModalVisible}
        onCancel={() => setModelModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success('保存成功');
            setModelModalVisible(false);
          });
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="modelName" label="模型名称" rules={[{ required: true }]}>
                <Input placeholder="请输入模型名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="modelCode" label="模型代码" rules={[{ required: true }]}>
                <Input placeholder="请输入模型代码" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="providerId" label="提供商" rules={[{ required: true }]}>
                <Select placeholder="请选择提供商">
                  {providers.map(p => (
                    <Option key={p.id} value={p.id}>{p.providerName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contextWindow" label="上下文窗口">
                <InputNumber min={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="inputPrice" label="输入价格 ($/1K tokens)">
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="outputPrice" label="输出价格 ($/1K tokens)">
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 路由规则编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑路由规则' : '添加路由规则'}
        open={routingModalVisible}
        onCancel={() => setRoutingModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success('保存成功');
            setRoutingModalVisible(false);
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ruleName" label="规则名称" rules={[{ required: true }]}>
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true }]}>
            <Select placeholder="请选择规则类型">
              <Option value="default">默认</Option>
              <Option value="user_level">用户等级</Option>
              <Option value="cost">成本优先</Option>
              <Option value="load_balance">负载均衡</Option>
              <Option value="task_type">任务类型</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetModelId" label="目标模型" rules={[{ required: true }]}>
            <Select placeholder="请选择目标模型">
              {models.map(m => (
                <Option key={m.id} value={m.id}>{m.modelName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="weight" label="权重">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 降级策略编辑弹窗 */}
      <Modal
        title={editingItem ? '编辑降级策略' : '添加降级策略'}
        open={fallbackModalVisible}
        onCancel={() => setFallbackModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            message.success('保存成功');
            setFallbackModalVisible(false);
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="strategyName" label="策略名称" rules={[{ required: true }]}>
            <Input placeholder="请输入策略名称" />
          </Form.Item>
          <Form.Item name="primaryModelId" label="主模型" rules={[{ required: true }]}>
            <Select placeholder="请选择主模型">
              {models.map(m => (
                <Option key={m.id} value={m.id}>{m.modelName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fallbackModelIds" label="降级模型" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="请选择降级模型（按顺序）">
              {models.map(m => (
                <Option key={m.id} value={m.id}>{m.modelName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxRetries" label="最大重试次数">
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="retryDelayMs" label="重试延迟(ms)">
                <InputNumber min={100} max={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="circuitBreakerEnabled" label="启用熔断器" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="circuitBreakerThreshold" label="熔断阈值">
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预算设置弹窗 */}
      <Modal
        title="设置预算"
        open={budgetModalVisible}
        onCancel={() => setBudgetModalVisible(false)}
        onOk={() => {
          message.success('预算设置成功');
          setBudgetModalVisible(false);
        }}
      >
        <Form layout="vertical">
          <Form.Item label="预算类型">
            <Select defaultValue="global">
              <Option value="global">全局预算</Option>
              <Option value="user">用户预算</Option>
              <Option value="project">项目预算</Option>
            </Select>
          </Form.Item>
          <Form.Item label="预算周期">
            <Select defaultValue="monthly">
              <Option value="daily">每日</Option>
              <Option value="weekly">每周</Option>
              <Option value="monthly">每月</Option>
            </Select>
          </Form.Item>
          <Form.Item label="预算金额">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              prefix="¥"
              defaultValue={10000}
            />
          </Form.Item>
          <Form.Item label="预警阈值 (%)">
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              defaultValue={80}
            />
          </Form.Item>
          <Form.Item label="硬限制" valuePropName="checked">
            <Switch />
            <span style={{ marginLeft: 8, color: '#999' }}>
              超出预算后禁止调用
            </span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagementPage;