import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Tag,
  Tree,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useRef, useState } from 'react';

// 角色类型定义
interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 权限树节点
const permissionTree: DataNode[] = [
  {
    title: '仪表盘',
    key: 'dashboard',
    children: [
      { title: '数据概览', key: 'dashboard:overview' },
      { title: '实时监控', key: 'dashboard:monitor' },
      { title: '数据分析', key: 'dashboard:analysis' },
    ],
  },
  {
    title: '租户管理',
    key: 'tenant',
    children: [
      { title: '租户列表', key: 'tenant:list' },
      { title: '租户详情', key: 'tenant:detail' },
      { title: '套餐管理', key: 'tenant:package' },
      { title: '订单管理', key: 'tenant:order' },
      { title: '创建租户', key: 'tenant:create' },
      { title: '编辑租户', key: 'tenant:edit' },
      { title: '删除租户', key: 'tenant:delete' },
    ],
  },
  {
    title: '用户管理',
    key: 'user',
    children: [
      { title: '用户列表', key: 'user:list' },
      { title: '用户详情', key: 'user:detail' },
      { title: '用户反馈', key: 'user:feedback' },
      { title: '创建用户', key: 'user:create' },
      { title: '编辑用户', key: 'user:edit' },
      { title: '删除用户', key: 'user:delete' },
      { title: '重置密码', key: 'user:reset-password' },
    ],
  },
  {
    title: '内容管理',
    key: 'content',
    children: [
      { title: '新闻列表', key: 'content:news:list' },
      { title: '新闻编辑', key: 'content:news:edit' },
      { title: '模板管理', key: 'content:template' },
      { title: '内容审核', key: 'content:audit' },
    ],
  },
  {
    title: 'AI管理',
    key: 'ai',
    children: [
      { title: '模型列表', key: 'ai:model:list' },
      { title: '使用统计', key: 'ai:usage' },
      { title: '成本控制', key: 'ai:cost' },
      { title: '配置模型', key: 'ai:model:config' },
    ],
  },
  {
    title: '系统管理',
    key: 'system',
    children: [
      { title: '系统配置', key: 'system:config' },
      { title: '角色管理', key: 'system:role' },
      { title: '操作日志', key: 'system:log' },
      { title: '系统监控', key: 'system:monitor' },
    ],
  },
  {
    title: '数据分析',
    key: 'analysis',
    children: [
      { title: '用户分析', key: 'analysis:user' },
      { title: '行为分析', key: 'analysis:behavior' },
      { title: '自定义报表', key: 'analysis:report' },
    ],
  },
];

