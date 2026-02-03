import {
  CheckCircleOutlined,
  PlusOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  List,
  message,
  Popconfirm,
  Progress,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
} from 'antd';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useRef, useState } from 'react';

// 预算配置类型
interface BudgetConfig {
  id: number;
  name: string;
  type: 'tenant' | 'model' | 'global';
  targetId?: string;
  targetName: string;
  monthlyBudget: number;
  currentSpend: number;
  alertThreshold: number;
  status: 'normal' | 'warning' | 'exceeded';
  enabled: boolean;
  createdAt: string;
}

// 告警记录类型
interface AlertRecord {
  id: number;
  type: 'budget' | 'quota' | 'rate';
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  targetName: string;
  currentValue: number;
  thresholdValue: number;
  status: 'pending' | 'handled' | 'ignored';
  createdAt: string;
  handledAt?: string;
}

const CostControl: React.FC = () => {
  const [createBudgetVisible, setCreateBudgetVisible] = useState(false);
  const [editBudgetVisible, setEditBudgetVisible] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<BudgetConfig | null>(null);
  const actionRef = useRef<ActionType>(null);

  // 模拟预算数据
  const mockBudgets: BudgetConfig[] = [
    {
      id: 1,
      name: '全局月度预算',
      type: 'global',
      targetName: '全局',
      monthlyBudget: 10000,
      currentSpend: 7850.5,
      alertThreshold: 80,
      status: 'warning',
      enabled: true,
      createdAt: '2024-01-01 00:00:00',
    },
    {
      id: 2,
      name: '租户A预算',
      type: 'tenant',
      targetId: 'tenant-a',
      targetName: '租户A',
      monthlyBudget: 3000,
      currentSpend: 2450.2,
      alertThreshold: 85,
      status: 'warning',
      enabled: true,
      createdAt: '2024-01-15 10:00:00',
    },
    {
      id: 3,
      name: 'GPT-4模型预算',
      type: 'model',
      targetId: 'gpt-4',
      targetName: 'GPT-4',
      monthlyBudget: 5000,
      currentSpend: 3200.8,
      alertThreshold: 90,
      status: 'normal',
      enabled: true,
      createdAt: '2024-01-10 09:00:00',
    },
    {
      id: 4,
      name: '租户B预算',
      type: 'tenant',
      targetId: 'tenant-b',
      targetName: '租户B',
      monthlyBudget: 2000,
      currentSpend: 2150.3,
      alertThreshold: 80,
      status: 'exceeded',
      enabled: true,
      createdAt: '2024-01-20 11:00:00',
    },
  ];

  // 模拟告警记录
  const mockAlerts: AlertRecord[] = [
    {
      id: 1,
      type: 'budget',
      level: 'error',
      title: '预算超支',
      message: '租户B的月度预算已超支，当前支出$2,150.30，预算$2,000.00',
      targetName: '租户B',
      currentValue: 2150.3,
      thresholdValue: 2000,
      status: 'pending',
      createdAt: '2024-02-01 15:30:00',
    },
    {
      id: 2,
      type: 'budget',
      level: 'warning',
      title: '预算告警',
      message: '全局月度预算使用率达到78.5%，已超过警戒线80%',
      targetName: '全局',
      currentValue: 7850.5,
      thresholdValue: 8000,
      status: 'pending',
      createdAt: '2024-02-01 14:20:00',
    },
    {
      id: 3,
      type: 'budget',
      level: 'warning',
      title: '预算告警',
      message: '租户A的月度预算使用率达到81.7%，接近预算上限',
      targetName: '租户A',
      currentValue: 2450.2,
      thresholdValue: 2550,
      status: 'handled',
      createdAt: '2024-02-01 10:15:00',
      handledAt: '2024-02-01 16:00:00',
    },
    {
      id: 4,
      type: 'rate',
      level: 'warning',
      title: '调用频率异常',
      message: 'GPT-4模型调用频率超过正常水平200%',
      targetName: 'GPT-4',
      currentValue: 15000,
      thresholdValue: 5000,
      status: 'handled',
      createdAt: '2024-01-31 23:45:00',
      handledAt: '2024-02-01 09:00:00',
    },
  ];

  // 统计数据
  const statsData = {
    totalBudget: 10000,
    currentSpend: 7850.5,
    remainingBudget: 2149.5,
    totalAlerts: 12,
    pendingAlerts: 5,
    exceededBudgets: 1,
    warningBudgets: 2,
  };

  // 成本趋势图表
  const getCostTrendOption = (): EChartsOption => {
    const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`);
    const budget = Array(30).fill(333.33); // 月预算/30天
    const actual = Array.from(
      { length: 30 },
      (_, i) => Math.random() * 150 + 200 + i * 5,
    );

    return {
      title: {
        text: '本月成本趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['实际支出', '预算线'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: days,
      },
      yAxis: {
        type: 'value',
        name: '成本 ($)',
      },
      series: [
        {
          name: '实际支出',
          type: 'line',
          data: actual,
          smooth: true,
          itemStyle: { color: '#10B981' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
              ],
            },
          },
        },
        {
          name: '预算线',
          type: 'line',
          data: budget,
          lineStyle: {
            type: 'dashed',
            color: '#EF4444',
          },
          itemStyle: { color: '#EF4444' },
        },
      ],
    };
  };

  // 预算使用分布
  const getBudgetDistributionOption = (): EChartsOption => {
    const data = mockBudgets.map((b) => ({
      name: b.targetName,
      value: b.currentSpend,
    }));

    return {
      title: {
        text: '预算使用分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 'right',
      },
      series: [
        {
          name: '成本',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    };
  };

  // 成本优化建议
  const optimizationSuggestions = [
    {
      title: '使用更经济的模型',
      description: '对于简单任务，建议使用GPT-3.5替代GPT-4，可节省约90%成本',
      potential: 850,
    },
    {
      title: '优化Token使用',
      description: '通过精简提示词和优化上下文，平均可减少30%的Token消耗',
      potential: 650,
    },
    {
      title: '实施缓存策略',
      description: '对相似查询实施缓存，可减少约25%的API调用',
      potential: 450,
    },
    {
      title: '设置调用频率限制',
      description: '为租户设置合理的调用频率限制，避免异常消耗',
      potential: 300,
    },
  ];

  // 切换预算状态
  const handleToggleBudget = async (record: BudgetConfig) => {
    message.success(`预算配置已${record.enabled ? '禁用' : '启用'}`);
    actionRef.current?.reload();
  };

  // 删除预算
  const handleDeleteBudget = async (_id: number) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  // 编辑预算
  const handleEditBudget = (record: BudgetConfig) => {
    setCurrentBudget(record);
    setEditBudgetVisible(true);
  };

  // 处理告警
  const handleAlert = async (_id: number, action: 'handle' | 'ignore') => {
    message.success(`告警已${action === 'handle' ? '处理' : '忽略'}`);
  };

  // 预算表格列
  const budgetColumns: ProColumns<BudgetConfig>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '预算名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        global: { text: '全局' },
        tenant: { text: '租户' },
        model: { text: '模型' },
      },
      render: (_, record) => (
        <Tag
          color={
            record.type === 'global'
              ? 'blue'
              : record.type === 'tenant'
                ? 'green'
                : 'orange'
          }
        >
          {record.type === 'global'
            ? '全局'
            : record.type === 'tenant'
              ? '租户'
              : '模型'}
        </Tag>
      ),
    },
    {
      title: '目标对象',
      dataIndex: 'targetName',
      width: 120,
      search: false,
    },
    {
      title: '月度预算',
      dataIndex: 'monthlyBudget',
      width: 120,
      search: false,
      render: (text) => `$${(text as number).toFixed(2)}`,
    },
    {
      title: '当前支出',
      dataIndex: 'currentSpend',
      width: 120,
      search: false,
      render: (text) => `$${(text as number).toFixed(2)}`,
    },
    {
      title: '使用率',
      width: 200,
      search: false,
      render: (_, record) => {
        const percentage = (record.currentSpend / record.monthlyBudget) * 100;
        return (
          <Progress
            percent={Math.min(percentage, 100)}
            status={
              percentage >= 100
                ? 'exception'
                : percentage >= record.alertThreshold
                  ? 'normal'
                  : 'success'
            }
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        normal: { text: '正常', status: 'Success' },
        warning: { text: '告警', status: 'Warning' },
        exceeded: { text: '超支', status: 'Error' },
      },
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      width: 100,
      search: false,
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          onChange={() => handleToggleBudget(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <a key="edit" onClick={() => handleEditBudget(record)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这个预算配置吗？"
          onConfirm={() => handleDeleteBudget(record.id)}
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
      {/* 告警横幅 */}
      {statsData.pendingAlerts > 0 && (
        <Alert
          message={`当前有 ${statsData.pendingAlerts} 条待处理告警`}
          description="请及时查看并处理预算告警，避免成本失控"
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="月度总预算"
              value={statsData.totalBudget}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="当前支出"
              value={statsData.currentSpend}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#EF4444' }}
            />
            <Progress
              percent={(statsData.currentSpend / statsData.totalBudget) * 100}
              status="active"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="剩余预算"
              value={statsData.remainingBudget}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="告警总数"
              value={statsData.totalAlerts}
              suffix={
                <span style={{ fontSize: 14 }}>
                  (待处理: {statsData.pendingAlerts})
                </span>
              }
              valueStyle={{
                color: statsData.pendingAlerts > 0 ? '#EF4444' : '#000',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card>
            <ReactECharts
              option={getCostTrendOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <ReactECharts
              option={getBudgetDistributionOption()}
              style={{ height: 350 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 告警列表 */}
      <ProCard title="最近告警" headerBordered style={{ marginBottom: 16 }}>
        <List
          dataSource={mockAlerts}
          renderItem={(item) => (
            <List.Item
              actions={
                item.status === 'pending'
                  ? [
                      <Button
                        key="handle"
                        type="link"
                        size="small"
                        onClick={() => handleAlert(item.id, 'handle')}
                      >
                        处理
                      </Button>,
                      <Button
                        key="ignore"
                        type="link"
                        size="small"
                        danger
                        onClick={() => handleAlert(item.id, 'ignore')}
                      >
                        忽略
                      </Button>,
                    ]
                  : [
                      <Tag key="status" color="success">
                        已处理
                      </Tag>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    status={
                      item.level === 'error'
                        ? 'error'
                        : item.level === 'warning'
                          ? 'warning'
                          : 'processing'
                    }
                  />
                }
                title={
                  <Space>
                    <span>{item.title}</span>
                    <Tag
                      color={
                        item.type === 'budget'
                          ? 'blue'
                          : item.type === 'quota'
                            ? 'green'
                            : 'orange'
                      }
                    >
                      {item.type === 'budget'
                        ? '预算'
                        : item.type === 'quota'
                          ? '配额'
                          : '频率'}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{item.message}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                      {item.targetName} · {item.createdAt}
                      {item.handledAt && ` · 处理于 ${item.handledAt}`}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </ProCard>

      {/* 成本优化建议 */}
      <ProCard title="成本优化建议" headerBordered style={{ marginBottom: 16 }}>
        <List
          dataSource={optimizationSuggestions}
          renderItem={(item) => (
            <List.Item
              extra={
                <Statistic
                  title="预计节省"
                  value={item.potential}
                  prefix="$"
                  valueStyle={{ fontSize: 20, color: '#22C55E' }}
                />
              }
            >
              <List.Item.Meta
                avatar={
                  <CheckCircleOutlined
                    style={{ fontSize: 24, color: '#22C55E' }}
                  />
                }
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </ProCard>

      {/* 预算配置表格 */}
      <ProCard title="预算配置" headerBordered>
        <ProTable<BudgetConfig>
          columns={budgetColumns}
          dataSource={mockBudgets}
          actionRef={actionRef}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          search={{
            labelWidth: 'auto',
          }}
          scroll={{ x: 1400 }}
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateBudgetVisible(true)}
            >
              新建预算
            </Button>,
          ]}
        />
      </ProCard>

      {/* 新建预算对话框 */}
      <ModalForm
        title="新建预算配置"
        open={createBudgetVisible}
        onOpenChange={setCreateBudgetVisible}
        onFinish={async (values) => {
          console.log('新建预算:', values);
          message.success('创建成功');
          setCreateBudgetVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="预算名称"
          placeholder="请输入预算名称"
          rules={[{ required: true, message: '请输入预算名称' }]}
        />
        <ProFormSelect
          name="type"
          label="预算类型"
          placeholder="请选择预算类型"
          options={[
            { label: '全局预算', value: 'global' },
            { label: '租户预算', value: 'tenant' },
            { label: '模型预算', value: 'model' },
          ]}
          rules={[{ required: true, message: '请选择预算类型' }]}
        />
        <ProFormSelect
          name="targetId"
          label="目标对象"
          placeholder="请选择目标对象"
          options={[
            { label: '租户A', value: 'tenant-a' },
            { label: '租户B', value: 'tenant-b' },
            { label: 'GPT-4', value: 'gpt-4' },
            { label: 'GPT-3.5', value: 'gpt-3.5' },
          ]}
          fieldProps={{
            showSearch: true,
          }}
        />
        <ProFormDigit
          name="monthlyBudget"
          label="月度预算($)"
          placeholder="请输入月度预算"
          min={0}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: '请输入月度预算' }]}
        />
        <ProFormDigit
          name="alertThreshold"
          label="告警阈值(%)"
          placeholder="请输入告警阈值"
          min={0}
          max={100}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: '请输入告警阈值' }]}
          extra="当使用率达到此阈值时触发告警"
        />
      </ModalForm>

      {/* 编辑预算对话框 */}
      <ModalForm
        title="编辑预算配置"
        open={editBudgetVisible}
        onOpenChange={setEditBudgetVisible}
        initialValues={currentBudget || {}}
        onFinish={async (values) => {
          console.log('编辑预算:', values);
          message.success('更新成功');
          setEditBudgetVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="预算名称"
          placeholder="请输入预算名称"
          rules={[{ required: true, message: '请输入预算名称' }]}
        />
        <ProFormDigit
          name="monthlyBudget"
          label="月度预算($)"
          placeholder="请输入月度预算"
          min={0}
          fieldProps={{ precision: 2 }}
          rules={[{ required: true, message: '请输入月度预算' }]}
        />
        <ProFormDigit
          name="alertThreshold"
          label="告警阈值(%)"
          placeholder="请输入告警阈值"
          min={0}
          max={100}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: '请输入告警阈值' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default CostControl;
