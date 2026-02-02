import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  type ProColumns,
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
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';

/**
 * 模板数据类型
 */
interface Template {
  id: number;
  name: string;
  type: 'prompt' | 'document' | 'workflow' | 'report';
  category: string;
  description: string;
  content: string;
  variables: string[]; // 模板变量
  usageCount: number; // 使用次数
  status: 'active' | 'inactive';
  creator: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 模板管理页面
 * 完整的模板CRUD功能，包括类型筛选、复制模板等
 */
const TemplateList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  // 模拟模板数据
  const mockTemplates: Template[] = [
    {
      id: 1,
      name: '客户服务回复模板',
      type: 'prompt',
      category: '客户服务',
      description: '用于快速回复客户常见问题的AI提示词模板',
      content:
        '您好，{{customer_name}}！感谢您的咨询。关于{{question_topic}}，我们的建议是：{{solution}}。如有其他问题，请随时联系我们。',
      variables: ['customer_name', 'question_topic', 'solution'],
      usageCount: 256,
      status: 'active',
      creator: '张三',
      createdAt: '2024-01-15 10:00:00',
      updatedAt: '2024-02-01 09:30:00',
    },
    {
      id: 2,
      name: '产品需求文档模板',
      type: 'document',
      category: '产品管理',
      description: '标准化的产品需求文档模板，包含所有必要章节',
      content:
        '# {{product_name}} 需求文档\n\n## 1. 产品概述\n{{overview}}\n\n## 2. 功能需求\n{{requirements}}\n\n## 3. 技术方案\n{{technical_solution}}',
      variables: [
        'product_name',
        'overview',
        'requirements',
        'technical_solution',
      ],
      usageCount: 128,
      status: 'active',
      creator: '李四',
      createdAt: '2024-01-20 14:30:00',
      updatedAt: '2024-01-28 16:00:00',
    },
    {
      id: 3,
      name: '数据分析工作流',
      type: 'workflow',
      category: '数据分析',
      description:
        '标准数据分析流程模板，包含数据收集、清洗、分析、可视化等步骤',
      content:
        '1. 数据收集：{{data_source}}\n2. 数据清洗：{{cleaning_steps}}\n3. 数据分析：{{analysis_methods}}\n4. 结果可视化：{{visualization_type}}',
      variables: [
        'data_source',
        'cleaning_steps',
        'analysis_methods',
        'visualization_type',
      ],
      usageCount: 89,
      status: 'active',
      creator: '王五',
      createdAt: '2024-01-25 09:00:00',
      updatedAt: '2024-01-30 11:20:00',
    },
    {
      id: 4,
      name: '周报生成模板',
      type: 'report',
      category: '项目管理',
      description: '自动生成项目周报的模板',
      content:
        '# {{project_name}} 周报（{{week_date}}）\n\n## 本周完成\n{{completed_tasks}}\n\n## 进行中\n{{ongoing_tasks}}\n\n## 下周计划\n{{next_week_plan}}\n\n## 风险与问题\n{{risks}}',
      variables: [
        'project_name',
        'week_date',
        'completed_tasks',
        'ongoing_tasks',
        'next_week_plan',
        'risks',
      ],
      usageCount: 456,
      status: 'active',
      creator: '赵六',
      createdAt: '2024-01-10 16:00:00',
      updatedAt: '2024-02-01 10:00:00',
    },
    {
      id: 5,
      name: '旧版营销文案模板',
      type: 'prompt',
      category: '营销推广',
      description: '已废弃的营销文案生成模板',
      content:
        '产品名称：{{product}}\n卖点：{{selling_points}}\n目标用户：{{target_audience}}',
      variables: ['product', 'selling_points', 'target_audience'],
      usageCount: 23,
      status: 'inactive',
      creator: '张三',
      createdAt: '2024-01-05 11:00:00',
      updatedAt: '2024-01-15 14:00:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockTemplates.length,
    active: mockTemplates.filter((t) => t.status === 'active').length,
    totalUsage: mockTemplates.reduce((sum, t) => sum + t.usageCount, 0),
    avgUsage: Math.round(
      mockTemplates.reduce((sum, t) => sum + t.usageCount, 0) /
        mockTemplates.length,
    ),
  };

  // 定义表格列
  const columns: ProColumns<Template>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      render: (_, record) => <strong>{record.name}</strong>,
    },
    {
      title: '模板类型',
      dataIndex: 'type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        prompt: { text: '提示词', status: 'Processing' },
        document: { text: '文档', status: 'Success' },
        workflow: { text: '工作流', status: 'Warning' },
        report: { text: '报告', status: 'Default' },
      },
      render: (_, record) => {
        const typeConfig = {
          prompt: { color: 'blue', text: '提示词' },
          document: { color: 'green', text: '文档' },
          workflow: { color: 'orange', text: '工作流' },
          report: { color: 'purple', text: '报告' },
        };
        const config = typeConfig[record.type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (_, record) => <Tag>{record.category}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 250,
      search: false,
      ellipsis: true,
    },
    {
      title: '变量数',
      dataIndex: 'variables',
      width: 100,
      search: false,
      render: (_, record) => (
        <Badge count={record.variables.length} showZero color="cyan" />
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => (
        <Badge count={record.usageCount} showZero overflowCount={999} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '禁用', status: 'Default' },
      },
      render: (_, record) => (
        <Badge
          status={record.status === 'active' ? 'success' : 'default'}
          text={record.status === 'active' ? '启用' : '禁用'}
        />
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      width: 220,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#e8e8e8' }}>|</span>}>
          <a
            onClick={() => {
              setCurrentTemplate(record);
              setEditModalVisible(true);
            }}
          >
            <EditOutlined /> 编辑
          </a>
          <a
            onClick={() => {
              // 复制模板
              message.success(`已复制模板"${record.name}"`);
              actionRef.current?.reload();
            }}
            style={{ color: '#1890ff' }}
          >
            <CopyOutlined /> 复制
          </a>
          {record.status === 'active' ? (
            <Popconfirm
              title="确认禁用该模板？"
              onConfirm={async () => {
                message.success('禁用成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#faad14' }}>禁用</a>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认启用该模板？"
              onConfirm={async () => {
                message.success('启用成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#52c41a' }}>启用</a>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除该模板？"
            description="此操作不可恢复"
            onConfirm={async () => {
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <a style={{ color: '#ff4d4f' }}>
              <DeleteOutlined /> 删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="模板总数" value={stats.total} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用模板"
              value={stats.active}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总使用次数"
              value={stats.totalUsage}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均使用"
              value={stats.avgUsage}
              suffix="次/模板"
            />
          </Card>
        </Col>
      </Row>

      {/* 模板列表 */}
      <ProTable<Template>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockTemplates];

          // 搜索过滤
          if (params.name) {
            data = data.filter((item) =>
              item.name.includes(params.name as string),
            );
          }
          if (params.type) {
            data = data.filter((item) => item.type === params.type);
          }
          if (params.category) {
            data = data.filter((item) =>
              item.category.includes(params.category as string),
            );
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
          }
          if (params.creator) {
            data = data.filter((item) =>
              item.creator.includes(params.creator as string),
            );
          }

          return {
            data,
            total: data.length,
            success: true,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{ x: 1600 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建模板
          </Button>,
        ]}
      />

      {/* 创建模板弹窗 */}
      <ModalForm
        title="新建模板"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          console.log('创建模板:', values);
          message.success('创建成功');
          setCreateModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={700}
      >
        <ProFormText
          name="name"
          label="模板名称"
          placeholder="请输入模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        />
        <ProFormSelect
          name="type"
          label="模板类型"
          placeholder="请选择模板类型"
          rules={[{ required: true, message: '请选择模板类型' }]}
          options={[
            { label: '提示词', value: 'prompt' },
            { label: '文档', value: 'document' },
            { label: '工作流', value: 'workflow' },
            { label: '报告', value: 'report' },
          ]}
        />
        <ProFormText
          name="category"
          label="分类"
          placeholder="请输入分类"
          rules={[{ required: true, message: '请输入分类' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模板描述"
          fieldProps={{ rows: 3 }}
          rules={[{ required: true, message: '请输入模板描述' }]}
        />
        <ProFormTextArea
          name="content"
          label="模板内容"
          placeholder="请输入模板内容，使用 {{变量名}} 表示变量"
          fieldProps={{ rows: 8 }}
          rules={[{ required: true, message: '请输入模板内容' }]}
          extra="提示：使用 {{变量名}} 格式定义变量，如 {{customer_name}}"
        />
        <ProFormText
          name="variables"
          label="变量列表"
          placeholder="请输入变量名称，多个用逗号分隔"
          extra="示例：customer_name, product_name, date"
        />
      </ModalForm>

      {/* 编辑模板弹窗 */}
      <ModalForm
        title="编辑模板"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={{
          ...currentTemplate,
          variables: currentTemplate?.variables.join(', '),
        }}
        onFinish={async (values) => {
          console.log('编辑模板:', values);
          message.success('更新成功');
          setEditModalVisible(false);
          setCurrentTemplate(null);
          actionRef.current?.reload();
          return true;
        }}
        width={700}
      >
        <ProFormText
          name="name"
          label="模板名称"
          placeholder="请输入模板名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        />
        <ProFormSelect
          name="type"
          label="模板类型"
          placeholder="请选择模板类型"
          rules={[{ required: true, message: '请选择模板类型' }]}
          options={[
            { label: '提示词', value: 'prompt' },
            { label: '文档', value: 'document' },
            { label: '工作流', value: 'workflow' },
            { label: '报告', value: 'report' },
          ]}
        />
        <ProFormText
          name="category"
          label="分类"
          placeholder="请输入分类"
          rules={[{ required: true, message: '请输入分类' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模板描述"
          fieldProps={{ rows: 3 }}
          rules={[{ required: true, message: '请输入模板描述' }]}
        />
        <ProFormTextArea
          name="content"
          label="模板内容"
          placeholder="请输入模板内容，使用 {{变量名}} 表示变量"
          fieldProps={{ rows: 8 }}
          rules={[{ required: true, message: '请输入模板内容' }]}
          extra="提示：使用 {{变量名}} 格式定义变量，如 {{customer_name}}"
        />
        <ProFormText
          name="variables"
          label="变量列表"
          placeholder="请输入变量名称，多个用逗号分隔"
          extra="示例：customer_name, product_name, date"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default TemplateList;
