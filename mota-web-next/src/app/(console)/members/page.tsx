'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Avatar,
  Table,
  Tabs,
  Modal,
  Form,
  Select,
  message,
  Dropdown,
  Statistic,
  Badge,
  Tooltip,
  Spin,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  ExportOutlined,
  ImportOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { memberService, departmentService, type Member, type Department } from '@/services';

const { Title, Text } = Typography;

// 统一主题色 - 薄荷绿
const THEME_COLOR = '#10B981';

export default function MembersPage() {
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // 获取成员列表
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await memberService.getMembers();
      setMemberList(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      message.error('获取成员列表失败');
      setMemberList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取部门列表
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, [fetchMembers, fetchDepartments]);

  const handleCreateMember = async () => {
    try {
      const values = await form.validateFields();
      await memberService.createMember(values);
      message.success('成员添加成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchMembers();
    } catch (error) {
      console.error('Failed to create member:', error);
      message.error('成员添加失败');
    }
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      active: { color: 'success', text: '在职', icon: <CheckCircleOutlined /> },
      inactive: { color: 'default', text: '离职', icon: <ClockCircleOutlined /> },
      pending: { color: 'processing', text: '待入职', icon: <ClockCircleOutlined /> },
    };
    const { color, text, icon } = config[status] || { color: 'default', text: status, icon: null };
    return <Tag color={color} icon={icon}>{text}</Tag>;
  };

  const columns: ColumnsType<Member> = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar style={{ backgroundColor: THEME_COLOR }} icon={<UserOutlined />}>
            {name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <Space>
          <TeamOutlined style={{ color: '#64748B' }} />
          {dept}
        </Space>
      ),
    },
    {
      title: '职位',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#64748B' }} />
          {phone || '-'}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'view', label: '查看详情', icon: <UserOutlined /> },
                { key: 'permission', label: '权限设置', icon: <SafetyCertificateOutlined /> },
                { type: 'divider' },
                { key: 'delete', label: '移除成员', icon: <DeleteOutlined />, danger: true },
              ],
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const filteredMembers = memberList.filter((member) => {
    if (searchText && !member.name.includes(searchText) && !member.email.includes(searchText)) {
      return false;
    }
    if (departmentFilter && member.departmentId !== departmentFilter) {
      return false;
    }
    if (statusFilter && member.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // 计算统计数据
  const activeCount = memberList.filter(m => m.status === 'active').length;
  const pendingCount = memberList.filter(m => m.status === 'pending').length;
  const departmentCount = new Set(memberList.map(m => m.departmentId).filter(Boolean)).size;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div style={{
        background: `linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)`,
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TeamOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>成员管理</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>管理团队成员和权限</Text>
          </div>
        </div>
        <Space>
          <Button
            icon={<ImportOutlined />}
            style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'transparent', color: '#fff' }}
          >
            批量导入
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff' }}
          >
            添加成员
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="成员总数"
              value={memberList.length}
              prefix={<TeamOutlined style={{ color: THEME_COLOR }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="在职成员"
              value={activeCount}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="待入职"
              value={pendingCount}
              prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="部门数"
              value={departmentCount}
              prefix={<UserOutlined style={{ color: '#8B5CF6' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 成员列表 */}
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space wrap>
            <Input
              placeholder="搜索成员姓名或邮箱"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              placeholder="选择部门"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 150 }}
              allowClear
              options={departments.map(d => ({ value: d.id, label: d.name }))}
            />
            <Select
              placeholder="状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: 'active', label: '在职' },
                { value: 'pending', label: '待入职' },
                { value: 'inactive', label: '离职' },
              ]}
            />
          </Space>
          <Button icon={<ExportOutlined />}>导出</Button>
        </div>
        {filteredMembers.length === 0 ? (
          <Empty description="暂无成员数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="id"
            pagination={{
              total: filteredMembers.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 名成员`,
            }}
          />
        )}
      </Card>

      {/* 添加成员弹窗 */}
      <Modal
        title={
          <Space>
            <UserAddOutlined style={{ color: THEME_COLOR }} />
            添加成员
          </Space>
        }
        open={createModalVisible}
        onOk={handleCreateMember}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="departmentId"
                label="部门"
                rules={[{ required: true, message: '请选择部门' }]}
              >
                <Select
                  placeholder="请选择部门"
                  options={departments.map(d => ({ value: d.id, label: d.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="职位"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态" initialValue="pending">
            <Select
              options={[
                { value: 'active', label: '在职' },
                { value: 'pending', label: '待入职' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}