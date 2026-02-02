import {
  ExportOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Avatar,
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
 * 用户数据类型
 */
interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'operator' | 'viewer';
  tenantId: number;
  tenantName: string;
  status: 'active' | 'inactive' | 'locked';
  lastLoginTime?: string;
  lastLoginIp?: string;
  loginCount: number;
  aiUsageCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户列表页面
 * 完整的用户管理功能，包括搜索筛选、批量操作、状态管理等
 */
const UserList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 模拟用户数据
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      nickname: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      avatar:
        'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      role: 'admin',
      tenantId: 1,
      tenantName: '阿里巴巴集团',
      status: 'active',
      lastLoginTime: '2024-02-01 10:30:00',
      lastLoginIp: '192.168.1.100',
      loginCount: 256,
      aiUsageCount: 1580,
      createdAt: '2024-01-01 10:00:00',
      updatedAt: '2024-02-01 10:30:00',
    },
    {
      id: 2,
      username: 'operator01',
      nickname: '运营人员01',
      email: 'operator01@example.com',
      phone: '13800138001',
      role: 'operator',
      tenantId: 1,
      tenantName: '阿里巴巴集团',
      status: 'active',
      lastLoginTime: '2024-02-01 09:15:00',
      lastLoginIp: '192.168.1.101',
      loginCount: 128,
      aiUsageCount: 856,
      createdAt: '2024-01-05 14:20:00',
      updatedAt: '2024-02-01 09:15:00',
    },
    {
      id: 3,
      username: 'viewer01',
      nickname: '观察者01',
      email: 'viewer01@example.com',
      phone: '13800138002',
      role: 'viewer',
      tenantId: 2,
      tenantName: '腾讯科技',
      status: 'active',
      lastLoginTime: '2024-01-31 16:45:00',
      lastLoginIp: '192.168.1.102',
      loginCount: 45,
      aiUsageCount: 234,
      createdAt: '2024-01-10 09:30:00',
      updatedAt: '2024-01-31 16:45:00',
    },
    {
      id: 4,
      username: 'testuser',
      nickname: '测试用户',
      email: 'test@example.com',
      phone: '13800138003',
      role: 'viewer',
      tenantId: 2,
      tenantName: '腾讯科技',
      status: 'inactive',
      lastLoginTime: '2024-01-20 14:00:00',
      lastLoginIp: '192.168.1.103',
      loginCount: 12,
      aiUsageCount: 45,
      createdAt: '2024-01-15 11:00:00',
      updatedAt: '2024-01-25 10:00:00',
    },
    {
      id: 5,
      username: 'lockeduser',
      nickname: '被锁定用户',
      email: 'locked@example.com',
      phone: '13800138004',
      role: 'operator',
      tenantId: 3,
      tenantName: '字节跳动',
      status: 'locked',
      lastLoginTime: '2024-01-15 10:00:00',
      lastLoginIp: '192.168.1.104',
      loginCount: 89,
      aiUsageCount: 567,
      createdAt: '2024-01-08 15:30:00',
      updatedAt: '2024-01-16 09:00:00',
    },
  ];

  // 统计数据
  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.status === 'active').length,
    inactive: mockUsers.filter((u) => u.status === 'inactive').length,
    locked: mockUsers.filter((u) => u.status === 'locked').length,
  };

  // 定义表格列
  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
      fixed: 'left',
    },
    {
      title: '用户信息',
      dataIndex: 'username',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" />
          <div>
            <div>
              <a
                onClick={() => {
                  history.push(`/user-manage/user-detail/${record.id}`);
                }}
              >
                {record.nickname}
              </a>
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              @{record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
      copyable: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      valueType: 'select',
      valueEnum: {
        admin: { text: '管理员', status: 'Error' },
        operator: { text: '运营', status: 'Processing' },
        viewer: { text: '观察者', status: 'Default' },
      },
      render: (_, record) => {
        const roleConfig = {
          admin: { color: 'red', text: '管理员' },
          operator: { color: 'blue', text: '运营' },
          viewer: { color: 'default', text: '观察者' },
        };
        const config = roleConfig[record.role];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '所属租户',
      dataIndex: 'tenantName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '停用', status: 'Default' },
        locked: { text: '锁定', status: 'Error' },
      },
      render: (_, record) => {
        const statusConfig = {
          active: { color: 'success', text: '正常' },
          inactive: { color: 'default', text: '停用' },
          locked: { color: 'error', text: '锁定' },
        };
        const config = statusConfig[record.status];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => (
        <Badge count={record.loginCount} showZero overflowCount={999} />
      ),
    },
    {
      title: 'AI使用',
      dataIndex: 'aiUsageCount',
      width: 100,
      search: false,
      sorter: true,
      render: (_, record) => `${record.aiUsageCount}次`,
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      width: 160,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.lastLoginTime || '-',
    },
    {
      title: '最后登录IP',
      dataIndex: 'lastLoginIp',
      width: 130,
      search: false,
      copyable: true,
      render: (_, record) => record.lastLoginIp || '-',
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
      width: 200,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0} split={<span style={{ color: '#e8e8e8' }}>|</span>}>
          <a
            onClick={() => {
              history.push(`/user-manage/user-detail/${record.id}`);
            }}
          >
            查看
          </a>
          <a
            onClick={() => {
              message.info('编辑功能开发中');
            }}
          >
            编辑
          </a>
          {record.status === 'active' ? (
            <Popconfirm
              title="确认停用该用户？"
              onConfirm={async () => {
                message.success('停用成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#faad14' }}>停用</a>
            </Popconfirm>
          ) : record.status === 'locked' ? (
            <Popconfirm
              title="确认解锁该用户？"
              onConfirm={async () => {
                message.success('解锁成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#52c41a' }}>
                <UnlockOutlined /> 解锁
              </a>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确认启用该用户？"
              onConfirm={async () => {
                message.success('启用成功');
                actionRef.current?.reload();
              }}
            >
              <a style={{ color: '#52c41a' }}>启用</a>
            </Popconfirm>
          )}
          <Popconfirm
            title="确认删除该用户？"
            description="此操作不可恢复"
            onConfirm={async () => {
              message.success('删除成功');
              actionRef.current?.reload();
            }}
          >
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 批量操作
  const handleBatchAction = async (
    action: 'delete' | 'disable' | 'enable' | 'lock',
  ) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的用户');
      return;
    }

    const actionText = {
      delete: '删除',
      disable: '停用',
      enable: '启用',
      lock: '锁定',
    };

    message.success(`批量${actionText[action]}成功`);
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="用户总数" value={stats.total} suffix="人" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="正常用户"
              value={stats.active}
              suffix="人"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="停用用户"
              value={stats.inactive}
              suffix="人"
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="锁定用户"
              value={stats.locked}
              suffix="人"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户列表 */}
      <ProTable<User>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 500));

          let data = [...mockUsers];

          // 搜索过滤
          if (params.username) {
            data = data.filter(
              (item) =>
                item.username.includes(params.username as string) ||
                item.nickname.includes(params.username as string),
            );
          }
          if (params.email) {
            data = data.filter((item) =>
              item.email.includes(params.email as string),
            );
          }
          if (params.phone) {
            data = data.filter((item) =>
              item.phone.includes(params.phone as string),
            );
          }
          if (params.role) {
            data = data.filter((item) => item.role === params.role);
          }
          if (params.status) {
            data = data.filter((item) => item.status === params.status);
          }
          if (params.tenantName) {
            data = data.filter((item) =>
              item.tenantName.includes(params.tenantName as string),
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
          showQuickJumper: true,
        }}
        scroll={{ x: 1800 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建用户
          </Button>,
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={() => message.success('导出功能开发中')}
          >
            导出
          </Button>,
        ]}
        tableAlertRender={({ selectedRowKeys }) => (
          <Space size={24}>
            <span>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a>{' '}
              项
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <a onClick={() => handleBatchAction('enable')}>批量启用</a>
            <a onClick={() => handleBatchAction('disable')}>批量停用</a>
            <a onClick={() => handleBatchAction('lock')}>
              <LockOutlined /> 批量锁定
            </a>
            <a onClick={() => handleBatchAction('delete')}>批量删除</a>
            <a onClick={() => setSelectedRowKeys([])}>取消选择</a>
          </Space>
        )}
      />

      {/* 创建用户弹窗 */}
      <ModalForm
        title="新建用户"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={async (values) => {
          console.log('创建用户:', values);
          message.success('创建成功');
          setCreateModalVisible(false);
          actionRef.current?.reload();
          return true;
        }}
        width={600}
      >
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            {
              pattern: /^[a-zA-Z0-9_-]{4,20}$/,
              message: '用户名为4-20位字母、数字、下划线或横线',
            },
          ]}
        />
        <ProFormText
          name="nickname"
          label="昵称"
          placeholder="请输入昵称"
          rules={[{ required: true, message: '请输入昵称' }]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        />
        <ProFormText
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
          ]}
        />
        <ProFormSelect
          name="role"
          label="角色"
          placeholder="请选择角色"
          rules={[{ required: true, message: '请选择角色' }]}
          options={[
            { label: '管理员', value: 'admin' },
            { label: '运营', value: 'operator' },
            { label: '观察者', value: 'viewer' },
          ]}
        />
        <ProFormSelect
          name="tenantId"
          label="所属租户"
          placeholder="请选择租户"
          rules={[{ required: true, message: '请选择租户' }]}
          request={async () => [
            { label: '阿里巴巴集团', value: 1 },
            { label: '腾讯科技', value: 2 },
            { label: '字节跳动', value: 3 },
          ]}
        />
        <ProFormText.Password
          name="password"
          label="密码"
          placeholder="请输入密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' },
          ]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default UserList;
