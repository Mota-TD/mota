'use client';

import { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Tabs,
  Form,
  Input,
  Select,
  Switch,
  Upload,
  Avatar,
  Space,
  Divider,
  Table,
  Tag,
  Modal,
  message,
  Popconfirm,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  List,
  TimePicker,
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  BellOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudOutlined,
  KeyOutlined,
  MailOutlined,
  MobileOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  HistoryOutlined,
  DownloadOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

// 用户类型
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'guest';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

// 角色类型
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

// API密钥类型
interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  createdAt: string;
  expiresAt?: string;
}

// 操作日志类型
interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [profileForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // 获取当前用户信息
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const { systemService } = await import('@/services');
        return await systemService.getCurrentUser();
      } catch {
        return null;
      }
    },
  });

  // 获取用户列表
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { memberService } = await import('@/services');
        const response = await memberService.getMembers();
        return (response.records || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          avatar: m.avatar,
          role: m.role || 'member',
          department: m.department || '',
          status: m.status || 'active',
          lastLogin: m.lastLogin || '',
          createdAt: m.createdAt || '',
        }));
      } catch {
        return [];
      }
    },
  });

  // 获取角色列表
  const { data: roles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const { systemService } = await import('@/services');
        return await systemService.getRoles();
      } catch {
        return [];
      }
    },
  });

  // 获取API密钥列表
  const { data: apiKeys } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      try {
        const { systemService } = await import('@/services');
        return await systemService.getApiKeys();
      } catch {
        return [];
      }
    },
  });

  // 获取操作日志
  const { data: auditLogs } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const { systemService } = await import('@/services');
        return await systemService.getAuditLogs();
      } catch {
        return [];
      }
    },
  });

  // 获取系统统计
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      try {
        const { systemService } = await import('@/services');
        return await systemService.getSystemStats();
      } catch {
        return {
          totalUsers: 0,
          activeUsers: 0,
          totalProjects: 0,
          totalTasks: 0,
          storageUsed: 0,
          storageTotal: 10,
          apiCalls: 0,
          lastBackup: '',
        };
      }
    },
  });

  // 更新个人信息
  const updateProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      const { systemService } = await import('@/services');
      return await systemService.updateProfile(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      message.success('个人信息已更新');
    },
  });

  // 创建/更新用户
  const saveUserMutation = useMutation({
    mutationFn: async (values: any) => {
      const { memberService } = await import('@/services');
      if (editingUser) {
        return await memberService.updateMember(editingUser.id, values);
      } else {
        return await memberService.createMember(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsUserModalOpen(false);
      setEditingUser(null);
      userForm.resetFields();
      message.success(editingUser ? '用户已更新' : '用户已创建');
    },
  });

  // 删除用户
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { memberService } = await import('@/services');
      return await memberService.deleteMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('用户已删除');
    },
  });

  // 创建API密钥
  const createApiKeyMutation = useMutation({
    mutationFn: async (values: any) => {
      const { systemService } = await import('@/services');
      return await systemService.createApiKey(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setIsApiKeyModalOpen(false);
      message.success('API密钥已创建');
    },
  });

  // 删除API密钥
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { systemService } = await import('@/services');
      return await systemService.deleteApiKey(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      message.success('API密钥已删除');
    },
  });

  // 用户表格列
  const userColumns = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Space>
          <Avatar src={record.avatar}>{name[0]}</Avatar>
          <div>
            <div>{name}</div>
            <Text type="secondary" className="text-xs">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleConfig: Record<string, { color: string; label: string }> = {
          admin: { color: 'red', label: '管理员' },
          member: { color: 'blue', label: '成员' },
          guest: { color: 'default', label: '访客' },
        };
        return <Tag color={roleConfig[role]?.color}>{roleConfig[role]?.label}</Tag>;
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          active: { color: 'success', label: '活跃' },
          inactive: { color: 'default', label: '未活跃' },
          pending: { color: 'warning', label: '待激活' },
        };
        return <Badge status={statusConfig[status]?.color as any} text={statusConfig[status]?.label} />;
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              userForm.setFieldsValue(record);
              setIsUserModalOpen(true);
            }}
          />
          <Popconfirm
            title="确定要删除此用户吗？"
            onConfirm={() => deleteUserMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 角色表格列
  const roleColumns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
          {name}
          {record.isSystem && <Tag>系统</Tag>}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.slice(0, 3).map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
          {permissions.length > 3 && <Tag>+{permissions.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} disabled={record.isSystem} />
          <Button type="text" danger icon={<DeleteOutlined />} disabled={record.isSystem} />
        </Space>
      ),
    },
  ];

  // 审计日志表格列
  const auditLogColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '目标',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
  ];

  // 渲染个人设置
  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card title="基本信息">
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={currentUser || undefined}
          onFinish={(values) => updateProfileMutation.mutate(values)}
        >
          <Row gutter={24}>
            <Col span={24} className="mb-4 text-center">
              <Avatar size={80} src={currentUser?.avatar}>
                {currentUser?.name?.[0]}
              </Avatar>
              <div className="mt-2">
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="部门">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="职位">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="timezone" label="时区">
                <Select>
                  <Select.Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Select.Option>
                  <Select.Option value="America/New_York">美国东部时间</Select.Option>
                  <Select.Option value="Europe/London">英国时间</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="text-right">
            <Button type="primary" htmlType="submit" loading={updateProfileMutation.isPending}>
              保存修改
            </Button>
          </div>
        </Form>
      </Card>

      <Card title="安全设置">
        <List>
          <List.Item
            actions={[<Button key="change">修改密码</Button>]}
          >
            <List.Item.Meta
              avatar={<LockOutlined className="text-xl" />}
              title="登录密码"
              description="定期修改密码可以提高账户安全性"
            />
          </List.Item>
          <List.Item
            actions={[
              <Switch key="switch" defaultChecked />,
            ]}
          >
            <List.Item.Meta
              avatar={<MobileOutlined className="text-xl" />}
              title="两步验证"
              description="使用手机验证码进行二次验证"
            />
          </List.Item>
          <List.Item
            actions={[<Button key="view">查看</Button>]}
          >
            <List.Item.Meta
              avatar={<HistoryOutlined className="text-xl" />}
              title="登录历史"
              description="查看最近的登录记录"
            />
          </List.Item>
        </List>
      </Card>
    </div>
  );

  // 渲染团队管理
  const renderTeamSettings = () => (
    <div className="space-y-6">
      <Card
        title="成员管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              userForm.resetFields();
              setIsUserModalOpen(true);
            }}
          >
            邀请成员
          </Button>
        }
      >
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          loading={isLoadingUsers}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card
        title="角色管理"
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setIsRoleModalOpen(true)}>
            新建角色
          </Button>
        }
      >
        <Table columns={roleColumns} dataSource={roles} rowKey="id" pagination={false} />
      </Card>
    </div>
  );

  // 渲染系统设置
  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="总用户数" value={systemStats?.totalUsers || 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃用户" value={systemStats?.activeUsers || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="项目数" value={systemStats?.totalProjects || 0} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="API调用" value={systemStats?.apiCalls || 0} prefix={<ApiOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="存储空间">
        <div className="mb-2 flex items-center justify-between">
          <Text>已使用 {systemStats?.storageUsed} GB / {systemStats?.storageTotal} GB</Text>
          <Text type="secondary">
            {((systemStats?.storageUsed || 0) / (systemStats?.storageTotal || 1) * 100).toFixed(1)}%
          </Text>
        </div>
        <Progress
          percent={(systemStats?.storageUsed || 0) / (systemStats?.storageTotal || 1) * 100}
          showInfo={false}
        />
      </Card>

      <Card title="数据备份">
        <Alert
          message={`上次备份时间: ${dayjs(systemStats?.lastBackup).format('YYYY-MM-DD HH:mm')}`}
          type="info"
          showIcon
          className="mb-4"
        />
        <Space>
          <Button icon={<CloudOutlined />}>立即备份</Button>
          <Button icon={<DownloadOutlined />}>下载备份</Button>
          <Button icon={<SyncOutlined />}>恢复数据</Button>
        </Space>
      </Card>

      <Card
        title="API密钥"
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setIsApiKeyModalOpen(true)}>
            创建密钥
          </Button>
        }
      >
        <List
          dataSource={apiKeys}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="copy"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(item.key);
                    message.success('已复制到剪贴板');
                  }}
                />,
                <Popconfirm
                  key="delete"
                  title="确定要删除此密钥吗？"
                  onConfirm={() => deleteApiKeyMutation.mutate(item.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<KeyOutlined className="text-xl" />}
                title={
                  <Space>
                    {item.name}
                    {item.expiresAt && (
                      <Tag color="warning">
                        {dayjs(item.expiresAt).diff(dayjs(), 'day')} 天后过期
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Text code>
                        {showApiKey === item.id ? item.key : item.key.replace(/./g, '*').substring(0, 20) + '...'}
                      </Text>
                      <Button
                        type="text"
                        size="small"
                        icon={showApiKey === item.id ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        onClick={() => setShowApiKey(showApiKey === item.id ? null : item.id)}
                      />
                    </Space>
                    <Text type="secondary" className="text-xs">
                      最后使用: {dayjs(item.lastUsed).fromNow()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  // 渲染审计日志
  const renderAuditLogs = () => (
    <Card
      title="操作日志"
      extra={
        <Space>
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">全部操作</Select.Option>
            <Select.Option value="login">登录</Select.Option>
            <Select.Option value="create">创建</Select.Option>
            <Select.Option value="update">修改</Select.Option>
            <Select.Option value="delete">删除</Select.Option>
          </Select>
          <Button icon={<DownloadOutlined />}>导出</Button>
        </Space>
      }
    >
      <Table
        columns={auditLogColumns}
        dataSource={auditLogs}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );

  return (
    <div className="settings-page">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={3} className="mb-1">
          <SettingOutlined className="mr-2" />
          系统设置
        </Title>
        <Text type="secondary">管理个人信息、团队成员和系统配置</Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabPosition="left"
        items={[
          {
            key: 'profile',
            label: (
              <span>
                <UserOutlined />
                个人设置
              </span>
            ),
            children: renderProfileSettings(),
          },
          {
            key: 'team',
            label: (
              <span>
                <TeamOutlined />
                团队管理
              </span>
            ),
            children: renderTeamSettings(),
          },
          {
            key: 'system',
            label: (
              <span>
                <DatabaseOutlined />
                系统设置
              </span>
            ),
            children: renderSystemSettings(),
          },
          {
            key: 'audit',
            label: (
              <span>
                <SafetyOutlined />
                审计日志
              </span>
            ),
            children: renderAuditLogs(),
          },
        ]}
      />

      {/* 用户编辑弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '邀请成员'}
        open={isUserModalOpen}
        onCancel={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onOk={() => userForm.submit()}
        confirmLoading={saveUserMutation.isPending}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={(values) => saveUserMutation.mutate(values)}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="member">成员</Select.Option>
              <Select.Option value="guest">访客</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="部门">
            <Select>
              <Select.Option value="技术部">技术部</Select.Option>
              <Select.Option value="产品部">产品部</Select.Option>
              <Select.Option value="设计部">设计部</Select.Option>
              <Select.Option value="市场部">市场部</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色编辑弹窗 */}
      <Modal
        title="新建角色"
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={() => roleForm.submit()}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="permissions" label="权限">
            <Select mode="multiple" placeholder="选择权限">
              <Select.Option value="project:*">项目管理</Select.Option>
              <Select.Option value="task:*">任务管理</Select.Option>
              <Select.Option value="document:*">文档管理</Select.Option>
              <Select.Option value="member:*">成员管理</Select.Option>
              <Select.Option value="settings:*">系统设置</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* API密钥创建弹窗 */}
      <Modal
        title="创建API密钥"
        open={isApiKeyModalOpen}
        onCancel={() => setIsApiKeyModalOpen(false)}
        onOk={() => createApiKeyMutation.mutate({})}
        confirmLoading={createApiKeyMutation.isPending}
      >
        <Form layout="vertical">
          <Form.Item name="name" label="密钥名称" rules={[{ required: true }]}>
            <Input placeholder="例如：生产环境" />
          </Form.Item>
          <Form.Item name="permissions" label="权限">
            <Select mode="multiple" placeholder="选择权限">
              <Select.Option value="read">读取</Select.Option>
              <Select.Option value="write">写入</Select.Option>
              <Select.Option value="delete">删除</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="expiresAt" label="过期时间">
            <Select placeholder="选择过期时间">
              <Select.Option value="30">30天</Select.Option>
              <Select.Option value="90">90天</Select.Option>
              <Select.Option value="365">1年</Select.Option>
              <Select.Option value="never">永不过期</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}