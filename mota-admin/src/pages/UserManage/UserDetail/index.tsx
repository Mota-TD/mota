import {
  ClockCircleOutlined,
  RobotOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import {
  Avatar,
  Badge,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Tabs,
  Tag,
} from 'antd';
import React from 'react';

/**
 * 登录记录类型
 */
interface LoginRecord {
  id: number;
  userId: number;
  loginTime: string;
  loginIp: string;
  location: string;
  device: string;
  browser: string;
  status: 'success' | 'failed';
}

/**
 * 操作日志类型
 */
interface OperationLog {
  id: number;
  userId: number;
  action: string;
  module: string;
  description: string;
  ip: string;
  createdAt: string;
}

/**
 * 用户详情页面
 * 展示用户基本信息、登录记录、操作日志、AI使用统计等
 */
const UserDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  // 模拟用户数据
  const userData = {
    id: Number(userId),
    username: 'admin',
    nickname: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    role: 'admin',
    roleName: '管理员',
    tenantId: 1,
    tenantName: '阿里巴巴集团',
    status: 'active',
    statusText: '正常',
    lastLoginTime: '2024-02-01 10:30:00',
    lastLoginIp: '192.168.1.100',
    lastLoginLocation: '浙江省杭州市',
    loginCount: 256,
    aiUsageCount: 1580,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-02-01 10:30:00',
  };

  // 模拟登录记录
  const mockLoginRecords: LoginRecord[] = [
    {
      id: 1,
      userId: Number(userId),
      loginTime: '2024-02-01 10:30:00',
      loginIp: '192.168.1.100',
      location: '浙江省杭州市',
      device: 'Windows 11',
      browser: 'Chrome 120.0',
      status: 'success',
    },
    {
      id: 2,
      userId: Number(userId),
      loginTime: '2024-02-01 08:15:00',
      loginIp: '192.168.1.100',
      location: '浙江省杭州市',
      device: 'Windows 11',
      browser: 'Chrome 120.0',
      status: 'success',
    },
    {
      id: 3,
      userId: Number(userId),
      loginTime: '2024-01-31 18:45:00',
      loginIp: '192.168.1.105',
      location: '浙江省杭州市',
      device: 'MacOS 14.2',
      browser: 'Safari 17.0',
      status: 'failed',
    },
    {
      id: 4,
      userId: Number(userId),
      loginTime: '2024-01-31 09:20:00',
      loginIp: '192.168.1.100',
      location: '浙江省杭州市',
      device: 'Windows 11',
      browser: 'Chrome 120.0',
      status: 'success',
    },
    {
      id: 5,
      userId: Number(userId),
      loginTime: '2024-01-30 14:30:00',
      loginIp: '192.168.1.100',
      location: '浙江省杭州市',
      device: 'Windows 11',
      browser: 'Chrome 120.0',
      status: 'success',
    },
  ];

  // 模拟操作日志
  const mockOperationLogs: OperationLog[] = [
    {
      id: 1,
      userId: Number(userId),
      action: '创建租户',
      module: '租户管理',
      description: '创建了租户"测试公司"',
      ip: '192.168.1.100',
      createdAt: '2024-02-01 10:30:00',
    },
    {
      id: 2,
      userId: Number(userId),
      action: '编辑用户',
      module: '用户管理',
      description: '修改了用户"张三"的角色权限',
      ip: '192.168.1.100',
      createdAt: '2024-02-01 09:45:00',
    },
    {
      id: 3,
      userId: Number(userId),
      action: '查看订单',
      module: '订单管理',
      description: '查看了订单详情 ORD202402010001',
      ip: '192.168.1.100',
      createdAt: '2024-02-01 09:15:00',
    },
    {
      id: 4,
      userId: Number(userId),
      action: '导出数据',
      module: '数据分析',
      description: '导出了用户行为分析报表',
      ip: '192.168.1.100',
      createdAt: '2024-01-31 16:20:00',
    },
    {
      id: 5,
      userId: Number(userId),
      action: '修改配置',
      module: '系统设置',
      description: '修改了系统通知配置',
      ip: '192.168.1.100',
      createdAt: '2024-01-31 14:00:00',
    },
  ];

  // AI使用统计
  const aiStats = {
    totalUsage: 1580,
    thisMonth: 256,
    avgDaily: 12,
    topModel: 'GPT-4',
  };

  // 登录记录表格列
  const loginColumns: ProColumns<LoginRecord>[] = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      width: 180,
      valueType: 'dateTime',
    },
    {
      title: 'IP地址',
      dataIndex: 'loginIp',
      width: 140,
      copyable: true,
    },
    {
      title: '登录地点',
      dataIndex: 'location',
      width: 150,
    },
    {
      title: '设备',
      dataIndex: 'device',
      width: 120,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Badge
          status={record.status === 'success' ? 'success' : 'error'}
          text={record.status === 'success' ? '成功' : '失败'}
        />
      ),
    },
  ];

  // 操作日志表格列
  const logColumns: ProColumns<OperationLog>[] = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
    },
    {
      title: '操作模块',
      dataIndex: 'module',
      width: 120,
      render: (_, record) => <Tag color="blue">{record.module}</Tag>,
    },
    {
      title: '操作行为',
      dataIndex: 'action',
      width: 120,
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      width: 140,
      copyable: true,
    },
  ];

  return (
    <PageContainer
      title={
        <Space>
          <Avatar src={userData.avatar} size={64} icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {userData.nickname}
            </div>
            <div style={{ fontSize: 14, color: '#999' }}>
              @{userData.username}
            </div>
          </div>
        </Space>
      }
      extra={[
        <Badge
          key="status"
          status={userData.status === 'active' ? 'success' : 'default'}
          text={userData.statusText}
        />,
      ]}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="登录次数"
              value={userData.loginCount}
              suffix="次"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AI使用总量"
              value={aiStats.totalUsage}
              suffix="次"
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月AI使用"
              value={aiStats.thisMonth}
              suffix="次"
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="日均使用"
              value={aiStats.avgDaily}
              suffix="次"
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 基本信息 */}
      <ProCard title="基本信息" style={{ marginBottom: 16 }}>
        <ProDescriptions column={2}>
          <ProDescriptions.Item label="用户ID">
            {userData.id}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="用户名">
            {userData.username}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="昵称">
            {userData.nickname}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="角色">
            <Tag color="red">{userData.roleName}</Tag>
          </ProDescriptions.Item>
          <ProDescriptions.Item label="邮箱" copyable>
            {userData.email}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="手机号" copyable>
            {userData.phone}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="所属租户">
            {userData.tenantName}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="账号状态">
            <Badge
              status={userData.status === 'active' ? 'success' : 'default'}
              text={userData.statusText}
            />
          </ProDescriptions.Item>
          <ProDescriptions.Item label="创建时间">
            {userData.createdAt}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="更新时间">
            {userData.updatedAt}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      {/* 最近登录信息 */}
      <ProCard
        title={
          <Space>
            <SafetyOutlined />
            <span>最近登录信息</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <ProDescriptions column={3}>
          <ProDescriptions.Item label="最后登录时间">
            {userData.lastLoginTime}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="最后登录IP" copyable>
            {userData.lastLoginIp}
          </ProDescriptions.Item>
          <ProDescriptions.Item label="最后登录地点">
            {userData.lastLoginLocation}
          </ProDescriptions.Item>
        </ProDescriptions>
      </ProCard>

      {/* 详细记录标签页 */}
      <ProCard>
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: (
                <span>
                  <ClockCircleOutlined />
                  登录记录
                </span>
              ),
              children: (
                <ProTable<LoginRecord>
                  columns={loginColumns}
                  dataSource={mockLoginRecords}
                  rowKey="id"
                  search={false}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                  }}
                  dateFormatter="string"
                  toolBarRender={false}
                />
              ),
            },
            {
              key: 'operation',
              label: (
                <span>
                  <SafetyOutlined />
                  操作日志
                </span>
              ),
              children: (
                <ProTable<OperationLog>
                  columns={logColumns}
                  dataSource={mockOperationLogs}
                  rowKey="id"
                  search={false}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                  }}
                  dateFormatter="string"
                  toolBarRender={false}
                />
              ),
            },
            {
              key: 'ai',
              label: (
                <span>
                  <RobotOutlined />
                  AI使用统计
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Card title="使用量统计">
                        <ProDescriptions column={1}>
                          <ProDescriptions.Item label="总使用量">
                            {aiStats.totalUsage} 次
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="本月使用">
                            {aiStats.thisMonth} 次
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="日均使用">
                            {aiStats.avgDaily} 次
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label="最常用模型">
                            <Tag color="purple">{aiStats.topModel}</Tag>
                          </ProDescriptions.Item>
                        </ProDescriptions>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="使用趋势">
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '40px 0',
                            color: '#999',
                          }}
                        >
                          使用趋势图表开发中...
                        </div>
                      </Card>
                    </Col>
                  </Row>
                  <Card title="最近使用记录">
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 0',
                        color: '#999',
                      }}
                    >
                      AI使用明细开发中...
                    </div>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </ProCard>
    </PageContainer>
  );
};

export default UserDetail;