const RoleManagement: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const actionRef = useRef<ActionType>(null);

  // 模拟角色数据
  const mockData: Role[] = [
    {
      id: 1,
      name: '超级管理员',
      code: 'admin',
      description: '拥有系统所有权限',
      userCount: 3,
      permissions: [
        'dashboard',
        'tenant',
        'user',
        'content',
        'ai',
        'system',
        'analysis',
      ],
      status: 'active',
      createdAt: '2024-01-01 00:00:00',
      updatedAt: '2024-02-01 10:00:00',
    },
    {
      id: 2,
      name: '运营管理员',
      code: 'operator',
      description: '负责租户和用户管理',
      userCount: 8,
      permissions: ['dashboard', 'tenant', 'user', 'content'],
      status: 'active',
      createdAt: '2024-01-15 10:00:00',
      updatedAt: '2024-01-30 15:00:00',
    },
    {
      id: 3,
      name: '客服人员',
      code: 'support',
      description: '负责用户支持和反馈处理',
      userCount: 15,
      permissions: ['user:list', 'user:detail', 'user:feedback'],
      status: 'active',
      createdAt: '2024-01-20 11:00:00',
      updatedAt: '2024-01-28 14:00:00',
    },
    {
      id: 4,
      name: '数据分析师',
      code: 'analyst',
      description: '负责数据分析和报表',
      userCount: 5,
      permissions: ['dashboard', 'analysis'],
      status: 'active',
      createdAt: '2024-01-25 09:00:00',
      updatedAt: '2024-02-01 16:00:00',
    },
    {
      id: 5,
      name: '观察者',
      code: 'viewer',
      description: '只读权限，仅能查看数据',
      userCount: 12,
      permissions: ['dashboard:overview'],
      status: 'inactive',
      createdAt: '2024-01-10 08:00:00',
      updatedAt: '2024-01-15 12:00:00',
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
    if (params.code) {
      filteredData = filteredData.filter((item) =>
        item.code.toLowerCase().includes(params.code.toLowerCase()),
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

  // 删除角色
  const handleDelete = async (_id: number) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的角色');
      return;
    }
    message.success(`已删除 ${selectedRowKeys.length} 个角色`);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  // 编辑角色
  const handleEdit = (record: Role) => {
    setCurrentRole(record);
    setEditModalVisible(true);
  };

  // 配置权限
  const handleConfigPermission = (record: Role) => {
    setCurrentRole(record);
    setCheckedKeys(record.permissions);
    setPermissionModalVisible(true);
  };

  // 保存权限配置
  const handleSavePermissions = () => {
    message.success('权限配置已保存');
    setPermissionModalVisible(false);
    actionRef.current?.reload();
  };

  // 表格列定义
  const columns: ProColumns<Role>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 150,
      render: (_, record) => (
        <a onClick={() => handleEdit(record)}>{record.name}</a>
      ),
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 250,
      search: false,
      ellipsis: true,
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      width: 100,
      search: false,
      sorter: true,
      render: (text) => `${text} 人`,
    },
    {
      title: '权限数量',
      width: 100,
      search: false,
      render: (_, record) => `${record.permissions.length} 项`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '启用', status: 'Success' },
        inactive: { text: '停用', status: 'Default' },
      },
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
      width: 200,
      fixed: 'right',
      render: (_, record) => [
        <a key="edit" onClick={() => handleEdit(record)}>
          编辑
        </a>,
        <a key="permission" onClick={() => handleConfigPermission(record)}>
          配置权限
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这个角色吗？"
          description="删除后该角色下的用户将失去相应权限"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
          disabled={record.code === 'admin'}
        >
          <a style={{ color: record.code === 'admin' ? '#ccc' : 'red' }}>
            删除
          </a>
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
            <Statistic title="角色总数" value={mockData.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="启用角色"
              value={mockData.filter((r) => r.status === 'active').length}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={mockData.reduce((sum, r) => sum + r.userCount, 0)}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均权限数"
              value={(
                mockData.reduce((sum, r) => sum + r.permissions.length, 0) /
                mockData.length
              ).toFixed(1)}
              suffix="项"
            />
          </Card>
        </Col>
      </Row>

      {/* 表格 */}
      <ProTable<Role>
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
            <Popconfirm
              title="确定要删除选中的角色吗？"
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
        scroll={{ x: 1300 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建角色
          </Button>,
        ]}
      />

      {/* 新建角色对话框 */}
      <ModalForm
        title="新建角色"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          console.log('新建角色:', values);
          message.success('创建成功');
          setCreateModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText
          name="code"
          label="角色编码"
          placeholder="请输入角色编码，如：operator"
          rules={[
            { required: true, message: '请输入角色编码' },
            { pattern: /^[a-z_]+$/, message: '只能使用小写字母和下划线' },
          ]}
          extra="只能使用小写字母和下划线，用于系统识别"
        />
        <ProFormTextArea
          name="description"
          label="角色描述"
          placeholder="请输入角色描述"
          fieldProps={{ rows: 3 }}
        />
        <ProFormTreeSelect
          name="permissions"
          label="权限配置"
          placeholder="请选择权限"
          fieldProps={{
            treeData: permissionTree,
            treeCheckable: true,
            showCheckedStrategy: 'SHOW_PARENT',
            placeholder: '请选择权限',
          }}
          rules={[{ required: true, message: '请选择权限' }]}
        />
      </ModalForm>

      {/* 编辑角色对话框 */}
      <ModalForm
        title="编辑角色"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        initialValues={currentRole || {}}
        onFinish={async (values) => {
          console.log('编辑角色:', values);
          message.success('更新成功');
          setEditModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="name"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText
          name="code"
          label="角色编码"
          placeholder="请输入角色编码"
          disabled
          extra="角色编码创建后不可修改"
        />
        <ProFormTextArea
          name="description"
          label="角色描述"
          placeholder="请输入角色描述"
          fieldProps={{ rows: 3 }}
        />
      </ModalForm>

      {/* 权限配置对话框 */}
      <ModalForm
        title={`配置权限 - ${currentRole?.name}`}
        open={permissionModalVisible}
        onOpenChange={setPermissionModalVisible}
        onFinish={async () => {
          handleSavePermissions();
          return true;
        }}
        width={600}
      >
        <Tree
          checkable
          defaultExpandAll
          checkedKeys={checkedKeys}
          onCheck={(checked) => setCheckedKeys(checked as string[])}
          treeData={permissionTree}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default RoleManagement;
