import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormDigit,
  ProFormSwitch,
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
 * 套餐数据类型
 */
interface Package {
  id: number;
  name: string;
  code: string;
  price: number;
  duration: number; // 月数
  maxUsers: number;
  storageLimit: number; // GB
  aiQuota: number; // AI调用次数
  features: string[];
  status: 'active' | 'inactive';
  usageCount: number; // 使用该套餐的租户数
  createdAt: string;
  updatedAt: string;
}

/**
 * 套餐管理页面
 * 完整的套餐CRUD功能，包括启用/禁用、使用统计等
 */
const PackageList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);

  // 模拟数据
  const mockData: Package[] = [
    {
      id: 1,
      name: '基础版',
      code: 'basic',
      price: 299,
      duration: 1,
      maxUsers: 10,
      storageLimit: 10,
      aiQuota: 1000,
      features: ['基础AI功能', '10个用户', '10GB存储', '邮件支持'],
      status: 'active',
      usageCount: 15,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-15 15:30:00',
    },
    {
      id: 2,
      name: '专业版',
      code: 'professional',
      price: 999,
      duration: 1,
      maxUsers: 50,
      storageLimit: 50,
      aiQuota: 5000,
      features: ['高级AI功能', '50个用户', '50GB存储', '优先支持', '数据分析'],
      status: 'active',
      usageCount: 28,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-20 09:15:00',
    },
    {
      id: 3,
      name: '企业版',
      code: 'enterprise',
      price: 2999,
      duration: 1,
      maxUsers: 200,
      storageLimit: 200,
      aiQuota: 20000,
      features: [
        '全部AI功能',
        '200个用户',
        '200GB存储',
        '7x24支持',
        '高级分析',
        '定制化',
      ],
      status: 'active',
      usageCount: 12,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-25 14:20:00',
    },
    {
      id: 4,
      name: '旗舰版',
      code: 'ultimate',
      price: 9999,
      duration: 1,
      maxUsers: -1, // 无限制
      storageLimit: 1000,
      aiQuota: 100000,
      features: [
        '全部功能',
        '无限用户',
        '1TB存储',
        '专属支持',
        '私有部署',
        'API访问',
      ],
      status: 'active',
      usageCount: 5,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-02-01 11:00:00',
    },
    {
      id: 5,
      name: '试用版',
      code: 'trial',
      price: 0,
      duration: 1,
      maxUsers: 3,
      storageLimit: 2,
      aiQuota: 100,
      features: ['基础功能', '3个用户', '2GB存储', '7天试用'],
      status: 'inactive',
      usageCount: 0,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-01-10 16:45:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockData.length,
    active: mockData.filter((p) => p.status === 'active').length,
    totalUsers: mockData.reduce((sum, p) => sum + p.usageCount, 0),
    revenue: mockData.reduce((sum, p) => sum + p.price * p.usageCount, 0),
  };

  // 定义表格列
  const columns: ProColumns<Package>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '套餐名称',
      dataIndex: 'name',
      width: 120,
      fixed: 'left',
      render: (_, record) => <strong>{record.name}</strong>,
    },
    {
      title: '套餐编码',
      dataIndex: 'code',
      width: 120,
      copyable: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      search: false,
      render: (_, record) => (
        <span
          style={{
            color: record.price === 0 ? '#999' : '#10B981',
            fontWeight: 'bold',
          }}
        >
          {record.price === 0 ? '免费' : `¥${record.price}/月`}
        </span>
      ),
    },
    {
      title: '用户数限制',
      dataIndex: 'maxUsers',
      width: 110,
      search: false,
      render: (_, record) => (
        <span>{record.maxUsers === -1 ? '无限制' : record.maxUsers}</span>
      ),
    },
    {
      title: '存储空间',
      dataIndex: 'storageLimit',
      width: 100,
      search: false,
      render: (_, record) => `${record.storageLimit}GB`,
    },
    {
      title: 'AI配额',
      dataIndex: 'aiQuota',
      width: 100,
      search: false,
      render: (_, record) => `${(record.aiQuota / 1000).toFixed(1)}K次`,
    },
    {
      title: '功能特性',
      dataIndex: 'features',
      width: 250,
      search: false,
      ellipsis: true,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.features.slice(0, 3).map((feature) => (
            <Tag key={feature} color="blue" style={{ marginRight: 4 }}>
              {feature}
            </Tag>
          ))}
          {record.features.length > 3 && (
            <Tag>+{record.features.length - 3}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '使用量',
      dataIndex: 'usageCount',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => (
        <Badge
          count={record.usageCount}
          showZero
          color={record.usageCount > 0 ? '#22C55E' : '#d9d9d9'}
          overflowCount={999}
        />
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
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentPackage(record);
              setEditModalVisible(true);
            }}
          >
            <EditOutlined /> 编辑
          </a>
          {record.status === 'active' ? (
            <Popconfirm
              title="确认禁用该套餐？"
              description="禁用后新用户将无法选择此套餐"
              onConfirm={async () => {
                message.success('禁用成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#F59E0B' }}>禁用</a>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认启用该套餐？"
              onConfirm={async () => {
                message.success('启用成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#22C55E' }}>启用</a>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除该套餐？"
            description={
              record.usageCount > 0
                ? '该套餐有租户在使用，删除后将影响这些租户'
                : '此操作不可恢复'
            }
            onConfirm={async () => {
              if (record.usageCount > 0) {
                message.error('该套餐有租户在使用，无法删除');
                return;
              }
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <a style={{ color: '#EF4444' }}>
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
            <Statistic title="套餐总数" value={stats.total} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用套餐"
              value={stats.active}
              suffix="个"
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="使用租户" value={stats.totalUsers} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="月度收入"
              value={stats.revenue}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#EF4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 套餐列表 */}
      <ProTable<Package>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockData];

          // 搜索过滤
          if (params.name) {
            data = data.filter((item) =>
              item.name.includes(params.name as string),
            );
          }
          if (params.code) {
            data = data.filter((item) =>
              item.code.includes(params.code as string),
            );
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
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
            新建套餐
          </Button>,
        ]}
      />

      {/* 创建套餐弹窗 */}
      <ModalForm
        title="新建套餐"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          console.log('创建套餐:', values);
          message.success('创建成功');
          setCreateModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={700}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        <ProFormText
          name="name"
          label="套餐名称"
          placeholder="请输入套餐名称"
          rules={[{ required: true, message: '请输入套餐名称' }]}
        />
        <ProFormText
          name="code"
          label="套餐编码"
          placeholder="请输入套餐编码（唯一）"
          rules={[
            { required: true, message: '请输入套餐编码' },
            {
              pattern: /^[a-z0-9_-]+$/,
              message: '只能包含小写字母、数字、下划线和横线',
            },
          ]}
        />
        <ProFormDigit
          name="price"
          label="套餐价格"
          placeholder="请输入套餐价格"
          min={0}
          fieldProps={{ precision: 2, addonAfter: '元/月' }}
          rules={[{ required: true, message: '请输入套餐价格' }]}
        />
        <ProFormDigit
          name="maxUsers"
          label="用户数限制"
          placeholder="请输入用户数限制"
          min={-1}
          initialValue={10}
          tooltip="输入-1表示无限制"
          rules={[{ required: true, message: '请输入用户数限制' }]}
        />
        <ProFormDigit
          name="storageLimit"
          label="存储空间"
          placeholder="请输入存储空间"
          min={1}
          initialValue={10}
          fieldProps={{ addonAfter: 'GB' }}
          rules={[{ required: true, message: '请输入存储空间' }]}
        />
        <ProFormDigit
          name="aiQuota"
          label="AI调用配额"
          placeholder="请输入AI调用配额"
          min={0}
          initialValue={1000}
          fieldProps={{ addonAfter: '次/月' }}
          rules={[{ required: true, message: '请输入AI调用配额' }]}
        />
        <ProFormTextArea
          name="features"
          label="功能特性"
          placeholder="请输入功能特性，每行一个"
          fieldProps={{ rows: 4 }}
          rules={[{ required: true, message: '请输入功能特性' }]}
          tooltip="每行输入一个功能特性"
        />
        <ProFormSwitch
          name="status"
          label="启用状态"
          initialValue={true}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      </ModalForm>

      {/* 编辑套餐弹窗 */}
      <ModalForm
        title="编辑套餐"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={{
          ...currentPackage,
          features: currentPackage?.features.join('\n'),
        }}
        onFinish={async (values) => {
          console.log('编辑套餐:', values);
          message.success('更新成功');
          setEditModalVisible(false);
          setCurrentPackage(null);
          actionRef.current?.reload();
          return true;
        }}
        width={700}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        <ProFormText
          name="name"
          label="套餐名称"
          placeholder="请输入套餐名称"
          rules={[{ required: true, message: '请输入套餐名称' }]}
        />
        <ProFormDigit
          name="price"
          label="套餐价格"
          placeholder="请输入套餐价格"
          min={0}
          fieldProps={{ precision: 2, addonAfter: '元/月' }}
          rules={[{ required: true, message: '请输入套餐价格' }]}
        />
        <ProFormDigit
          name="maxUsers"
          label="用户数限制"
          placeholder="请输入用户数限制"
          min={-1}
          tooltip="输入-1表示无限制"
          rules={[{ required: true, message: '请输入用户数限制' }]}
        />
        <ProFormDigit
          name="storageLimit"
          label="存储空间"
          placeholder="请输入存储空间"
          min={1}
          fieldProps={{ addonAfter: 'GB' }}
          rules={[{ required: true, message: '请输入存储空间' }]}
        />
        <ProFormDigit
          name="aiQuota"
          label="AI调用配额"
          placeholder="请输入AI调用配额"
          min={0}
          fieldProps={{ addonAfter: '次/月' }}
          rules={[{ required: true, message: '请输入AI调用配额' }]}
        />
        <ProFormTextArea
          name="features"
          label="功能特性"
          placeholder="请输入功能特性，每行一个"
          fieldProps={{ rows: 4 }}
          rules={[{ required: true, message: '请输入功能特性' }]}
          tooltip="每行输入一个功能特性"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default PackageList;
